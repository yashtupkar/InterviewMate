import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useResume, TEMPLATE_THEMES } from "../../context/ResumeContext";
import UniversalPopup from "../common/UniversalPopup";
import {
  IoAdd,
  IoEllipsisVertical,
  IoTrash,
  IoCreate,
  IoDownload,
  IoTime,
  IoSparkles,
  IoGrid,
} from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";
import ResumeCardPreview, {
  templates,
  DUMMY_RESUME_DATA,
} from "./ResumeCardPreview";
import { Link } from "react-router-dom";
import { FiPlusCircle } from "react-icons/fi";
import { Download, Edit2, MoreVertical, Trash2 } from "lucide-react";

const UpgradeModal = ({ isOpen, onClose, limit, tier }) => {
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
          Reached your <br /> {tier} limit?
        </h2>

        <p className="text-zinc-400 text-sm font-medium mb-10 leading-relaxed pr-4">
          Your {tier} plan allows up to {limit} {limit === 1 ? 'resume' : 'resumes'}. Upgrade to create more.
        </p>

        <button
          className="bg-[#bef264] hover:bg-[#d9ff96] text-black px-4 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-lg shadow-lime-400/10 active:scale-[0.98]"
          onClick={() => (window.location.href = "/pricing")}
        >
          Upgrade Plan <span className="transform -rotate-12">🚀</span>
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
          This action cannot be undone. All data for this resume will be
          permanently removed.
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
  const [view, setView] = useState("dashboard"); // 'dashboard' or 'templates'
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [userTier, setUserTier] = useState({ tier: 'Free', limit: 1 });
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const fetchTier = async () => {
      if (!isSignedIn) return;
      try {
        const token = await getToken();
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const tier = res.data.tier;
        const limit = res.data.limits?.resumeLimit || 1;
        setUserTier({ tier, limit });
      } catch (err) {
        console.error("Failed to fetch tier:", err);
      }
    };
    fetchTier();
  }, [getToken, isSignedIn]);

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
          <header className="mb-4 sm:mb-10 flex items-center justify-between">
            <div>
              <div className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-2 sm:mb-4 block underline decoration-[#bef264]/30 underline-offset-4">
                Template Selection
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Choose your <span className="text-[#bef264] italic">Style</span>
              </h1>
              <p className="text-zinc-500 font-medium text-sm sm:text-md mt-2 sm:mt-4">
                Select a professional layout to start your journey
              </p>
            </div>
            <button
              onClick={() => setView("dashboard")}
              className="px-6 py-3 hidden sm:flex bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl border border-zinc-800 font-bold text-sm transition-all  items-center gap-2 group"
            >
              <IoAdd className="w-5 h-5 rotate-45 group-hover:rotate-[135deg] transition-transform" />
              Back to Dashboard
            </button>
          </header>

          <div className="grid grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
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
                    className="relative aspect-[210/297] bg-white rounded-xl sm:rounded-2xl shadow-lg border border-zinc-200 overflow-hidden cursor-pointer transform group-hover:-translate-y-2 transition-all duration-500"
                    onClick={() => onNew(key)}
                  >
                    <ResumeCardPreview resume={customData} />
                    <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div
                        className="bg-white text-zinc-950 px-6 py-2 rounded-xl font-black text-[10px] tracking-[0.2em] shadow-2xl border-b-4 border-zinc-200 active:border-b-0 active:translate-y-1 transition-all"
                        style={{ color: themeColor }}
                      >
                        USE <span className="hidden md:block">THIS TEMPLATE</span>
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
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Build your{" "}
            <span className="text-[#bef264] italic">ATS Friendly</span> Resumes
          </h1>
          <p className="text-zinc-500 font-medium text-sm md:text-md mt-4">
            Create professional, ATS-optimized resumes in minutes.
            (
            {resumes.length}/{userTier.limit} Used)
            <Link
              to={"/pricing"}
              className="text-lime-400 hover:underline ml-2"
            >
              Upgrade plan
            </Link>
          </p>
        </header>

        <div className="grid grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {/* New Resume Card (Matches image style) */}
          <button
            onClick={() => {
              if (resumes.length >= userTier.limit) {
                setShowUpgradeModal(true);
              } else {
                setView("templates");
              }
            }}
            className="group relative aspect-[210/297] bg-black rounded-xl sm:rounded-2xl border-2 border-dashed border-zinc-700 hover:border-lime-400/50 hover:bg-lime-400/5 transition-all flex flex-col items-center justify-center gap-3"
          >
            <div className="text-zinc-500 group-hover:text-lime-400 transition-colors">
              <FiPlusCircle className="w-10 h-10 stroke-[1.5]" />
            </div>
            <span className="text-base font-bold text-zinc-500 group-hover:text-white transition-colors tracking-tight">
              New resume
            </span>
          </button>

          {/* Resume Cards */}
          {resumes.map((resume) => (
            <div key={resume._id} className="group flex flex-col">
              <div
                className="relative aspect-[210/297] bg-zinc-800 rounded-xl sm:rounded-2xlshadow-sm hover:shadow-2xl hover:shadow-lime-400/10 transition-all overflow-hidden cursor-pointer mb-3 border border-zinc-800"
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

              <div className="flex items-start justify-between px-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white truncate text-sm sm:text-lg leading-tight group-hover:text-lime-400 transition-colors uppercase tracking-tight capitalize">
                    {resume.title || "Untitled"}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                    <span>
                       {formatDistanceToNow(new Date(resume.updatedAt))}{" "}
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
        tier={userTier.tier}
        limit={userTier.limit}
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
