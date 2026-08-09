const rateLimit = require('express-rate-limit');

// A generic key generator that uses the authenticated user's ID if available, otherwise the IP address.
const keyGenerator = (req) => {
    return (req.auth && req.auth.userId) || (req.user && req.user.clerkId) || req.ip;
};

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false, // Disable expensive validation
    message: { success: false, message: 'Too many requests. Please try again later.' },
    keyGenerator
});

const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit AI endpoints to 30 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { success: false, message: 'You have reached the limit for this feature. Please try again in 15 minutes.' },
    keyGenerator
});

const spamRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit public forms to 5 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    message: { success: false, message: 'Too many submissions. Please wait 15 minutes before trying again.' },
    keyGenerator
});

module.exports = {
    globalLimiter,
    aiRateLimiter,
    spamRateLimiter
};
