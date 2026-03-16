const express = require('express');
const router = express.Router();
const { getSubscriptionStatus, createOrder, verifyPayment } = require('../controllers/subscriptionController');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

router.get('/status', ClerkExpressRequireAuth(), getSubscriptionStatus);
router.post('/create-order', ClerkExpressRequireAuth(), createOrder);
router.post('/verify-payment', ClerkExpressRequireAuth(), verifyPayment);

module.exports = router;
