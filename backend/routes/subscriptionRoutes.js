const express = require('express');
const router = express.Router();
const { 
    getSubscriptionStatus, 
    createOrder, 
    verifyPayment, 
    deductInterviewCredit, 
    deductGdCredit 
} = require('../controllers/subscriptionController');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

router.get('/status', ClerkExpressRequireAuth(), getSubscriptionStatus);
router.post('/create-order', ClerkExpressRequireAuth(), createOrder);
router.post('/verify-payment', ClerkExpressRequireAuth(), verifyPayment);
router.post('/deduct-interview', ClerkExpressRequireAuth(), deductInterviewCredit);
router.post('/deduct-gd', ClerkExpressRequireAuth(), deductGdCredit);

module.exports = router;
