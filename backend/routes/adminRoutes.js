const express = require('express');
const { clerkAuth, isAdmin } = require('../middleware/auth');
const {
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
} = require('../controllers/adminController');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(clerkAuth, isAdmin);

// Dashboard
router.get('/dashboard/metrics', getDashboardMetrics);

// Users Management
router.get('/users', getUsers);
router.get('/users/:userId', getUserDetail);
router.patch('/users/:userId/status', updateUserStatus);
router.patch('/users/:userId/subscription', updateUserSubscription);
router.delete('/users/:userId', deleteUser);

// New specific user actions
router.patch('/users/:userId/suspend', suspendUser);
router.patch('/users/:userId/activate', activateUser);
router.patch('/users/:userId/role', changeUserRole);
router.patch('/users/:userId/credits', updateUserCredits);

// Subscriptions Management
router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/:subscriptionId', getSubscriptionDetail);
router.patch('/subscriptions/:subscriptionId', updateSubscription);
router.delete('/subscriptions/:subscriptionId', deleteSubscription);

// Feedback Management
router.get('/feedback', getFeedback);

// Contacts Management
router.get('/contacts', getContacts);
router.patch('/contacts/:contactId/status', updateContactStatus);

// Waitlist Management
router.get('/waitlist', getWaitlist);
router.delete('/waitlist/:id', deleteWaitlistEntry);
router.post('/waitlist/grant-access', grantWaitlistAccess);
router.post('/waitlist/send-notification', sendWaitlistNotification);

// Questions Management
router.get('/questions', getQuestions);
router.post('/questions', createQuestion);
router.patch('/questions/:questionId', updateQuestion);

// Interviews Management
router.get('/interviews', getInterviews);
router.get('/interviews/:interviewId', getInterviewDetail);

module.exports = router;
