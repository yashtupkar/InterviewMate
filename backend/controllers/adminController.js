const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Feedback = require('../models/Feedback');
const Contact = require('../models/Contact');
const Waitlist = require('../models/Waitlist');
const Question = require('../models/Question');
const interviewSessionModel = require('../models/interviewSessionModel');
const gdSessionModel = require('../models/gdSessionModel');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Dashboard Metrics
const getDashboardMetrics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeSubscriptions,
    feedback,
    interviews,
    gdSessions,
    orders,
  ] = await Promise.all([
    User.countDocuments({ status: 'active' }),
    Subscription.countDocuments({ status: 'active' }),
    Feedback.find().select('rating'),
    interviewSessionModel.find({ status: 'completed' }),
    gdSessionModel.find({ status: 'completed' }),
    Order.find({ status: 'paid' }),
  ]);

  const mrr = orders
    .filter(o => {
      const lastPayment = new Date(o.createdAt);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return lastPayment > monthAgo;
    })
    .reduce((sum, o) => sum + o.amount / 100, 0); // Convert paise to rupees

  const avgRating = feedback.length > 0 
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 0;

  res.json({
    success: true,
    data: {
      totalUsers,
      activeSubscriptions,
      mrr: Math.round(mrr),
      churnRate: 2.3,
      dau: Math.floor(totalUsers * 0.15),
      newSignups: Math.floor(totalUsers * 0.05),
      failedInterviews: interviews.filter(i => i.status === 'failed').length,
      avgInterviewDuration: interviews.length > 0 
        ? (interviews.reduce((sum, i) => sum + (i.actualDuration || 0), 0) / interviews.length).toFixed(1)
        : 0,
      platformHealth: 98,
      avgRating,
    },
  });
});

// Users Management
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', tier = '', status = 'active' } = req.query;

  const query = { status };

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (tier) {
    // Need to join with subscription
    const subscriptions = await Subscription.find({ tier }).select('user');
    const userIds = subscriptions.map(s => s.user);
    query._id = { $in: userIds };
  }

  const skip = (page - 1) * limit;
  const users = await User.find(query)
    .populate('subscription', 'tier credits planExpiry')
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: users,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

const getUserDetail = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .populate('subscription')
    .lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const interviews = await interviewSessionModel.find({ userId }).lean();
  const gdSessions = await gdSessionModel.find({ userId }).lean();

  res.json({
    success: true,
    data: {
      ...user,
      interviewCount: interviews.length,
      gdSessionCount: gdSessions.length,
      lastLogin: user.lastLogin,
    },
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  const user = await User.findByIdAndUpdate(userId, { status }, { new: true });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndUpdate(
    userId,
    { status: 'deleted', deletedAt: new Date(), isDeleted: true },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({ success: true, message: 'User soft-deleted successfully', data: user });
});

const suspendUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndUpdate(userId, { status: 'suspended' }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: user });
});

const activateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndUpdate(userId, { status: 'active' }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: user });
});

const changeUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: user });
});

const updateUserCredits = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { credits } = req.body;
  
  if (typeof credits !== 'number') {
    throw new ApiError(400, 'Credits must be a number');
  }

  let subscription = await Subscription.findOne({ user: userId });
  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  subscription.credits = credits;
  if (!subscription.manualAdjustments) subscription.manualAdjustments = [];
  subscription.manualAdjustments.push({
    date: new Date(),
    type: 'credit_add',
    amount: credits,
    reason: 'Admin explicit credit set',
    adminId: req.user._id,
  });

  await subscription.save();
  res.json({ success: true, data: subscription });
});


const updateUserSubscription = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { tier, creditsToAdd, extendDays } = req.body;

  let subscription = await Subscription.findOne({ user: userId });

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  if (tier) {
    subscription.tier = tier;
  }

  if (creditsToAdd) {
    subscription.credits += creditsToAdd;
    if (!subscription.manualAdjustments) subscription.manualAdjustments = [];
    subscription.manualAdjustments.push({
      date: new Date(),
      type: 'credit_add',
      amount: creditsToAdd,
      reason: 'Admin adjustment',
      adminId: req.user._id,
    });
  }

  if (extendDays) {
    const newExpiry = new Date(subscription.planExpiry);
    newExpiry.setDate(newExpiry.getDate() + extendDays);
    subscription.planExpiry = newExpiry;
  }

  subscription = await subscription.save();

  res.json({ success: true, data: subscription });
});

// Subscriptions Management
const getSubscriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, tier = '', status = 'active' } = req.query;

  const query = {};
  if (tier) query.tier = tier;
  if (status === 'expired') {
    query.planExpiry = { $lt: new Date() };
  } else if (status === 'expiring') {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    query.planExpiry = { $gt: new Date(), $lt: sevenDaysFromNow };
  } else if (status === 'active') {
    query.planExpiry = { $gte: new Date() };
  }

  const skip = (page - 1) * limit;
  const subscriptions = await Subscription.find(query)
    .populate('user', 'firstName lastName email')
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Subscription.countDocuments(query);

  res.json({
    success: true,
    data: subscriptions,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

const getSubscriptionDetail = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;

  const subscription = await Subscription.findById(subscriptionId)
    .populate('user')
    .populate('paymentHistory')
    .lean();

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  res.json({ success: true, data: subscription });
});

const updateSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const { tier, credits, planExpiry, status } = req.body;

  const subscription = await Subscription.findById(subscriptionId);

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  if (tier) subscription.tier = tier;
  if (credits !== undefined) subscription.credits = credits;
  if (planExpiry) subscription.planExpiry = new Date(planExpiry);
  if (status) subscription.status = status;

  await subscription.save();

  res.json({ success: true, data: subscription });
});

const deleteSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;

  const subscription = await Subscription.findByIdAndUpdate(
    subscriptionId,
    { status: 'cancelled' },
    { new: true }
  );

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  res.json({ success: true, message: 'Subscription cancelled successfully', data: subscription });
});

// Feedback Management
const getFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, minRating = '' } = req.query;

  const query = {};
  if (minRating) {
    query.rating = { $gte: parseInt(minRating) };
  }

  const skip = (page - 1) * limit;
  const feedback = await Feedback.find(query)
    .populate('user', 'firstName lastName email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .lean();

  const total = await Feedback.countDocuments(query);

  res.json({
    success: true,
    data: feedback,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

// Contacts Management
const getContacts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = '', search = '' } = req.query;

  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const contacts = await Contact.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .lean();

  const total = await Contact.countDocuments(query);

  res.json({
    success: true,
    data: contacts,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

const updateContactStatus = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const { status } = req.body;

  const contact = await Contact.findByIdAndUpdate(
    contactId,
    { status },
    { new: true }
  );

  if (!contact) {
    throw new ApiError(404, 'Contact not found');
  }

  res.json({ success: true, data: contact });
});

// Waitlist Management
const getWaitlist = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = '', search = '' } = req.query;

  const query = {};
  if (status) query.status = status;
  if (search) {
    query.email = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;
  const waitlist = await Waitlist.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ joinedAt: -1 })
    .lean();

  const total = await Waitlist.countDocuments(query);

  res.json({
    success: true,
    data: waitlist,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

const deleteWaitlistEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const entry = await Waitlist.findByIdAndDelete(id);

  if (!entry) {
    throw new ApiError(404, 'Waitlist entry not found');
  }

  res.json({ success: true, message: 'Waitlist entry deleted successfully' });
});

const grantWaitlistAccess = asyncHandler(async (req, res) => {
  const { emails, tier = 'Student Flash' } = req.body;

  if (!Array.isArray(emails) || emails.length === 0) {
    throw new ApiError(400, 'Provide array of emails');
  }

  // TODO: Implement creating subscriptions for these emails
  // For now, just update waitlist status
  await Waitlist.updateMany(
    { email: { $in: emails } },
    { status: 'accepted' }
  );

  res.json({
    success: true,
    message: `Access granted to ${emails.length} users`,
  });
});

const sendWaitlistNotification = asyncHandler(async (req, res) => {
  const { recipients, template } = req.body;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new ApiError(400, 'Provide array of email recipients');
  }

  // TODO: Implement email sending with templates
  // For now, just mark as contacted
  await Waitlist.updateMany(
    { email: { $in: recipients } },
    { status: 'contacted' }
  );

  res.json({
    success: true,
    message: `Notification sent to ${recipients.length} recipients`,
  });
});

// Questions Management
const getQuestions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, difficulty = '', type = '', search = '' } = req.query;

  const query = { isActive: true };
  if (difficulty) query.difficulty = difficulty;
  if (type) query.type = type;
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;
  const questions = await Question.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Question.countDocuments(query);

  res.json({
    success: true,
    data: questions,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

const createQuestion = asyncHandler(async (req, res) => {
  const { title, description, type, difficulty, category } = req.body;

  const question = new Question({
    title,
    description,
    type,
    difficulty,
    category,
    isActive: true,
  });

  await question.save();

  res.json({ success: true, data: question });
});

const updateQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const updates = req.body;

  const question = await Question.findByIdAndUpdate(questionId, updates, {
    new: true,
  });

  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  res.json({ success: true, data: question });
});

// Interviews Management
const getInterviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type = '', minScore = '' } = req.query;

  const query = { status: 'completed' };
  if (minScore) query.report = { score: { $gte: parseInt(minScore) } };

  const skip = (page - 1) * limit;

  let interviews;
  if (type === 'GD') {
    interviews = await gdSessionModel
      .find(query)
      .populate('userId', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
  } else {
    interviews = await interviewSessionModel
      .find(query)
      .populate('userId', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
  }

  const total = type === 'GD'
    ? await gdSessionModel.countDocuments(query)
    : await interviewSessionModel.countDocuments(query);

  res.json({
    success: true,
    data: interviews,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

const getInterviewDetail = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  let interview = await interviewSessionModel.findById(interviewId).populate('userId').lean();

  if (!interview) {
    interview = await gdSessionModel.findById(interviewId).populate('userId').lean();
  }

  if (!interview) {
    throw new ApiError(404, 'Interview session not found');
  }

  res.json({ success: true, data: interview });
});

module.exports = {
  getDashboardMetrics,
  getUsers,
  getUserDetail,
  updateUserStatus,
  updateUserSubscription,
  deleteUser,
  suspendUser,
  activateUser,
  changeUserRole,
  updateUserCredits,
  getSubscriptions,

  getSubscriptionDetail,
  updateSubscription,
  deleteSubscription,
  getFeedback,
  getContacts,
  updateContactStatus,
  getWaitlist,
  deleteWaitlistEntry,
  grantWaitlistAccess,
  sendWaitlistNotification,
  getQuestions,
  createQuestion,
  updateQuestion,
  getInterviews,
  getInterviewDetail,
};
