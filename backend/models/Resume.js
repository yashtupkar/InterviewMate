const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    current: { type: Boolean, default: false },
    description: String,
    visible: { type: Boolean, default: true }
});

const educationSchema = new mongoose.Schema({
    degree: String,
    institution: String,
    location: String,
    startDate: String,
    endDate: String,
    gpa: String,
    description: String,
    visible: { type: Boolean, default: true }
});

const projectSchema = new mongoose.Schema({
    title: String,
    link: String,
    description: String,
    visible: { type: Boolean, default: true }
});

const achievementSchema = new mongoose.Schema({
    title: String,
    date: String,
    description: String,
    visible: { type: Boolean, default: true }
});

const resumeSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Untitled Resume'
    },
    personalInfo: {
        fullName: { type: String, default: '' },
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        jobTitle: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        location: { type: String, default: '' },
        links: [{ label: String, url: String }],
        objective: { type: String, default: '' },
        photoUrl: { type: String, default: '' }
    },
    sectionTitles: {
        objective: { type: String, default: 'Summary' },
        experience: { type: String, default: 'Experience' },
        education: { type: String, default: 'Education' },
        skills: { type: String, default: 'Skills' },
        projects: { type: String, default: 'Projects' },
        achievements: { type: String, default: 'Achievements' },
        certifications: { type: String, default: 'Certifications' }
    },
    template: {
        type: String,
        default: 'modern'
    },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [{
        category: String,
        subSkills: String,
        level: String,
        visible: { type: Boolean, default: true }
    }],
    projects: [projectSchema],
    achievements: [achievementSchema],
    certifications: [{ name: String, issuer: String, date: String, visible: { type: Boolean, default: true } }]
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
