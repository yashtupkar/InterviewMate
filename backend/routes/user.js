const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const router = express.Router();

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

router.post('/sync', asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const decoded = await clerkClient.verifyToken(token);
    const clerkUser = await clerkClient.users.getUser(decoded.sub);

    const user = await User.findOneAndUpdate(
        { clerkId: clerkUser.id },
        {
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0].emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            avatar: clerkUser.imageUrl,
        },
        { upsert: true, returnDocument: 'after' }
    );

    res.status(200).json({
        success: true,
        message: "User synced successfully",
        user
    });
}));

module.exports = router;
