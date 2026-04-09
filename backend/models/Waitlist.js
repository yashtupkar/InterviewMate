const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'accepted', 'rejected'],
    default: 'pending'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  // Track admin actions on this entry
  actionLog: [{
    action: { type: String, enum: ['contacted', 'accepted', 'rejected', 'grant_access', 'send_email'] },
    timestamp: { type: Date, default: Date.now },
    adminId: mongoose.Schema.Types.ObjectId,
    notes: String
  }]
});

module.exports = mongoose.model('Waitlist', waitlistSchema);
