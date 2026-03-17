const express = require('express');
const { Webhook } = require('svix');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const GDSession = require('../models/gdSessionModel');
const InterviewSession = require('../models/interviewSessionModel');
const Referral = require('../models/Referral');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/clerk', asyncHandler(async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
        return res.status(500).json({ message: "Webhook secret not configured" });
    }

    // Get the headers
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ message: "No svix headers" });
    }

    // Get the body
    const payload = req.body.toString();
    const headers = {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
    };

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    // Verify the payload with the headers
    try {
        evt = wh.verify(payload, headers);
    } catch (err) {
        console.error("Webhook verification failed:", err.message);
        return res.status(400).json({ message: "Verification failed" });
    }

    const { id: clerkId } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook received: ${eventType} for Clerk User ID: ${clerkId}`);

    if (eventType === 'user.deleted') {
        try {
            // Find user in our DB
            const user = await User.findOne({ clerkId });
            
            if (!user) {
                console.log(`User ${clerkId} not found in our database. Possibly already deleted.`);
                return res.status(200).json({ success: true, message: "User not found in DB" });
            }

            const userId = user._id;

            // Soft Delete logic
            console.log(`Soft deleting user: ${userId}`);

            await User.updateOne(
                { _id: userId },
                { 
                    status: 'deleted',
                    deletedAt: new Date()
                }
            );

            console.log(`User ${userId} marked as deleted. Data will be retained for 30 days.`);

            return res.status(200).json({
                success: true,
                message: `Successfully soft-deleted user ${userId}.`
            });

        } catch (error) {
            console.error("Error during soft delete:", error);
            return res.status(500).json({ message: "Error updating user status" });
        }
    }


    return res.status(200).json({ success: true, message: "Webhook received" });
}));

module.exports = router;
