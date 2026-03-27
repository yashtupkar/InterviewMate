const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    clerkId: { type: String, required: true },
    title: { type: String, default: 'Untitled Resume' },
    template: { type: String, default: 'modern' },
    personalInfo: {
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        fullName: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        location: { type: String, default: '' },
        jobTitle: { type: String, default: '' },
        objective: { type: String, default: '' },
        photoUrl: { type: String, default: '' },
        links: [{
            label: { type: String, default: '' },
            url: { type: String, default: '' }
        }]
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
    experience: [{
        visible: { type: Boolean, default: true },
        title: { type: String, default: '' },
        company: { type: String, default: '' },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' }
    }],
    education: [{
        visible: { type: Boolean, default: true },
        institution: { type: String, default: '' },
        degree: { type: String, default: '' },
        field: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        gpa: { type: String, default: '' },
        location: { type: String, default: '' }
    }],
    skills: [{
        visible: { type: Boolean, default: true },
        category: { type: String, default: '' },
        subSkills: { type: String, default: '' }
    }],
    projects: [{
        visible: { type: Boolean, default: true },
        title: { type: String, default: '' },
        link: { type: String, default: '' },
        githubUrl: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' }
    }],
    achievements: [{
        visible: { type: Boolean, default: true },
        title: { type: String, default: '' },
        date: { type: String, default: '' },
        description: { type: String, default: '' }
    }],
    certifications: [{
        visible: { type: Boolean, default: true },
        name: { type: String, default: '' },
        issuer: { type: String, default: '' },
        date: { type: String, default: '' }
    }],
    profiles: [{
        visible: { type: Boolean, default: true },
        title: { type: String, default: '' },
        content: { type: String, default: '' }
    }],
    customSections: [{
        id: { type: String },
        title: { type: String, default: 'Custom Section' },
        entries: [{
            visible: { type: Boolean, default: true },
            title: { type: String, default: '' },
            subtitle: { type: String, default: '' },
            location: { type: String, default: '' },
            startDate: { type: String, default: '' },
            endDate: { type: String, default: '' },
            content: { type: String, default: '' },
            link: { type: String, default: '' }
        }]
    }],
    customizations: {
        language: { type: String, default: 'English (UK)' },
        dateFormat: { type: String, default: 'DD/MM/YYYY' },
        pageFormat: { type: String, default: 'A4' },
        layout: {
            columns: { type: String, default: 'two' },
            spacing: {
                fontSize: { type: String, default: '10.5pt' },
                lineHeight: { type: Number, default: 1.15 },
                margin: {
                    left: { type: String, default: '22mm' },
                    right: { type: String, default: '22mm' },
                    top: { type: String, default: '12mm' },
                    bottom: { type: String, default: '12mm' }
                },
                spaceBetweenEntries: { type: Number, default: 10 }
            },
        },
        colors: {
            mode: { type: String, default: 'basic' },
            subMode: { type: String, default: 'accent' },
            accent: { type: String, default: '#bef264' },
            text: { type: String, default: '#18181b' },
            background: { type: String, default: '#ffffff' },
            border: {
                style: { type: String, default: 'single' },
                color: { type: String, default: '#e4e4e7' }
            },
            applyTo: {
                name: { type: Boolean, default: true },
                jobTitle: { type: Boolean, default: true },
                headings: { type: Boolean, default: true },
                headingsLine: { type: Boolean, default: true },
                headerIcons: { type: Boolean, default: false },
                dotsBarsBubbles: { type: Boolean, default: false },
                dates: { type: Boolean, default: false },
                entrySubtitle: { type: Boolean, default: false },
                linkIcons: { type: Boolean, default: false }
            }
        },
        fonts: {
            body: { type: String, default: 'Inter' },
            headings: { type: String, default: 'Inter' }
        },
        sectionHeadings: {
            capitalization: { type: String, default: 'uppercase' }
        },
        entryLayout: {
            subtitleStyle: { type: String, default: 'bold' },
            subtitlePlacement: { type: String, default: 'next-line' },
            listStyle: { type: String, default: 'bullet' }
        },
        profileImage: {
            style: { type: String, default: 'rounded' },
            borderRadius: { type: Number, default: 8 },
            size: { type: Number, default: 80 }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
