import React from "react";
import { useResume, TEMPLATE_THEMES } from "../../context/ResumeContext";
import UniversalPopup from "../common/UniversalPopup";
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  Download,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ModernTemplate from "./resume-templates/ModernTemplate";
import ProfessionalTemplate from "./resume-templates/ProfessionalTemplate";
import CreativeTemplate from "./resume-templates/CreativeTemplate";
import ExecutiveTemplate from "./resume-templates/ExecutiveTemplate";
import TechTemplate from "./resume-templates/TechTemplate";
import CorporateTemplate from "./resume-templates/CorporateTemplate";
import ClassicTemplate from "./resume-templates/ClassicTemplate";
import ElegantTemplate from "./resume-templates/ElegantTemplate";
import { Link } from "react-router-dom";

const templates = {
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  creative: CreativeTemplate,
  executive: ExecutiveTemplate,
  tech: TechTemplate,
  corporate: CorporateTemplate,
  classic: ClassicTemplate,
  elegant: ElegantTemplate,
};

const ResumeCardPreview = ({ resume }) => {
  const SelectedTemplate = templates[resume.template] || ModernTemplate;
  const containerRef = React.useRef(null);
  const [scale, setScale] = React.useState(0.2); // Start small, then calculate
  
  // Ensure we have a safe data object for the template
  const safeResume = {
    ...resume,
    personalInfo: resume.personalInfo || {},
    customizations: resume.customizations || {
      colors: { accent: "#bef264", text: "#18181b", background: "#ffffff", applyTo: {} },
      fonts: { body: "Inter", headings: "Inter" },
      layout: { spacing: { fontSize: "10pt", margin: { top: "10mm", left: "10mm", right: "10mm", bottom: "10mm" } } }
    }
  };

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const actualScale = containerWidth / 794; // 794px is A4 width at 96 DPI
      setScale(actualScale);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full bg-white origin-top-left overflow-hidden pointer-events-none opacity-60 group-hover:opacity-80 transition-opacity"
    >
      <div style={{
        width: `794px`,
        height: `1123px`,
        transform: `scale(${scale})`, 
        transformOrigin: 'top left',
        backgroundColor: '#fff',
      }}>
        <SelectedTemplate data={safeResume} />
      </div>
    </div>
  );
};

const DUMMY_RESUME_DATA = {
  title: "Preview",
  template: "modern",
  personalInfo: {
    fullName: "JONATHAN DOE",
    jobTitle: "SENIOR SOFTWARE ENGINEER",
    email: "jonathan.doe@example.com",
    phone: "+1 (555) 000-1111",
    location: "San Francisco, CA",
    photoUrl: "/dummy-avatar.png",
    objective: "Results-oriented Senior Software Engineer with over 8 years of experience in designing and implementing scalable web applications. Proven track record of leading development teams, optimizing system performance, and delivering high-quality user experiences. Expertise in React, Node.js, and cloud-native architectures."
  },
  experience: [
    {
      company: "Tech Innovators Inc.",
      title: "Lead Software Architect",
      location: "San Francisco, CA",
      startDate: "2021-03-01",
      current: true,
      description: "Implemented a microservices architecture that reduced server costs by 35%.\nLed a team of 12 engineers in the successful rollout of an AI-driven analytics dashboard.\nCollaborated with product teams to define technical roadmaps and ensure architectural integrity."
    },
    {
      company: "Global Stack Solutions",
      title: "Senior Full Stack Developer",
      location: "New York, NY",
      startDate: "2018-06-01",
      endDate: "2021-02-28",
      description: "Developed and maintained a high-traffic fintech platform serving 500k+ active users.\nOptimized database queries and API response times, resulting in a 50% performance improvement.\nDesigned reusable UI components and a design system used across 5 core products."
    },
    {
      company: "Innovate AI",
      title: "Software Engineer II",
      location: "Austin, TX",
      startDate: "2015-01-15",
      endDate: "2018-05-30",
      description: "Built the initial prototype of an NLP-based customer service tool.\nImplemented secure authentication flows and automated testing pipelines.\nCollaborated in an agile environment to deliver bi-weekly feature updates."
    }
  ],
  education: [
    {
      institution: "Stanford University",
      degree: "M.S. in Computer Science (Specialization in AI)",
      startDate: "2013-09-01",
      endDate: "2015-05-15",
      location: "Stanford, CA"
    },
    {
      institution: "University of Texas at Austin",
      degree: "B.S. in Computer Science",
      startDate: "2009-08-20",
      endDate: "2013-05-20",
      location: "Austin, TX"
    }
  ],
  skills: [
    { category: "Frontend", subSkills: "React, Next.js, Redux, TailwindCSS, TypeScript, Webpack" },
    { category: "Backend", subSkills: "Node.js, Express, Python, Go, GraphQL, REST APIs" },
    { category: "Database/Cloud", subSkills: "PostgreSQL, MongoDB, AWS (EC2, S3, Lambda), Redis, Docker" },
    { category: "Tools", subSkills: "Git, Jira, Figma, Jenkins, Postman, CI/CD" }
  ],
  projects: [
    {
      title: "SmartScribe AI",
      link: "https://github.com/jdoe/smartscribe",
      description: "An open-source real-time transcription tool using OpenAI Whisper API.\nFeatures cross-platform support and high-fidelity output."
    },
    {
      title: "CloudGuard Pro",
      link: "https://cloudguard.io",
      description: "A security auditing tool for AWS infrastructure that identifies misconfigurations.\nUsed by over 200 small-to-medium enterprises."
    }
  ],
  languages: [
    { language: "English", level: 5 },
    { language: "Spanish", level: 3 },
    { language: "French", level: 2 }
  ],
  customizations: {
    colors: {
      accent: "#bef264",
      text: "#18181b",
      background: "#ffffff",
      applyTo: { name: true, jobTitle: true, headings: true, headingsLine: true }
    },
    fonts: { body: "Inter", headings: "Inter" },
    layout: {
      spacing: {
        fontSize: "10pt",
        margin: { top: "10mm", left: "10mm", right: "10mm", bottom: "10mm" }
      }
    },
    sectionHeadings: { capitalization: "uppercase" },
    entryLayout: { subtitleStyle: "bold", listStyle: "bullet" }
  }
};

// TEMPLATE_THEMES moved to ResumeContext.jsx

// TemplateSelectionModal removed in favor of inline TemplateSelector view

const UpgradeModal = ({ isOpen, onClose }) => {
  return (
    <UniversalPopup
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      className="!bg-zinc-900 !border-zinc-800 !rounded-[2rem] shadow-2xl relative"
      showClose={false}
    >
      {/* Custom X Button (Dark Theme) */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white transition-all shadow-sm bg-zinc-800/50"
      >
        <span className="text-xl leading-none">×</span>
      </button>

      <div className="flex flex-col items-start p-2 pr-12">
        <h2 className="text-2xl font-black text-white mb-4 tracking-tight leading-tight">
          Need more than <br /> two resume?
        </h2>
        
        <p className="text-zinc-400 text-sm font-medium mb-10 leading-relaxed pr-4">
          Your free plan includes only two resume. Upgrade to create another.
        </p>

        <button 
          className="bg-[#bef264] hover:bg-[#d9ff96] text-black px-4 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-lg shadow-lime-400/10 active:scale-[0.98]"
          onClick={() => window.location.href = "/pricing"}
        >
          Discover our plans <span className="transform -rotate-12">🚀</span>
        </button>
      </div>
    </UniversalPopup>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <UniversalPopup
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      className="!bg-zinc-900 !border-zinc-800 !rounded-[2rem] shadow-2xl relative"
      showClose={false}
    >
      <div className="flex flex-col items-start ">
        {/* <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 text-red-500">
          <Trash2 className="w-6 h-6" />
        </div> */}

        <h2 className="text-2xl font-black text-white mb-4 tracking-tight leading-tight">
          Delete Resume?
        </h2>
        
        <p className="text-zinc-400 text-sm font-medium mb-10 leading-relaxed pr-4">
          This action cannot be undone. All data for this resume will be permanently removed.
        </p>

        <div className="flex items-center gap-3 w-full">
          <button 
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-black text-sm transition-all active:scale-[0.98]"
            onClick={onConfirm}
          >
            Delete Permanently
          </button>
          <button 
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-4 rounded-xl font-black text-sm transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </UniversalPopup>
  );
};

const ResumeDashboard = ({ onNew, onEdit }) => {
  const { resumes, isLoading, deleteResume } = useResume();
  const [view, setView] = React.useState("dashboard"); // 'dashboard' or 'templates'
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState(null);

  if (isLoading && resumes.length === 0) {
    return (
      <div className="flex-1 flex items-center h-screen justify-center ">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (view === "templates") {
    return (
      <div className="flex-1  p-6 md:p-10 overflow-y-auto custom-scrollbar animate-fade">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <div className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">
                Template Selection
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Choose your <span className="text-[#bef264] italic">Style</span>
              </h1>
              <p className="text-zinc-500 font-medium text-md mt-4">
                Select a professional layout to start your journey
              </p>
            </div>
            <button
              onClick={() => setView("dashboard")}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl border border-zinc-800 font-bold text-sm transition-all flex items-center gap-2 group"
            >
              <Plus className="w-5 h-5 rotate-45 group-hover:rotate-[135deg] transition-transform" />
              Back to Dashboard
            </button>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Object.keys(templates).map((key) => {
              const themeColor = TEMPLATE_THEMES[key] || "#bef264";
              const customData = {
                ...DUMMY_RESUME_DATA,
                template: key,
                customizations: {
                  ...DUMMY_RESUME_DATA.customizations,
                  colors: {
                    ...DUMMY_RESUME_DATA.customizations.colors,
                    accent: themeColor,
                  },
                },
              };

              return (
                <div key={key} className="group flex flex-col">
                  <div
                    className="relative aspect-[210/297] bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden cursor-pointer transform group-hover:-translate-y-2 transition-all duration-500"
                    onClick={() => onNew(key)}
                  >
                    <ResumeCardPreview resume={customData} />
                    <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div
                        className="bg-white text-zinc-950 px-6 py-2 rounded-xl font-black text-[10px] tracking-[0.2em] shadow-2xl border-b-4 border-zinc-200 active:border-b-0 active:translate-y-1 transition-all"
                        style={{ color: themeColor }}
                      >
                        USE THIS TEMPLATE
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col items-center">
                    <h3 className="font-bold text-zinc-400 group-hover:text-white capitalize transition-colors flex items-center gap-3 text-sm tracking-wide">
                      {key}
                      <div
                        className="w-1.5 h-1.5 rounded-full ring-[4px] ring-zinc-900"
                        style={{ backgroundColor: themeColor }}
                      ></div>
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-transparent p-6 md:p-10 overflow-y-auto custom-scrollbar animate-fade">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <div className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">
            Resume Builder
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Build your <span className="text-[#bef264] italic">ATS Friendly</span> Resumes
          
          </h1>
          <p className="text-zinc-500 font-medium text-md mt-4">
            Your first resume is free forever. Need more than two resume?{" "}
            <Link to={"/pricing"}  className="text-lime-400 hover:underline">
              Upgrade your plan
            </Link>
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* New Resume Card (Matches image style) */}
          <button
            onClick={() => {
              if (resumes.length >= 2) {
                setShowUpgradeModal(true);
              } else {
                setView("templates");
              }
            }}
            className="group relative aspect-[210/297] bg-black rounded-2xl border-2 border-dashed border-zinc-700 hover:border-lime-400/50 hover:bg-lime-400/5 transition-all flex flex-col items-center justify-center gap-3"
          >
            <div className="text-zinc-500 group-hover:text-lime-400 transition-colors">
              <Plus className="w-10 h-10 stroke-[1.5]" />
            </div>
            <span className="text-base font-bold text-zinc-500 group-hover:text-white transition-colors tracking-tight">
              New resume
            </span>
          </button>

          {/* Resume Cards */}
          {resumes.map((resume) => (
            <div key={resume._id} className="group flex flex-col">
              <div
                className="relative aspect-[210/297] bg-zinc-800 rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-lime-400/10 transition-all overflow-hidden cursor-pointer mb-3 border border-zinc-800"
                onClick={() => onEdit(resume._id)}
              >
                {/* Real Resume Preview */}
                <ResumeCardPreview resume={resume} />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-lime-400 text-zinc-950 px-5 py-2 rounded-xl font-black text-xs tracking-wider flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl">
                    <Edit2 className="w-3.5 h-3.5" /> EDIT
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between px-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate text-base leading-tight group-hover:text-lime-400 transition-colors">
                    {resume.title || "Resume 1"}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                    <span>
                      edited {formatDistanceToNow(new Date(resume.updatedAt))}{" "}
                      ago
                    </span>
                    <span className="text-zinc-800">•</span>
                    <span>A4</span>
                  </div>
                </div>
                <div className="relative group/menu ml-2">
                  <button className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 p-1.5 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50">
                    <button
                      onClick={() => onEdit(resume._id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-lime-400" /> Edit
                      Resume
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg transition-all">
                      <Download className="w-3.5 h-3.5 text-lime-400" />{" "}
                      Download PDF
                    </button>
                    <div className="h-px bg-zinc-800 my-1.5 mx-1"></div>
                    <button
                      onClick={() => {
                        setDeletingId(resume._id);
                        setShowDeleteModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingId(null);
        }}
        onConfirm={() => {
          if (deletingId) {
            deleteResume(deletingId);
            setShowDeleteModal(false);
            setDeletingId(null);
          }
        }}
      />
    </div>
  );
};

export default ResumeDashboard;
