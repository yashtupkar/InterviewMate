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
  IoMenu,
  IoClose,
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
import AIToolsSection from "../components/resume-builder/AIToolsSection";

import ResumeDashboard from "../components/resume-builder/ResumeDashboard";
import { IoMdColorPalette } from "react-icons/io";
import ResumeCardPreview, {
  DUMMY_RESUME_DATA,
} from "../components/resume-builder/ResumeCardPreview";
import { TEMPLATE_THEMES } from "../context/ResumeContext";
import Logo from "../components/common/Logo";
import AIUpgradePopup from "../components/common/AIUpgradePopup";

const ResumeBuilder = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    isLoading,
    isSaving,
    saveStatus,
    saveResume,
    duplicateResume,
    rewriteResumeContent,
    createNewResume,
    loadResume,
    resumeData,
    setResumeData,
  } = useResume();
  const [activeTab, setActiveTab] = useState("content"); // content, design, templates
  const [zoom, setZoom] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [previewPageCount, setPreviewPageCount] = useState(1);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isFullRewriting, setIsFullRewriting] = useState(false);
  const [showAIUpgrade, setShowAIUpgrade] = useState(false);
  const [aiRewriteInsights, setAiRewriteInsights] = useState(null);
  const [aiRewriteResult, setAiRewriteResult] = useState(null);
  const [skillsAppliedForRewrite, setSkillsAppliedForRewrite] = useState(false);
  const resumeRef = useRef();

  const createRewriteSnapshot = (data) => {
    const source = data || {};
    const role = source?.personalInfo?.jobTitle || "";
    const summary =
      (Array.isArray(source?.profiles)
        ? source.profiles.find(
            (item) => item && item.visible !== false && item.content,
          )
        : null
      )?.content || "";
    const experienceHighlights = Array.isArray(source?.experience)
      ? source.experience
          .filter((item) => item && item.visible !== false && item.description)
          .slice(0, 2)
          .map((item) => item.description)
      : [];

    return {
      role,
      summary,
      experienceHighlights,
    };
  };

  const SKILL_CATEGORY_KEYWORDS = {
    "Programming Languages": [
      "javascript",
      "typescript",
      "python",
      "java",
      "go",
      "rust",
      "c++",
      "c#",
      "c",
    ],
    Frontend: [
      "react",
      "next.js",
      "vue",
      "angular",
      "tailwind",
      "redux",
      "html",
      "css",
    ],
    Backend: [
      "node.js",
      "express",
      "nestjs",
      "django",
      "flask",
      "spring",
      "graphql",
      "rest api",
    ],
    Database: [
      "mongodb",
      "postgresql",
      "mysql",
      "redis",
      "dynamodb",
      "elasticsearch",
    ],
    "Cloud/DevOps": [
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "terraform",
      "ci/cd",
      "jenkins",
    ],
    Tools: ["git", "github", "gitlab", "jira", "postman", "figma", "vscode"],
    Testing: [
      "jest",
      "pytest",
      "cypress",
      "selenium",
      "unit testing",
      "integration testing",
    ],
    Architecture: [
      "microservices",
      "system design",
      "event-driven",
      "serverless",
      "scalability",
    ],
  };

  const CATEGORY_ALIASES = {
    language: "Programming Languages",
    languages: "Programming Languages",
    "programing language": "Programming Languages",
    "programing languages": "Programming Languages",
    "programming language": "Programming Languages",
    "programming languages": "Programming Languages",
  };

  const normalizeCategory = (value = "") => {
    const normalized = String(value).trim().toLowerCase();
    if (CATEGORY_ALIASES[normalized]) return CATEGORY_ALIASES[normalized];

    const category = Object.keys(SKILL_CATEGORY_KEYWORDS).find(
      (item) => item.toLowerCase() === normalized,
    );
    return category || "Tools";
  };

  const resolveSkillCategory = (skill = "", providedCategory = "") => {
    const fromProvided = normalizeCategory(providedCategory);
    if (providedCategory && fromProvided !== "Tools") return fromProvided;

    const lowered = String(skill || "").toLowerCase();
    for (const [category, keywords] of Object.entries(
      SKILL_CATEGORY_KEYWORDS,
    )) {
      if (keywords.some((keyword) => lowered.includes(keyword)))
        return category;
    }

    return fromProvided;
  };

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

  const handleDuplicateFromHeader = async () => {
    if (isDuplicating) return;

    setIsDuplicating(true);

    try {
      let sourceResumeId = id;

      if (id === "new") {
        const saved = await saveResume();
        if (!saved?._id) {
          toast.error("Please sync this resume before duplicating.");
          return;
        }
        sourceResumeId = saved._id;
        navigate(`/resume-builder/${saved._id}`, { replace: true });
      }

      const baseTitle =
        typeof resumeData?.title === "string" && resumeData.title.trim()
          ? resumeData.title.trim()
          : "Untitled Resume";

      const duplicated = await duplicateResume(
        sourceResumeId,
        `${baseTitle} (Copy)`,
      );

      if (duplicated?._id) {
        toast.success("Resume duplicated successfully.");
        navigate(`/resume-builder/${duplicated._id}`);
      }
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleFullRewriteFromHeader = async ({
    withJobDescription = false,
    jobDescription = "",
  } = {}) => {
    if (isFullRewriting) return;

    setIsFullRewriting(true);
    setAiRewriteResult(null);
    setSkillsAppliedForRewrite(false);
    const beforeSnapshot = createRewriteSnapshot(resumeData);

    try {
      let sourceResumeId = id;

      if (id === "new") {
        const saved = await saveResume();
        if (!saved?._id) {
          toast.error("Please sync this resume before AI full rewrite.");
          return;
        }
        sourceResumeId = saved._id;
        navigate(`/resume-builder/${saved._id}`, { replace: true });
      }

      const response = await rewriteResumeContent({
        resumeId: sourceResumeId,
        mode: "full",
        target: "full_resume",
        content: JSON.stringify(resumeData),
        resumeData,
        jobDescription: withJobDescription ? jobDescription : "",
      });

      const rewrittenResume = response?.data?.rewrittenResume;
      if (rewrittenResume) {
        setResumeData((prev) => ({ ...prev, ...rewrittenResume }));
        const keywordSuggestions = response?.data?.keywordSuggestions || [];
        const missingSkills = response?.data?.missingSkills || [];

        setAiRewriteInsights({
          mode: response?.data?.mode,
          target: response?.data?.target,
          keywordSuggestions,
          missingSkills,
          jdInsights: response?.data?.jdInsights || null,
          tips: response?.data?.tips || [],
        });

        setAiRewriteResult({
          before: beforeSnapshot,
          after: createRewriteSnapshot({ ...resumeData, ...rewrittenResume }),
          keywordSuggestions,
          missingSkills,
        });
        toast.success("Full resume rewritten with AI.");
        return response.data;
      } else {
        toast.error("AI rewrite did not return structured content.");
      }
    } catch (error) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message || "Failed to rewrite full resume.";

      if (status === 403) {
        setShowAIUpgrade(true);
      } else {
        toast.error(message);
      }
    } finally {
      setIsFullRewriting(false);
    }

    return null;
  };

  const handleApplySuggestedSkills = (skills = []) => {
    if (skillsAppliedForRewrite) return;

    const normalizedSkills = (skills || [])
      .map((entry) => {
        if (typeof entry === "string") {
          return { skill: entry.trim(), category: "" };
        }

        if (entry && typeof entry.skill === "string") {
          return {
            skill: entry.skill.trim(),
            category:
              typeof entry.category === "string" ? entry.category.trim() : "",
          };
        }

        return { skill: "", category: "" };
      })
      .filter((entry) => entry.skill);

    if (normalizedSkills.length === 0) return;

    setResumeData((prev) => {
      const currentSkills = Array.isArray(prev?.skills) ? [...prev.skills] : [];

      normalizedSkills.forEach(({ skill, category }) => {
        const resolvedCategory = resolveSkillCategory(skill, category);

        const bucketIndex = currentSkills.findIndex(
          (item) =>
            String(item?.category || "").toLowerCase() ===
            resolvedCategory.toLowerCase(),
        );

        if (bucketIndex >= 0) {
          const currentList = String(
            currentSkills[bucketIndex]?.subSkills || "",
          )
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
          if (
            !currentList.some(
              (value) => value.toLowerCase() === skill.toLowerCase(),
            )
          ) {
            currentList.push(skill);
          }

          currentSkills[bucketIndex] = {
            ...currentSkills[bucketIndex],
            subSkills: currentList.join(", "),
            visible: true,
          };

          return;
        }

        currentSkills.push({
          category: resolvedCategory,
          subSkills: skill,
          level: "Intermediate",
          visible: true,
        });
      });

      return {
        ...prev,
        skills: currentSkills,
      };
    });

    setSkillsAppliedForRewrite(true);
    toast.success("Suggested skills applied to categories.");
  };

  const handleDoneRewriteReview = () => {
    setAiRewriteResult(null);
    setAiRewriteInsights(null);
    setSkillsAppliedForRewrite(false);
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

  const sidebarItems = [
    { id: "content", label: "Content", icon: IoDocumentText },
    { id: "design", label: "Customize", icon: IoColorPalette },
    { id: "templates", label: "Templates", icon: IoLayers },
    { id: "ai-tools", label: "AI Tools", icon: IoSparkles },
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
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 md:gap-2">
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
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all"
              title="Menu"
            >
              <IoMenu className="w-6 h-6" />
            </button>
          </div>

          <div className="hidden md:block h-8 w-px bg-zinc-800 mx-1"></div>

          <div className="hidden md:flex flex-col">
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
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-all disabled:opacity-50 text-sm font-medium"
          >
            <IoCloudUpload className="w-4 h-4" />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={handleDuplicateFromHeader}
            disabled={isDuplicating}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-all disabled:opacity-50 text-sm font-medium"
            title="Duplicate Resume"
          >
            <IoCreate className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isDuplicating ? "Duplicating..." : "Duplicate"}
            </span>
          </button>

          <button
            onClick={handleFullRewriteFromHeader}
            disabled={isFullRewriting}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-all disabled:opacity-50 text-sm font-medium"
            title="AI Full Resume Rewrite"
          >
            <IoSparkles className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isFullRewriting ? "Rewriting..." : "AI Rewrite"}
            </span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden md:flex items-center gap-2 px-3 sm:px-5 py-2 bg-lime-400 hover:bg-lime-500 text-zinc-950 text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(190,242,100,0.2)] active:scale-95"
          >
            <IoDownload className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Icons (Desktop) */}
        <div className="hidden md:flex relative inset-y-0 left-0 z-30 w-[72px] bg-zinc-900 border-r border-zinc-800 flex-col items-center py-6 gap-4 shrink-0">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative group p-2 rounded-lg transition-all duration-300 ${
                  isActive
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

        {/* Mobile Sidebar Drawer */}
        <aside
          className={`md:hidden fixed inset-y-0 left-0 z-50 w-[84%] max-w-[360px] bg-zinc-900 border-r border-zinc-800 px-5 py-6 flex flex-col transition-transform duration-300 ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Dashboard</h2>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="w-9 h-9 rounded-lg border border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center"
              title="Close menu"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-0.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all border ${
                    isActive
                      ? "bg-zinc-800 border-zinc-700 text-lime-400"
                      : "bg-transparent border-transparent text-zinc-300 hover:bg-zinc-800/70 hover:border-zinc-700"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-2 pt-0 flex flex-col gap-1.5">
            <button
              onClick={() => {
                setIsMobileSidebarOpen(false);
                setIsMobilePreviewOpen(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 py-2.5 text-sm font-semibold hover:bg-zinc-800 transition-colors"
            >
              <IoEye className="w-4 h-4" />
              Preview
            </button>

            <button
              onClick={() => {
                setIsMobileSidebarOpen(false);
                handlePrint();
              }}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-lime-400 text-zinc-950 py-2.5 text-sm font-bold hover:bg-lime-500 transition-colors"
            >
              <IoDownload className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
        )}

        {/* Side Pane - Forms/Controls */}
        {!isFullscreen && (
          <div className="flex-1 md:w-[420px] md:xl:w-[480px] md:flex-none bg-zinc-950/20 backdrop-blur-sm border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === "content" && <FormSection />}
              {activeTab === "design" && <CustomizeSection />}
              {activeTab === "ai-tools" && (
                <AIToolsSection
                  onFullRewrite={handleFullRewriteFromHeader}
                  rewriteInsights={aiRewriteInsights}
                  rewriteResult={aiRewriteResult}
                  onApplySuggestedSkills={handleApplySuggestedSkills}
                  skillsApplied={skillsAppliedForRewrite}
                  onDoneRewrite={handleDoneRewriteReview}
                  isRewriting={isFullRewriting}
                />
              )}
              {activeTab === "templates" && (
                <div className="p-3 md:p-6">
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
                          onClick={() => {
                            setSelectedTemplate(template);
                            // On mobile, keep the view on templates or go back to content?
                            // User didn't specify, but usually you want to see the result.
                          }}
                          className={`relative group p-2.5 rounded-xl border-2 transition-all text-left ${
                            selectedTemplate === template
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

        {/* Preview Area (Desktop) */}
        <div className="hidden md:flex flex-1 bg-[#121214] relative overflow-hidden flex-col">
          <div className="flex-1 overflow-auto custom-scrollbar p-8 md:p-12 flex justify-center items-start">
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
                transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              className="rounded-sm"
            >
              <PreviewSection
                ref={resumeRef}
                template={selectedTemplate}
                onPageCountChange={(count) =>
                  setPreviewPageCount((prev) => (prev === count ? prev : count))
                }
              />
            </div>
          </div>

          {/* Floating Preview Controls (Desktop) */}
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

        {/* Floating Action Button for Mobile Preview */}
        <button
          onClick={() => setIsMobilePreviewOpen(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-lime-400 hover:bg-lime-500 text-zinc-950 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(190,242,100,0.3)] active:scale-90 transition-all z-40"
          title="Preview Resume"
        >
          <IoEye className="w-6 h-6" />
        </button>

        {/* Full-screen Mobile Preview Modal */}
        {isMobilePreviewOpen && (
          <div
            className="md:hidden fixed inset-0 z-[100] bg-zinc-950/30 backdrop-blur-lg flex flex-col animate-in fade-in duration-300"
            onClick={() => setIsMobilePreviewOpen(false)}
          >
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`mx-auto w-full max-w-[560px] [&_.hide-on-print]:p-2 [&_.hide-on-print]:gap-3 ${
                  previewPageCount === 1
                    ? "min-h-full flex items-center justify-center"
                    : "flex justify-center"
                }`}
              >
                <div className="origin-top scale-[0.41] min-[360px]:scale-[0.44] min-[390px]:scale-[0.47] sm:scale-[0.64]">
                  <PreviewSection
                    ref={resumeRef}
                    template={selectedTemplate}
                    onPageCountChange={(count) =>
                      setPreviewPageCount((prev) =>
                        prev === count ? prev : count,
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div
              className="p-3 bg-zinc-900/35  border-t border-zinc-700/50 flex gap-2 items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsMobilePreviewOpen(false)}
                className="w-[120px] flex items-center justify-center gap-2 py-3 bg-white text-zinc-950 text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(190,242,100,0.2)]"
              >
                <IoClose className="w-4 h-4" />
                close
              </button>{" "}
              <button
                onClick={handlePrint}
                className="w-[220px] flex items-center justify-center gap-2 py-3 bg-lime-400 hover:bg-lime-500 text-zinc-950 text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(190,242,100,0.2)]"
              >
                <IoDownload className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        )}
      </main>

      <AIUpgradePopup
        isOpen={showAIUpgrade}
        onClose={() => setShowAIUpgrade(false)}
      />
    </div>
  );
};

export default ResumeBuilder;
