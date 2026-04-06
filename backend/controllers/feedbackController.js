const Feedback = require('../models/Feedback');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = asyncHandler(async (req, res) => {
    const { rating, feedback } = req.body;

    if (!rating) {
        throw new ApiError(400, 'Please provide a rating');
    }

    const newFeedback = await Feedback.create({
        user: req.user._id,
        rating,
        feedback
    });

    res.status(201).json({
        success: true,
        data: newFeedback
    });
});
