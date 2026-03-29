const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String, // Problem statement or coding instructions
    required: true
  },
  type: {
    type: String,
    enum: ['theoretical', 'coding', 'behavioral'],
    required: true,
    default: 'theoretical'
  },
  category: { // For behavioral questions (e.g. 'experience', 'teamwork')
    type: String,
    lowercase: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    default: 'medium'
  },
  
  // For theoretical questions
  answerMarkdown: {
    type: String
  },
  
  // For coding questions
  starterCode: {
    type: Map,
    of: String // keys: 'javascript', 'python', 'java', 'c++'
  },
  solutionCode: {
    type: Map,
    of: String // keys: 'javascript', 'python', 'java', 'c++'
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }],

  // Meta tags for advanced filtering
  skills: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  companies: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  domains: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for fast querying (especially useful for AI Agent later)
questionSchema.index({ skills: 1 });
questionSchema.index({ companies: 1 });
questionSchema.index({ domains: 1 });
questionSchema.index({ category: 1 }); // New index for behavioral preparation types
questionSchema.index({ difficulty: 1 });
questionSchema.index({ type: 1 });

module.exports = mongoose.model('Question', questionSchema);
