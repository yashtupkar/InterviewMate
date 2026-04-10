const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Feedback = require("../models/Feedback");
const Contact = require("../models/Contact");
const Waitlist = require("../models/Waitlist");
const Question = require("../models/Question");
const interviewSessionModel = require("../models/interviewSessionModel");
const gdSessionModel = require("../models/gdSessionModel");
const Order = require("../models/Order");
const AtsScore = require("../models/AtsScore");
const Resume = require("../models/Resume");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const parseDays = (value, fallback = 30) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, 365);
};

const getSinceDate = (days) => new Date(Date.now() - days * MS_PER_DAY);

const toPercent = (num, den) => {
  if (!den) return 0;
  return Number(((num / den) * 100).toFixed(1));
};

// Dashboard Metrics
const getDashboardMetrics = asyncHandler(async (req, res) => {
  const days = parseDays(req.query.days, 30);
  const since = getSinceDate(days);
  const weekSince = getSinceDate(7);
  const daySince = getSinceDate(1);

  const [
    totalUsers,
    activeUsers,
    activeSubscriptions,
    feedback,
    interviews,
    gdSessions,
    ordersInRange,
    weeklySignups,
    dau,
    cancelledSubscriptions,
    waitlistPending,
    newContacts,
    newWaitlistEntries,
    recentOrders,
    recentUsers,
    recentFeedback,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "active" }),
    Subscription.countDocuments({ status: "active" }),
    Feedback.find({ createdAt: { $gte: since } }).select("rating"),
    interviewSessionModel
      .find({ createdAt: { $gte: since } })
      .select("status actualDuration report.overallScore createdAt")
      .lean(),
    gdSessionModel
      .find({ createdAt: { $gte: since } })
      .select("status duration report.overallScore createdAt")
      .lean(),
    Order.find({ createdAt: { $gte: since } })
      .select("status amount refund.amount paymentDetails.method createdAt")
      .lean(),
    User.countDocuments({ createdAt: { $gte: weekSince } }),
    User.countDocuments({ status: "active", lastLogin: { $gte: daySince } }),
    Subscription.countDocuments({
      status: "cancelled",
      updatedAt: { $gte: since },
    }),
    Waitlist.countDocuments({ status: "pending" }),
    Contact.countDocuments({ createdAt: { $gte: since } }),
    Waitlist.countDocuments({ joinedAt: { $gte: since } }),
    Order.find().sort({ createdAt: -1 }).limit(4).lean(),
    User.find().sort({ createdAt: -1 }).limit(3).lean(),
    Feedback.find().sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  const paidOrders = ordersInRange.filter((o) => o.status === "paid");
  const failedOrders = ordersInRange.filter((o) => o.status === "failed");
  const refundedOrders = ordersInRange.filter((o) => o.status === "refunded");
  const paidRevenue = paidOrders.reduce((sum, o) => sum + o.amount / 100, 0);
  const refundedAmount = refundedOrders.reduce(
    (sum, o) => sum + (o?.refund?.amount || 0) / 100,
    0,
  );

  const monthlySince = getSinceDate(30);
  const mrr = ordersInRange
    .filter((o) => o.status === "paid" && new Date(o.createdAt) >= monthlySince)
    .reduce((sum, o) => sum + o.amount / 100, 0);

  const completedInterviews = interviews.filter(
    (i) => i.status === "completed",
  );
  const failedInterviews = interviews.filter((i) => i.status === "failed");
  const completedGd = gdSessions.filter((i) => i.status === "completed");
  const failedGd = gdSessions.filter((i) => i.status === "analysis_failed");

  const avgInterviewDuration =
    completedInterviews.length > 0
      ? Number(
          (
            completedInterviews.reduce(
              (sum, i) => sum + Number(i.actualDuration || 0),
              0,
            ) / completedInterviews.length
          ).toFixed(1),
        )
      : 0;

  const avgInterviewScore =
    completedInterviews.length > 0
      ? Number(
          (
            completedInterviews.reduce(
              (sum, i) => sum + Number(i?.report?.overallScore || 0),
              0,
            ) / completedInterviews.length
          ).toFixed(1),
        )
      : 0;

  const avgGdScore =
    completedGd.length > 0
      ? Number(
          (
            completedGd.reduce(
              (sum, i) => sum + Number(i?.report?.overallScore || 0),
              0,
            ) / completedGd.length
          ).toFixed(1),
        )
      : 0;

  const totalSubscriptions = await Subscription.countDocuments();
  const churnRate = toPercent(cancelledSubscriptions, totalSubscriptions || 1);

  const platformIncidentCount =
    failedOrders.length + failedInterviews.length + failedGd.length;
  const platformSignalTotal =
    ordersInRange.length + interviews.length + gdSessions.length;
  const platformHealth = Number(
    Math.max(
      0,
      100 - toPercent(platformIncidentCount, platformSignalTotal),
    ).toFixed(1),
  );

  const subscriptionBreakdown = await Subscription.aggregate([
    { $group: { _id: "$tier", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const alerts = [];
  if (churnRate > 8) {
    alerts.push({
      severity: "high",
      label: "High churn detected",
      detail: `${churnRate}% subscriptions cancelled in last ${days} days`,
      route: "/admin/subscriptions",
    });
  }
  if (failedOrders.length > paidOrders.length) {
    alerts.push({
      severity: "high",
      label: "Payment failures are elevated",
      detail: `${failedOrders.length} failed orders vs ${paidOrders.length} paid orders`,
      route: "/admin/subscriptions",
    });
  }
  if (failedInterviews.length + failedGd.length > completedInterviews.length) {
    alerts.push({
      severity: "medium",
      label: "Interview quality degradation",
      detail: `${failedInterviews.length + failedGd.length} failed sessions in selected period`,
      route: "/admin/interviews",
    });
  }
  if (!alerts.length) {
    alerts.push({
      severity: "low",
      label: "No active operational alerts",
      detail: "Key quality and payment metrics are within baseline",
      route: "/admin",
    });
  }

  const avgRating =
    feedback.length > 0
      ? (
          feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
        ).toFixed(1)
      : 0;

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      activeSubscriptions,
      mrr: Math.round(mrr),
      churnRate,
      dau,
      newSignups: weeklySignups,
      failedInterviews: failedInterviews.length + failedGd.length,
      avgInterviewDuration,
      platformHealth,
      avgRating,
      periodDays: days,
      revenue: {
        paidOrders: paidOrders.length,
        failedOrders: failedOrders.length,
        refundedOrders: refundedOrders.length,
        paidRevenue: Math.round(paidRevenue),
        refundedAmount: Math.round(refundedAmount),
      },
      growth: {
        weeklySignups,
        waitlistPending,
        newWaitlistEntries,
        subscriptionBreakdown,
      },
      quality: {
        interviewCompleted: completedInterviews.length,
        interviewFailed: failedInterviews.length,
        gdCompleted: completedGd.length,
        gdFailed: failedGd.length,
        avgInterviewScore,
        avgGdScore,
      },
      support: {
        newContacts,
        feedbackCount: feedback.length,
      },
      alerts,
      activityFeed: [
        ...recentOrders.map((order) => ({
          kind: "order",
          label: `Order ${order.planName}`,
          status: order.status,
          amount: Number((order.amount || 0) / 100),
          createdAt: order.createdAt,
          route: "/admin/subscriptions",
        })),
        ...recentUsers.map((user) => ({
          kind: "user",
          label: `User ${user.firstName || ""} ${user.lastName || ""}`.trim(),
          status: user.status,
          createdAt: user.createdAt,
          route: "/admin/users",
        })),
        ...recentFeedback.map((item) => ({
          kind: "feedback",
          label: `Feedback rating ${item.rating}`,
          status: "received",
          createdAt: item.createdAt,
          route: "/admin/feedback",
        })),
      ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10),
    },
  });
});

// Users Management
const getUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search = "",
    tier = "",
    status = "active",
  } = req.query;

  const query = { status };

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (tier) {
    // Need to join with subscription
    const subscriptions = await Subscription.find({ tier }).select("user");
    const userIds = subscriptions.map((s) => s.user);
    query._id = { $in: userIds };
  }

  const skip = (page - 1) * limit;
  const users = await User.find(query)
    .populate("subscription", "tier credits planExpiry")
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

  const user = await User.findById(userId).populate("subscription").lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const interviews = await interviewSessionModel.find({ userId }).lean();
  const gdSessions = await gdSessionModel.find({ userId }).lean();
  const [totalOrders, paidOrders, failedOrders, refundedOrders, latestOrder] =
    await Promise.all([
      Order.countDocuments({ user: userId }),
      Order.countDocuments({ user: userId, status: "paid" }),
      Order.countDocuments({ user: userId, status: "failed" }),
      Order.countDocuments({ user: userId, status: "refunded" }),
      Order.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
    ]);

  res.json({
    success: true,
    data: {
      ...user,
      interviewCount: interviews.length,
      gdSessionCount: gdSessions.length,
      lastLogin: user.lastLogin,
      billingSummary: {
        totalOrders,
        paidOrders,
        failedOrders,
        refundedOrders,
        latestOrder: latestOrder || null,
      },
    },
  });
});

const getUserBillingHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, status = "" } = req.query;

  const query = { user: userId };
  if (status) {
    query.status = status;
  }

  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Order.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize),
    },
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  const user = await User.findByIdAndUpdate(userId, { status }, { new: true });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndUpdate(
    userId,
    { status: "deleted", deletedAt: new Date(), isDeleted: true },
    { new: true },
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json({
    success: true,
    message: "User soft-deleted successfully",
    data: user,
  });
});

const suspendUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndUpdate(
    userId,
    { status: "suspended" },
    { new: true },
  );
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: user });
});

const activateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndUpdate(
    userId,
    { status: "active" },
    { new: true },
  );
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: user });
});

const changeUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: user });
});

const updateUserCredits = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { credits } = req.body;

  if (typeof credits !== "number") {
    throw new ApiError(400, "Credits must be a number");
  }

  let subscription = await Subscription.findOne({ user: userId });
  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  subscription.credits = credits;
  if (!subscription.manualAdjustments) subscription.manualAdjustments = [];
  subscription.manualAdjustments.push({
    date: new Date(),
    type: "credit_add",
    amount: credits,
    reason: "Admin explicit credit set",
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
    throw new ApiError(404, "Subscription not found");
  }

  if (tier) {
    subscription.tier = tier;
  }

  if (creditsToAdd) {
    subscription.credits += creditsToAdd;
    if (!subscription.manualAdjustments) subscription.manualAdjustments = [];
    subscription.manualAdjustments.push({
      date: new Date(),
      type: "credit_add",
      amount: creditsToAdd,
      reason: "Admin adjustment",
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
  const { page = 1, limit = 20, tier = "", status = "active" } = req.query;

  const query = {};
  if (tier) query.tier = tier;
  if (status === "expired") {
    query.planExpiry = { $lt: new Date() };
  } else if (status === "expiring") {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    query.planExpiry = { $gt: new Date(), $lt: sevenDaysFromNow };
  } else if (status === "active") {
    query.planExpiry = { $gte: new Date() };
  }

  const skip = (page - 1) * limit;
  const subscriptions = await Subscription.find(query)
    .populate("user", "firstName lastName email")
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
    .populate("user")
    .populate("paymentHistory")
    .lean();

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  res.json({ success: true, data: subscription });
});

const updateSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const { tier, credits, planExpiry, status } = req.body;

  const subscription = await Subscription.findById(subscriptionId);

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
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
    { status: "cancelled" },
    { new: true },
  );

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  res.json({
    success: true,
    message: "Subscription cancelled successfully",
    data: subscription,
  });
});

// Feedback Management
const getFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, minRating = "" } = req.query;

  const query = {};
  if (minRating) {
    query.rating = { $gte: parseInt(minRating) };
  }

  const skip = (page - 1) * limit;
  const feedback = await Feedback.find(query)
    .populate("user", "firstName lastName email")
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
  const { page = 1, limit = 20, status = "", search = "" } = req.query;

  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
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
    { new: true },
  );

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  res.json({ success: true, data: contact });
});

// Waitlist Management
const getWaitlist = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = "", search = "" } = req.query;

  const query = {};
  if (status) query.status = status;
  if (search) {
    query.email = { $regex: search, $options: "i" };
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
    throw new ApiError(404, "Waitlist entry not found");
  }

  res.json({ success: true, message: "Waitlist entry deleted successfully" });
});

const grantWaitlistAccess = asyncHandler(async (req, res) => {
  const { emails, tier = "Student Flash" } = req.body;

  if (!Array.isArray(emails) || emails.length === 0) {
    throw new ApiError(400, "Provide array of emails");
  }

  // TODO: Implement creating subscriptions for these emails
  // For now, just update waitlist status
  await Waitlist.updateMany({ email: { $in: emails } }, { status: "accepted" });

  res.json({
    success: true,
    message: `Access granted to ${emails.length} users`,
  });
});

const sendWaitlistNotification = asyncHandler(async (req, res) => {
  const { recipients, template } = req.body;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new ApiError(400, "Provide array of email recipients");
  }

  // TODO: Implement email sending with templates
  // For now, just mark as contacted
  await Waitlist.updateMany(
    { email: { $in: recipients } },
    { status: "contacted" },
  );

  res.json({
    success: true,
    message: `Notification sent to ${recipients.length} recipients`,
  });
});

// Questions Management
const getQuestions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    difficulty = "",
    type = "",
    search = "",
  } = req.query;

  const query = { isActive: true };
  if (difficulty) query.difficulty = difficulty;
  if (type) query.type = type;
  if (search) {
    query.title = { $regex: search, $options: "i" };
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
    throw new ApiError(404, "Question not found");
  }

  res.json({ success: true, data: question });
});

// Interviews Management
const getInterviews = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type = "all",
    minScore = "",
    status = "",
    days = 30,
  } = req.query;

  const pageNumber = Number.parseInt(page, 10);
  const pageSize = Number.parseInt(limit, 10);
  const minScoreValue = minScore === "" ? null : Number(minScore);
  const since = getSinceDate(parseDays(days, 30));

  const baseQuery = { createdAt: { $gte: since } };
  if (status) baseQuery.status = status;
  if (!Number.isNaN(minScoreValue) && minScoreValue !== null) {
    baseQuery["report.overallScore"] = { $gte: minScoreValue };
  }

  const normalizeInterview = (item, sessionType) => ({
    _id: item._id,
    type: sessionType,
    interviewType: item.interviewType || item.category || "general",
    score: Number(item?.report?.overallScore || 0),
    duration: Number(item.actualDuration || item.duration || 0),
    status: item.status,
    createdAt: item.createdAt,
    user: {
      firstName: item?.userId?.firstName || "",
      lastName: item?.userId?.lastName || "",
      email: item?.userId?.email || "",
      avatar: item?.userId?.avatar || "",
    },
  });

  if (type === "Interview" || type === "GD") {
    const model = type === "GD" ? gdSessionModel : interviewSessionModel;
    const rows = await model
      .find(baseQuery)
      .populate("userId", "firstName lastName email avatar")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();
    const total = await model.countDocuments(baseQuery);

    res.json({
      success: true,
      data: rows.map((row) => normalizeInterview(row, type)),
      pagination: { page: pageNumber, limit: pageSize, total },
    });
    return;
  }

  const maxFetch = Math.max(pageNumber * pageSize, 100);
  const [interviewRows, gdRows] = await Promise.all([
    interviewSessionModel
      .find(baseQuery)
      .populate("userId", "firstName lastName email avatar")
      .sort({ createdAt: -1 })
      .limit(maxFetch)
      .lean(),
    gdSessionModel
      .find(baseQuery)
      .populate("userId", "firstName lastName email avatar")
      .sort({ createdAt: -1 })
      .limit(maxFetch)
      .lean(),
  ]);

  const merged = [
    ...interviewRows.map((row) => normalizeInterview(row, "Interview")),
    ...gdRows.map((row) => normalizeInterview(row, "GD")),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const start = (pageNumber - 1) * pageSize;
  const paged = merged.slice(start, start + pageSize);

  res.json({
    success: true,
    data: paged,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total: merged.length,
      note:
        merged.length >= maxFetch * 2
          ? "Combined feed is capped for performance. Use type filter for deep pagination."
          : undefined,
    },
  });
});

const getInterviewOverview = asyncHandler(async (req, res) => {
  const days = parseDays(req.query.days, 30);
  const since = getSinceDate(days);

  const [interviews, gdSessions] = await Promise.all([
    interviewSessionModel
      .find({ createdAt: { $gte: since } })
      .select(
        "status interviewType actualDuration report.overallScore createdAt",
      )
      .lean(),
    gdSessionModel
      .find({ createdAt: { $gte: since } })
      .select("status category duration report.overallScore createdAt")
      .lean(),
  ]);

  const completedInterviews = interviews.filter(
    (row) => row.status === "completed",
  );
  const failedInterviews = interviews.filter((row) => row.status === "failed");
  const completedGd = gdSessions.filter((row) => row.status === "completed");
  const failedGd = gdSessions.filter((row) => row.status === "analysis_failed");

  const avgInterviewScore = completedInterviews.length
    ? Number(
        (
          completedInterviews.reduce(
            (sum, row) => sum + Number(row?.report?.overallScore || 0),
            0,
          ) / completedInterviews.length
        ).toFixed(1),
      )
    : 0;

  const avgGdScore = completedGd.length
    ? Number(
        (
          completedGd.reduce(
            (sum, row) => sum + Number(row?.report?.overallScore || 0),
            0,
          ) / completedGd.length
        ).toFixed(1),
      )
    : 0;

  const avgDuration =
    completedInterviews.length + completedGd.length
      ? Number(
          (
            [...completedInterviews, ...completedGd].reduce(
              (sum, row) =>
                sum + Number(row.actualDuration || row.duration || 0),
              0,
            ) /
            (completedInterviews.length + completedGd.length)
          ).toFixed(1),
        )
      : 0;

  const typeBreakdownMap = {};
  for (const row of completedInterviews) {
    const key = row.interviewType || "general";
    typeBreakdownMap[key] = (typeBreakdownMap[key] || 0) + 1;
  }

  const gdCategoryMap = {};
  for (const row of completedGd) {
    const key = row.category || "general";
    gdCategoryMap[key] = (gdCategoryMap[key] || 0) + 1;
  }

  res.json({
    success: true,
    data: {
      periodDays: days,
      totals: {
        totalSessions: interviews.length + gdSessions.length,
        completed: completedInterviews.length + completedGd.length,
        failed: failedInterviews.length + failedGd.length,
        interviewCount: interviews.length,
        gdCount: gdSessions.length,
      },
      quality: {
        avgInterviewScore,
        avgGdScore,
        avgDuration,
        completionRate: toPercent(
          completedInterviews.length + completedGd.length,
          interviews.length + gdSessions.length,
        ),
      },
      breakdown: {
        interviewTypes: Object.entries(typeBreakdownMap).map(
          ([key, count]) => ({
            key,
            count,
          }),
        ),
        gdCategories: Object.entries(gdCategoryMap).map(([key, count]) => ({
          key,
          count,
        })),
      },
    },
  });
});

const getToolAnalytics = asyncHandler(async (req, res) => {
  const days = parseDays(req.query.days, 30);
  const since = getSinceDate(days);

  const [atsScores, resumes, gdSessions, interviews] = await Promise.all([
    AtsScore.find({ createdAt: { $gte: since } })
      .select("score categories createdAt")
      .lean(),
    Resume.find({ createdAt: { $gte: since } })
      .select("template createdAt updatedAt")
      .lean(),
    gdSessionModel
      .find({ createdAt: { $gte: since } })
      .select("topic category duration report.overallScore createdAt")
      .lean(),
    interviewSessionModel
      .find({ createdAt: { $gte: since } })
      .select(
        "interviewType status report.overallScore actualDuration createdAt",
      )
      .lean(),
  ]);

  const atsAvgScore = atsScores.length
    ? Number(
        (
          atsScores.reduce((sum, row) => sum + Number(row.score || 0), 0) /
          atsScores.length
        ).toFixed(1),
      )
    : 0;

  const issueCountMap = {};
  for (const score of atsScores) {
    const categories = score.categories || {};
    for (const categoryValue of Object.values(categories)) {
      const issues = categoryValue?.issues || [];
      for (const issue of issues) {
        const key = issue.title || "Unknown issue";
        issueCountMap[key] = (issueCountMap[key] || 0) + 1;
      }
    }
  }

  const commonIssues = Object.entries(issueCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([issue, count]) => ({
      issue,
      count,
      percentage: toPercent(count, atsScores.length || 1),
    }));

  const templateUsage = resumes.reduce((acc, row) => {
    const template = row.template || "modern";
    acc[template] = (acc[template] || 0) + 1;
    return acc;
  }, {});
  const mostUsedTemplate =
    Object.entries(templateUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || "n/a";

  const completedGd = gdSessions.filter((row) => row.status === "completed");
  const avgGdScore = completedGd.length
    ? Number(
        (
          completedGd.reduce(
            (sum, row) => sum + Number(row?.report?.overallScore || 0),
            0,
          ) / completedGd.length
        ).toFixed(1),
      )
    : 0;
  const avgGdDuration = completedGd.length
    ? Number(
        (
          completedGd.reduce((sum, row) => sum + Number(row.duration || 0), 0) /
          completedGd.length
        ).toFixed(1),
      )
    : 0;

  const gdTopicUsage = gdSessions.reduce((acc, row) => {
    const key = row.topic || row.category || "general";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topTopics = Object.entries(gdTopicUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  const interviewTypeUsage = interviews.reduce((acc, row) => {
    const key = row.interviewType || "general";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const interviewTypeBreakdown = Object.entries(interviewTypeUsage)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count }));

  res.json({
    success: true,
    data: {
      periodDays: days,
      ats: {
        totalScans: atsScores.length,
        avgScore: atsAvgScore,
        commonIssues,
      },
      resumeBuilder: {
        totalResumes: resumes.length,
        mostUsedTemplate,
        templateUsage: Object.entries(templateUsage).map(([key, count]) => ({
          key,
          count,
        })),
      },
      gd: {
        totalSessions: gdSessions.length,
        avgScore: avgGdScore,
        avgDuration: avgGdDuration,
        topTopics,
      },
      interviews: {
        totalSessions: interviews.length,
        typeBreakdown: interviewTypeBreakdown,
      },
    },
  });
});

const getInterviewDetail = asyncHandler(async (req, res) => {
  const { interviewId } = req.params;

  let interview = await interviewSessionModel
    .findById(interviewId)
    .populate("userId")
    .lean();

  if (!interview) {
    interview = await gdSessionModel
      .findById(interviewId)
      .populate("userId")
      .lean();
  }

  if (!interview) {
    throw new ApiError(404, "Interview session not found");
  }

  res.json({ success: true, data: interview });
});

module.exports = {
  getDashboardMetrics,
  getUsers,
  getUserDetail,
  getUserBillingHistory,
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
  getInterviewOverview,
  getToolAnalytics,
};
