const Waitlist = require('../models/Waitlist');

exports.joinWaitlist = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if email already exists
    const existing = await Waitlist.findOne({ email });
    if (existing) {
      return res.status(200).json({ success: true, message: 'You are already on the waitlist!' });
    }

    // Save new email
    await Waitlist.create({ email });
    return res.status(201).json({ success: true, message: 'Successfully joined the waitlist!' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ success: true, message: 'You are already on the waitlist!' });
    }
    console.error('Waitlist Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
  }
};
