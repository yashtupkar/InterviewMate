import React, { useState } from "react";
import {
  IoPerson,
  IoBriefcase,
  IoSchool,
  IoCodeSlash,
  IoFolderOpen,
  IoTrophy,
  IoRibbon,
  IoChevronDown,
  IoChevronForward,
  IoSparkles,
} from "react-icons/io5";
import { Pencil, Check, X } from "lucide-react";
import { useResume } from "../../context/ResumeContext";

import PersonalInfoForm from "./forms/PersonalInfoForm";
import ProfileForm from "./forms/ProfileForm";
import ExperienceForm from "./forms/ExperienceForm";
import EducationForm from "./forms/EducationForm";
import SkillsForm from "./forms/SkillsForm";
import ProjectsForm from "./forms/ProjectsForm";
import AchievementsForm from "./forms/AchievementsForm";
import CertificationsForm from "./forms/CertificationsForm";
import CustomForm from "./forms/CustomForm";
import { Plus } from "lucide-react";

const accordionSections = [
  {
    id: "experience",
    title: "Experience",
    icon: IoBriefcase,
    component: ExperienceForm,
  },
  {
    id: "education",
    title: "Education",
    icon: IoSchool,
    component: EducationForm,
  },
  { id: "skills", title: "Skills", icon: IoCodeSlash, component: SkillsForm },
  {
    id: "projects",
    title: "Projects",
    icon: IoFolderOpen,
    component: ProjectsForm,
  },
  {
    id: "achievements",
    title: "Achievements",
    icon: IoTrophy,
    component: AchievementsForm,
  },
  {
    id: "certifications",
    title: "Certifications",
    icon: IoRibbon,
    component: CertificationsForm,
  },
];

const FormSection = () => {
  const { resumeData, updateSectionTitle, addCustomSection } = useResume();
  const { sectionTitles, customSections = [] } = resumeData;
  const [openSection, setOpenSection] = useState("personal");
  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState("");

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  const handleDone = () => {
    setOpenSection(null);
  };

  const startEditing = (e, id, currentTitle) => {
    e.stopPropagation();
    setEditingId(id);
    setTempTitle(currentTitle);
  };

  const saveTitle = (e, id) => {
    e.stopPropagation();
    updateSectionTitle(id, tempTitle);
    setEditingId(null);
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const sections = [
    {
      id: "personal",
      title: "Personal Details",
      icon: IoPerson,
      component: PersonalInfoForm,
      description: "Your basic contact information",
    },
    {
      id: "profiles",
      title: sectionTitles.profiles || "Profile",
      icon: IoSparkles,
      component: ProfileForm,
      description: "Professional summaries and objectives",
    },
    ...accordionSections.map((s) => ({
      ...s,
      title: sectionTitles[s.id] || s.title,
      description:
        s.id === "experience"
          ? "Work history and roles"
          : s.id === "education"
            ? "Degrees and certifications"
            : s.id === "skills"
              ? "Technical and soft skills"
              : s.id === "projects"
                ? "Notable work and side projects"
                : s.id === "achievements"
                  ? "Honors and recognition"
                  : "Professional certificates",
    })),
    ...customSections.map((s) => ({
      id: s.id,
      title: s.title,
      icon: IoSparkles,
      component: () => <CustomForm sectionId={s.id} sectionTitle={s.title} />,
      description: "Custom content section",
    })),
  ];

  return (
    <div className="p-3 md:p-6 spacing-y-4 md:space-y-6">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 mb-4">
          <IoSparkles className="w-3.5 h-3.5 text-lime-400" />
          <span className="text-[10px] font-bold text-lime-400 uppercase tracking-widest">
            Content Editor
          </span>
        </div>
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
          Resume Details
        </h2>
        <p className="text-sm text-zinc-500 font-medium">
          Fill in your information to generate a professional resume.
        </p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = openSection === section.id;
          const Content = section.component;
          const isEditing = editingId === section.id;

          return (
            <div
              key={section.id}
              className={`group border transition-all duration-300 rounded-2xl relative ${
                isOpen
                  ? "bg-zinc-900 border-zinc-700/50 shadow-xl overflow-visible z-30"
                  : "bg-zinc-800/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 overflow-hidden z-0"
              }`}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-4 p-4 text-left transition-all"
              >
                <div
                  className={`p-2.5 rounded-xl transition-all duration-300 ${
                    isOpen
                      ? "bg-lime-400 text-zinc-950 scale-110 shadow-[0_0_15px_rgba(190,242,100,0.3)]"
                      : "bg-zinc-800 text-white group-hover:text-zinc-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-lime-500 transition-all w-32"
                        autoFocus
                      />
                      <button
                        onClick={(e) => saveTitle(e, section.id)}
                        className="p-1 text-lime-400 hover:scale-110 transition-transform"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-bold text-sm transition-colors ${isOpen ? "text-white" : "text-white group-hover:text-zinc-200"}`}
                      >
                        {section.title}
                      </h3>
                      {isOpen && section.id !== "personal" && (
                        <button
                          onClick={(e) =>
                            startEditing(e, section.id, section.title)
                          }
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-lime-500 transition-colors bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800/50 hover:border-lime-500/30"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit Heading
                        </button>
                      )}
                    </div>
                  )}
                  {!isOpen && (
                    <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                      {section.description}
                    </p>
                  )}
                </div>
                <div
                  className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-lime-400" : "text-zinc-600"}`}
                >
                  <IoChevronDown className="w-4 h-4" />
                </div>
              </button>

              {/* Collapsible Content */}
              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "grid-rows-[1fr] overflow-visible" : "grid-rows-[0fr] overflow-hidden"}`}
              >
                <div
                  className={isOpen ? "overflow-visible" : "overflow-hidden"}
                >
                  <div className="p-5 pt-0 border-t border-zinc-800/50 mt-2 bg-zinc-900/50">
                    <div className="pt-4">
                      <Content
                        onDone={
                          section.id === "personal" ? handleDone : undefined
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          onClick={() => addCustomSection("New Section")}
          className="w-full py-4 bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl font-bold text-zinc-400 flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-white hover:border-lime-500/50 transition-all active:scale-[0.98] group"
        >
          <div className="p-1.5 bg-zinc-800 rounded-lg group-hover:bg-lime-400 group-hover:text-zinc-950 transition-all">
            <Plus className="w-4 h-4" />
          </div>
          Add Custom Section
        </button>
      </div>

      <div className="pt-8 mt-8 border-t border-zinc-800/50">
        <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IoSparkles className="w-12 h-12 text-lime-400" />
          </div>
          <h4 className="text-white font-bold text-sm mb-2 relative z-10">
            AI Writing Assistant
          </h4>
          <p className="text-zinc-400 text-xs leading-relaxed mb-4 relative z-10">
            Need help with your bullet points? Our AI can help you write
            professional descriptions.
          </p>
          <button className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black tracking-widest uppercase rounded-xl border border-zinc-700 transition-all relative z-10">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormSection;
