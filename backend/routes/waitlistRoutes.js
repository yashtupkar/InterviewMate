const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');
const { spamRateLimiter } = require("../middleware/rateLimiters");

// All routes are public for the waitlist
router.post('/join', spamRateLimiter, waitlistController.joinWaitlist);

module.exports = router;
