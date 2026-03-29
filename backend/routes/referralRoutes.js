const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { createClerkClient } = require('@clerk/clerk-sdk-node');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const { clerkAuth: auth } = require('../middleware/auth');

router.get('/stats', auth, referralController.getReferralStats);
router.get('/info/:code', referralController.getReferrerInfo);

module.exports = router;
