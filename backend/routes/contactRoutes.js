const express = require('express');
const { submitContactForm } = require('../controllers/contactController');
const { spamRateLimiter } = require("../middleware/rateLimiters");
const router = express.Router();

router.post('/', spamRateLimiter, submitContactForm);

module.exports = router;
