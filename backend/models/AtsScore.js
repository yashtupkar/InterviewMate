const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: {
        type: String,
        enum: ['success', 'warning', 'error'],
        default: 'warning'
    }
});

const categorySchema = new mongoose.Schema({
    score: Number,
    issues: [issueSchema]
});

const atsScoreSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    resumeFileName: {
        type: String,
    },
    score: {
        type: Number,
        required: true
    },
    categories: {
        Content: categorySchema,
        Sections: categorySchema,
        ATSEssentials: categorySchema,
        Tailoring: categorySchema
    }
}, { timestamps: true });

module.exports = mongoose.model('AtsScore', atsScoreSchema);
