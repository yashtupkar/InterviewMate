const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');

// All routes are public for the waitlist
router.post('/join', waitlistController.joinWaitlist);

module.exports = router;
