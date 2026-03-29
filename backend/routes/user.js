const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const { generateReferralCode, processReferral } = require('../controllers/referralController');
const router = express.Router();

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

router.post('/sync', asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const decoded = await clerkClient.verifyToken(token);
    const clerkUser = await clerkClient.users.getUser(decoded.sub);
    const email = clerkUser.emailAddresses[0].emailAddress;

    // 1. Check if user exists with current clerkId
    let user = await User.findOne({ clerkId: clerkUser.id });

    // 2. If not found by clerkId, check if a soft-deleted user exists with the same email
    if (!user) {
        user = await User.findOne({ email, status: 'deleted' });
        
        if (user) {
            console.log(`Reactivating soft-deleted account for email: ${email}`);
            user.clerkId = clerkUser.id; // Link new Clerk ID
            user.status = 'active';
            user.deletedAt = undefined;
        }
    }

    // 3. Update or create the user record
    if (user) {
        user.email = email;
        user.firstName = clerkUser.firstName;
        user.lastName = clerkUser.lastName;
        user.avatar = clerkUser.imageUrl;
        user.status = 'active';
        await user.save();
    } else {
        user = await User.create({
            clerkId: clerkUser.id,
            email: email,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            avatar: clerkUser.imageUrl,
            status: 'active'
        });
    }


    const isNewUser = !user.referralCode;
    
    // Auto-create subscription if it doesn't exist
    if (!user.subscription) {
        const subscription = await Subscription.create({ user: user._id });
        user.subscription = subscription._id;
        await user.save();
    }

    // Generate referral code for new users
    if (isNewUser) {
        user.referralCode = await generateReferralCode();
        await user.save();
        
        // Process referral if provided
        if (req.body.referralCode) {
            await processReferral(user._id, req.body.referralCode);
        }
    }

    res.status(200).json({
        success: true,
        message: "User synced successfully",
        user,
        isNewUser
    });
}));

const { clerkAuth } = require('../middleware/auth');

router.get('/profile', clerkAuth, asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
}));

module.exports = router;
