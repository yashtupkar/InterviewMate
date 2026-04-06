const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = asyncHandler(async (req, res) => {
    const { name, email, subject, phone, message } = req.body;

    if (!name || !email || !subject || !message) {
        throw new ApiError(400, 'Please providing all required fields (name, email, subject, message)');
    }

    const newContact = await Contact.create({
        name,
        email,
        subject,
        phone,
        message
    });

    res.status(201).json({
        success: true,
        data: newContact
    });
});
