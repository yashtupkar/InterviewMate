const Subscription = require("../models/Subscription");
const User = require("../models/User");

const TIER_LIMITS = {
    Free: { talkTime: 20, interviews: 2, gdSessions: 3 },
    Pro: { talkTime: 150, interviews: 10, gdSessions: 20 },
    Elite: { talkTime: 500, interviews: 100, gdSessions: 100 }
};

const getSubscriptionStatus = async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.auth.userId }).populate('subscription');
        if (!user) return res.status(404).json({ message: "User not found" });

        let subscription = user.subscription;
        
        // Auto-create Free subscription if missing
        if (!subscription) {
            subscription = await Subscription.create({ user: user._id });
            user.subscription = subscription._id;
            await user.save();
        }

        res.json({
            tier: subscription.tier,
            credits: subscription.credits,
            limits: TIER_LIMITS[subscription.tier] || TIER_LIMITS.Free,
            planExpiry: subscription.planExpiry,
            paymentHistory: subscription.paymentHistory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createOrder = async (req, res) => {
    const { planId, amount } = req.body;
    try {
        const user = await User.findOne({ clerkId: req.auth.userId }).populate('subscription');
        if (!user) return res.status(404).json({ message: "User not found" });

        let subscription = user.subscription;
        if (!subscription) {
            subscription = await Subscription.create({ user: user._id });
            user.subscription = subscription._id;
            await user.save();
        }

        const orderId = `ORD_${Math.random().toString(36).substr(2, 9)}`;
        subscription.paymentHistory.push({ orderId, amount, status: 'pending' });
        await subscription.save();

        res.json({ orderId, amount, currency: 'INR' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyPayment = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        const user = await User.findOne({ clerkId: req.auth.userId }).populate('subscription');
        if (!user) return res.status(404).json({ message: "User not found" });

        const subscription = user.subscription;
        if (!subscription) return res.status(404).json({ message: "Subscription not found" });

        const payment = subscription.paymentHistory.find(p => p.orderId === orderId);
        if (!payment) return res.status(404).json({ message: "Order not found" });

        if (success) {
            payment.status = 'completed';
            
            if (payment.amount >= 1499) {
                subscription.tier = 'Elite';
                subscription.credits = { talkTime: 500, interviews: 100, gdSessions: 100 };
            } else if (payment.amount >= 599) {
                subscription.tier = 'Pro';
                subscription.credits = { talkTime: 150, interviews: 10, gdSessions: 20 };
            }

            if (payment.amount === 149) {
                subscription.credits.interviews += 1;
            } else if (payment.amount === 79) {
                subscription.credits.gdSessions += 1;
            }

            await subscription.save();
            res.json({ message: "Payment verified and account upgraded", tier: subscription.tier });
        } else {
            payment.status = 'failed';
            await subscription.save();
            res.status(400).json({ message: "Payment failed" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deductInterviewCredit = async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.auth.userId }).populate('subscription');
        if (!user) return res.status(404).json({ message: "User not found" });

        const subscription = user.subscription;
        if (!subscription) return res.status(404).json({ message: "Subscription not found" });

        if (subscription.tier === 'Elite') {
            return res.json({ message: "Unlimited credits for Elite plan", credits: subscription.credits });
        }

        if (subscription.credits.interviews > 0) {
            subscription.credits.interviews -= 1;
            await subscription.save();
            res.json({ message: "Interview credit deducted", credits: subscription.credits });
        } else {
            res.status(400).json({ message: "Insufficient interview credits" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deductGdCredit = async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.auth.userId }).populate('subscription');
        if (!user) return res.status(404).json({ message: "User not found" });

        const subscription = user.subscription;
        if (!subscription) return res.status(404).json({ message: "Subscription not found" });

        if (subscription.tier === 'Elite') {
            return res.json({ message: "Unlimited credits for Elite plan", credits: subscription.credits });
        }

        if (subscription.credits.gdSessions > 0) {
            subscription.credits.gdSessions -= 1;
            await subscription.save();
            res.json({ message: "GD session credit deducted", credits: subscription.credits });
        } else {
            res.status(400).json({ message: "Insufficient GD credits" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getSubscriptionStatus, 
    createOrder, 
    verifyPayment, 
    deductInterviewCredit, 
    deductGdCredit 
};
