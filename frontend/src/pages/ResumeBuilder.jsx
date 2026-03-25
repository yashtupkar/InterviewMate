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
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { useResume } from "../context/ResumeContext";

// Placeholder Form Pane component
import FormSection from "../components/resume-builder/FormSection";
// Placeholder Preview Pane component
import PreviewSection from "../components/resume-builder/PreviewSection";

import ResumeDashboard from "../components/resume-builder/ResumeDashboard";

const ResumeBuilder = () => {
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
  const [showDashboard, setShowDashboard] = useState(true);
  const resumeRef = useRef();

  const selectedTemplate = resumeData.template || "modern";
  const setSelectedTemplate = (template) => {
    setResumeData((prev) => ({ ...prev, template }));
  };

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: "Resume",
  });

  const handleNewResume = () => {
    createNewResume();
    setShowDashboard(false);
  };

  const handleEditResume = async (id) => {
    await loadResume(id);
    setShowDashboard(false);
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
    <div className="fixed inset-0 z-[60] bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden">
      <Helmet>
        <title>Resume Builder | PlaceMateAI</title>
      </Helmet>

      {/* Header */}
      <header className="h-[72px] bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        {/* Left - Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDashboard(true)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white font-medium transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">My Resumes</span>
          </button>

          <div className="h-6 w-px bg-zinc-800 mx-2"></div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={resumeData.title || ""}
              onChange={(e) =>
                setResumeData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-zinc-600 w-40"
              placeholder="Resume Title..."
            />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-sm font-medium text-zinc-300 outline-none cursor-pointer hover:border-zinc-500 transition-colors px-4 py-2 rounded-lg hidden md:block focus:ring-1 focus:ring-lime-400"
          >
            <option value="modern">Modern Template</option>
            <option value="classic">Classic Template</option>
            <option value="tech">Tech Template</option>
            <option value="corporate">Corporate Template</option>
            <option value="executive">Executive Template</option>
            <option value="professional">Professional Template</option>
            <option value="creative">Creative Template</option>
          </select>

          <button
            onClick={saveResume}
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
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Form Pane (Scrolls separately) */}
        <div className="w-full lg:w-[500px] xl:w-[550px] bg-zinc-950 overflow-y-auto custom-scrollbar p-6">
          <FormSection />
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
