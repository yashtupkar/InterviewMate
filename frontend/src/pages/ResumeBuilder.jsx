import React, { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Download,
  LayoutTemplate,
  Save,
  ChevronLeft,
  MoreVertical,
  LayoutGrid,
  FileText,
  Paintbrush,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { useResume } from "../context/ResumeContext";
import toast from "react-hot-toast";

// Placeholder Form Pane component
import FormSection from "../components/resume-builder/FormSection";
// Placeholder Preview Pane component
import PreviewSection from "../components/resume-builder/PreviewSection";
import CustomizeSection from "../components/resume-builder/CustomizeSection";

import ResumeDashboard from "../components/resume-builder/ResumeDashboard";
import { IoMdColorPalette } from "react-icons/io";

const ResumeBuilder = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    isSaving,
    saveResume,
    createNewResume,
    loadResume,
    resumeData,
    setResumeData,
  } = useResume();
  const [activeTab, setActiveTab] = useState("content");
  const resumeRef = useRef();

  // Load resume data based on URL parameter
  React.useEffect(() => {
    if (id === "new") {
      const template = searchParams.get("template");
      createNewResume(template || "modern");
    } else if (id) {
      loadResume(id);
    }
  }, [id, searchParams]);

  const showDashboard = !id;

  const selectedTemplate = resumeData.template || "modern";
  const setSelectedTemplate = (template) => {
    setResumeData((prev) => ({ ...prev, template }));
  };

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: "Resume",
  });

  const handleNewResume = (template) => {
    navigate(`/resume-builder/new?template=${template || "modern"}`);
  };

  const handleEditResume = (id) => {
    navigate(`/resume-builder/${id}`);
  };

  if (showDashboard) {
    return (
      <div className="flex-1 max-w-6xl mx-auto flex flex-col font-sans overflow-hidden">
        <Helmet>
          <title>My Resumes | PlaceMateAI</title>
        </Helmet>

        <ResumeDashboard onNew={handleNewResume} onEdit={handleEditResume} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#09090b] text-zinc-100 flex flex-col font-sans overflow-hidden mesh-gradient-bg">
      <Helmet>
        <title>Resume Builder | PlaceMateAI</title>
      </Helmet>

      {/* Header */}
      <header className="h-[72px] bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        {/* Left - Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/resume-builder")}
            className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white font-medium transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">My Resumes</span>
          </button>

          <div className="h-6 w-px bg-zinc-800 mx-2"></div>

          <div className="flex items-center gap-2 group">
            <div className="p-2 bg-zinc-800 rounded-lg text-lime-400 group-hover:bg-zinc-700 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">
                Editing Resume
              </span>
              <input
                type="text"
                value={resumeData.title || ""}
                onChange={(e) =>
                  setResumeData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-zinc-600 w-48 focus:ring-0 p-0"
                placeholder="Resume Title..."
              />
            </div>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            className="bg-zinc-800 border border-zinc-800 text-sm font-bold tracking-tight text-white outline-none cursor-pointer hover:border-lime-400 hover:bg-zinc-800/80 transition-all px-4 py-2.5 rounded-xl hidden md:block focus:ring-2 focus:ring-lime-400/20"
            >
            <option value="elegant">Elegant Template ✨</option>
            <option value="modern">Modern Template</option>
            <option value="classic">Classic Template</option>
            <option value="tech">Tech Template</option>
            <option value="corporate">Corporate Template</option>
            <option value="executive">Executive Template</option>
            <option value="professional">Professional Template</option>
            <option value="creative">Creative Template</option>
            </select>

          <button
            onClick={async () => {
              const saved = await saveResume();
              if (saved) {
                toast.success("Changes synced to cloud! ✨");
                if (id === "new") {
                  navigate(`/resume-builder/${saved._id}`, { replace: true });
                }
              } else {
                toast.error("Sync failed. Check connection.");
              }
            }}
            disabled={isSaving}
            className="flex items-center justify-center px-4 py-2 border border-zinc-700 bg-zinc-800 text-zinc-300 text-sm hover:text-white rounded-lg transition-colors disabled:opacity-50"
            title="Save Progress"
          >
            Save content
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-lime-400 hover:bg-lime-500 text-zinc-950 text-sm font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(190,242,100,0.3)]"
          >
            Download
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Navigation & Forms */}
        <div className="w-full lg:w-[480px] xl:w-[520px] bg-zinc-950/40 backdrop-blur-sm flex flex-col border-r border-white/5 relative z-10">
          {/* Enhanced Segmented Control Tab Switcher */}
          <div className="p-5 pb-0">
            <div className="flex p-1 gap-1 bg-zinc-900/80 border border-white/5 rounded-2xl shadow-inner relative overflow-hidden">
              <div 
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-lime-400 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_20px_rgba(190,242,100,0.3)] ${
                    activeTab === "design" ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-xl font-black text-[10px] tracking-[0.15em] transition-all relative z-10 ${
                  activeTab === "content" ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                CONTENT
              </button>
              <button
                onClick={() => setActiveTab("design")}
                className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-xl font-black text-[10px] tracking-[0.15em] transition-all relative z-10 ${
                  activeTab === "design" ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <IoMdColorPalette className="w-4 h-4" />
                CUSTOMIZE
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pt-2">
            <div className="bg-zinc-900/30 rounded-[2rem] border border-white/5 overflow-hidden">
                {activeTab === "content" ? <FormSection /> : <CustomizeSection />}
            </div>
          </div>
        </div>

        {/* Right Preview Pane (Scrolls separately) */}
        <div className="flex-1 bg-zinc-900/50 overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar">
              <PreviewSection ref={resumeRef} template={selectedTemplate} />
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
