const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Subscription = require('../models/Subscription');
const GDSession = require('../models/gdSessionModel');
const InterviewSession = require('../models/interviewSessionModel');
const Referral = require('../models/Referral');
const connectDB = require('../config/db');

const cleanupDeletedUsers = async () => {
    try {
        await connectDB();

        const retentionPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
        const cutoffDate = new Date(Date.now() - retentionPeriod);

        console.log(`Searching for users deleted before ${cutoffDate.toISOString()}...`);

        const usersToWipe = await User.find({
            status: 'deleted',
            deletedAt: { $lt: cutoffDate }
        });

        console.log(`Found ${usersToWipe.length} users to permanently delete.`);

        for (const user of usersToWipe) {
            const userId = user._id;
            console.log(`Permanently wiping user: ${userId}`);

            // 1. Delete Subscription
            await Subscription.deleteOne({ user: userId });
            
            // 2. Delete GD Sessions
            await GDSession.deleteMany({ userId: userId });
            
            // 3. Delete Interview Sessions
            await InterviewSession.deleteMany({ userId: userId });
            
            // 4. Delete Referrals
            await Referral.deleteMany({ 
                $or: [{ referrer: userId }, { referee: userId }] 
            });

            // 5. Delete User record
            await User.deleteOne({ _id: userId });

            console.log(`Successfully wiped user: ${userId}`);
        }

        console.log("Cleanup task completed.");
        process.exit(0);
    } catch (error) {
        console.error("Error during cleanup task:", error);
        process.exit(1);
    }
};

cleanupDeletedUsers();
