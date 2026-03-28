import React, { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  IoDownload,
  IoLayers,
  IoSave,
  IoChevronBack,
  IoEllipsisVertical,
  IoGrid,
  IoDocumentText,
  IoBrush,
  IoSparkles,
  IoEye,
  IoSettings,
  IoColorPalette,
  IoArrowUndo,
  IoArrowRedo,
  IoCheckmarkCircle,
  IoCloudUpload,
  IoExpand,
  IoContract,
  IoCreate,
  IoCheckmark,
} from "react-icons/io5";
import { MdZoomIn, MdZoomOut } from "react-icons/md";
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
import ResumeCardPreview, {
  DUMMY_RESUME_DATA,
} from "../components/resume-builder/ResumeCardPreview";
import { TEMPLATE_THEMES } from "../context/ResumeContext";
import Logo from "../components/common/Logo";

const ResumeBuilder = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    isLoading,
    isSaving,
    saveStatus,
    saveResume,
    createNewResume,
    loadResume,
    resumeData,
    setResumeData,
  } = useResume();
  const [activeTab, setActiveTab] = useState("content"); // content, design, templates
  const [zoom, setZoom] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
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
    documentTitle: resumeData.title || "Resume",
  });

  const handleNewResume = (template) => {
    navigate(`/resume-builder/new?template=${template || "modern"}`);
  };

  const handleEditResume = (id) => {
    navigate(`/resume-builder/${id}`);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(0.85);

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

  const sidebarItems = [
    { id: "content", label: "Content", icon: IoDocumentText },
    { id: "design", label: "Customize", icon: IoColorPalette },
    { id: "templates", label: "Templates", icon: IoLayers },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-[#09090b] text-zinc-100 flex flex-col font-sans overflow-hidden">
      <Helmet>
        <title>{resumeData.title || "Resume Builder"} | PlaceMateAI</title>
      </Helmet>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-lime-400/20 border-t-lime-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Logo size={24} />
            </div>
          </div>
          <p className="mt-4 text-sm font-bold text-white uppercase tracking-[0.2em] animate-pulse">
            Fetching Resume Data...
          </p>
        </div>
      )}

      {/* Modern Header */}
      <header className="h-[64px] bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800/50 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/resume-builder")}
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all group overflow-hidden"
            title="Back to Dashboard"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-75">
                <Logo size={34} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
                <IoChevronBack className="w-6 h-6" />
              </div>
            </div>
          </button>

          <div className="h-8 w-px bg-zinc-800 mx-1"></div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 group/title">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 bg-zinc-800/50 px-2 py-1 rounded-lg border border-zinc-700/50">
                  <input
                    type="text"
                    autoFocus
                    value={resumeData.title || ""}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setIsEditingTitle(false);
                    }}
                    className="bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-zinc-600 w-48 focus:ring-0 p-0"
                    placeholder="Untitled Resume"
                  />
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="p-1 hover:bg-zinc-700 rounded-md text-lime-400 transition-colors"
                  >
                    <IoCheckmark className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white truncate max-w-[200px] capitalize">
                    {resumeData.title || "Untitled Resume"}
                  </h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1.5 opacity-0 group-hover/title:opacity-100 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all"
                  >
                    <IoCreate className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {saveStatus === "saving" ? (
                <>
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    Saving changes...
                  </span>
                </>
              ) : saveStatus === "unsaved" ? (
                <>
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    Unsaved changes...
                  </span>
                </>
              ) : (
                <>
                  <IoCheckmarkCircle className="w-3 h-3 text-lime-400" />
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    Saved to cloud
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 bg-zinc-800/50 p-1 rounded-xl border border-zinc-700/50 mr-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <MdZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 text-[11px] font-bold text-zinc-400 hover:text-white transition-colors min-w-[45px]"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <MdZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={async () => {
              const saved = await saveResume();
              if (saved) {
                toast.success("Changes synced! ✨");
                if (id === "new") {
                  navigate(`/resume-builder/${saved._id}`, { replace: true });
                }
              }
            }}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-all disabled:opacity-50 text-sm font-medium"
          >
            <IoCloudUpload className="w-4 h-4" />
            <span className="hidden md:inline">Sync</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-lime-400 hover:bg-lime-500 text-zinc-950 text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(190,242,100,0.2)] active:scale-95"
          >
            <IoDownload className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Icons */}
        <div className="w-[72px] bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-6 gap-4 shrink-0 z-40">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative group p-2 rounded-lg transition-all duration-300 ${isActive
                    ? "bg-lime-400 text-zinc-950 shadow-[0_0_20px_rgba(190,242,100,0.3)]"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="absolute left-full ml-4 px-2.5 py-1.5 bg-zinc-800 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-zinc-700 shadow-xl">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-lime-400 rounded-r-full -ml-[36px]"></div>
                )}
              </button>
            );
          })}

          <div className="mt-auto flex flex-col gap-4">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-2xl transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <IoContract className="w-6 h-6" />
              ) : (
                <IoExpand className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Side Pane - Forms/Controls */}
        {!isFullscreen && (
          <div className="w-[420px] xl:w-[480px] bg-zinc-950/20 backdrop-blur-sm border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === "content" && <FormSection />}
              {activeTab === "design" && <CustomizeSection />}
              {activeTab === "templates" && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">
                      Templates
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Choose a professional layout for your resume.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      "modern",
                      "elegant",
                      "classic",
                      "tech",
                      "corporate",
                      "executive",
                      "professional",
                      "creative",
                      "standard",
                    ].map((template) => {
                      const themeColor = TEMPLATE_THEMES[template] || "#bef264";
                      const previewData = {
                        ...DUMMY_RESUME_DATA,
                        template: template,
                        customizations: {
                          ...DUMMY_RESUME_DATA.customizations,
                          colors: {
                            ...DUMMY_RESUME_DATA.customizations.colors,
                            accent: themeColor,
                          },
                        },
                      };

                      return (
                        <button
                          key={template}
                          onClick={() => setSelectedTemplate(template)}
                          className={`relative group p-2.5 rounded-xl border-2 transition-all text-left ${selectedTemplate === template
                              ? "border-lime-400 bg-lime-400/5 shadow-[0_0_20px_rgba(190,242,100,0.1)]"
                              : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2 px-0.5">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider truncate ${selectedTemplate === template ? "text-lime-400" : "text-zinc-400"}`}
                            >
                              {template}
                            </span>
                            {selectedTemplate === template && (
                              <div className="w-1.5 h-1.5 bg-lime-400 rounded-full shadow-[0_0_10px_rgba(190,242,100,1)] shrink-0"></div>
                            )}
                          </div>
                          <div className="relative aspect-[210/297] bg-white rounded-lg overflow-hidden border border-zinc-700/50 group-hover:border-zinc-600 transition-colors shadow-lg">
                            <ResumeCardPreview resume={previewData} />
                            {selectedTemplate === template && (
                              <div className="absolute inset-0 bg-lime-400/5 pointer-events-none"></div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Area */}
        <div className="flex-1 bg-[#121214] relative overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto custom-scrollbar p-8 md:p-12 flex justify-center items-start">
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
                transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              className="rounded-sm"
            >
              <PreviewSection ref={resumeRef} template={selectedTemplate} />
            </div>
          </div>

          {/* Floating Preview Controls (Mobile/Compact) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 p-2 rounded-2xl shadow-2xl z-50">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              <MdZoomOut className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-zinc-800 mx-1"></div>
            <button
              onClick={handleResetZoom}
              className="px-3 text-[11px] font-black text-zinc-300 hover:text-white tracking-widest"
            >
              {Math.round(zoom * 100)}%
            </button>
            <div className="h-4 w-px bg-zinc-800 mx-1"></div>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              <MdZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
