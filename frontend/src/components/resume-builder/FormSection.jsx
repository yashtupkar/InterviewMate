import React, { useState } from 'react';
import { User, Briefcase, GraduationCap, Code, FolderGit2, Trophy, Award, ChevronDown, ChevronRight } from 'lucide-react';

import PersonalInfoForm from './forms/PersonalInfoForm';
import ExperienceForm from './forms/ExperienceForm';
import EducationForm from './forms/EducationForm';
import SkillsForm from './forms/SkillsForm';
import ProjectsForm from './forms/ProjectsForm';
import AchievementsForm from './forms/AchievementsForm';
import CertificationsForm from './forms/CertificationsForm';

const accordionSections = [
    { id: 'experience', title: 'Work Experience', icon: Briefcase, component: ExperienceForm },
    { id: 'education', title: 'Education', icon: GraduationCap, component: EducationForm },
    { id: 'skills', title: 'Skills', icon: Code, component: SkillsForm },
    { id: 'projects', title: 'Projects', icon: FolderGit2, component: ProjectsForm },
    { id: 'achievements', title: 'Achievements', icon: Trophy, component: AchievementsForm },
    { id: 'certifications', title: 'Certifications', icon: Award, component: CertificationsForm },
];

const FormSection = () => {
    const [openSection, setOpenSection] = useState('personal');

    const toggleSection = (id) => {
        setOpenSection(openSection === id ? null : id);
    };

    const handleDone = () => {
        setOpenSection(null);
    };

    const sections = [
        { id: 'personal', title: 'Personal Details', icon: User, component: PersonalInfoForm },
        ...accordionSections
    ];

    return (
        <div className="p-4 md:p-6 space-y-4">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Resume Details</h2>
                <p className="text-sm text-zinc-400">Fill in your information to generate a professional resume.</p>
            </div>

            <div className="space-y-4">
                {sections.map((section) => {
                    const Icon = section.icon;
                    const isOpen = openSection === section.id;
                    const Content = section.component;

                    return (
                        <div key={section.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 shadow-sm">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isOpen ? 'bg-zinc-800/50' : 'hover:bg-zinc-800/30'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isOpen ? 'bg-lime-400/10 text-lime-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`font-medium ${isOpen ? 'text-white' : 'text-zinc-300'}`}>
                                        {section.title}
                                    </span>
                                </div>
                                {isOpen ? (
                                    <ChevronDown className="w-5 h-5 text-zinc-500" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-zinc-500" />
                                )}
                            </button>

                            {/* Collapsible Content */}
                            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                <div className="overflow-hidden">
                                    <div className="p-4 pt-0 border-t border-zinc-800/50 mt-2">
                                        <Content onDone={section.id === 'personal' ? handleDone : undefined} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FormSection;
