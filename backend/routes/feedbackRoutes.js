const express = require('express');
const { submitFeedback } = require('../controllers/feedbackController');
const { clerkAuth } = require('../middleware/auth');
const { spamRateLimiter } = require("../middleware/rateLimiters");
const router = express.Router();

router.post('/', clerkAuth, spamRateLimiter, submitFeedback);

module.exports = router;
