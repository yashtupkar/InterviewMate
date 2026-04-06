const express = require('express');
const { submitFeedback } = require('../controllers/feedbackController');
const { clerkAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/', clerkAuth, submitFeedback);

module.exports = router;
