import React from "react";
import { useResume } from "../../context/ResumeContext";
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  Download,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ResumeDashboard = ({ onNew, onEdit }) => {
  const { resumes, isLoading, deleteResume } = useResume();

  if (isLoading && resumes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-transparent p-6 md:p-10 overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            My Resumes
          </h1>
          <p className="text-zinc-500 font-medium text-sm">
            Your first resume is free forever. Need more than one resume?{" "}
            <button className="text-lime-400 hover:underline">
              Upgrade your plan
            </button>
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* New Resume Card (Matches image style) */}
          <button
            onClick={onNew}
            className="group relative aspect-[210/297] bg-zinc-900/30 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-lime-400/50 hover:bg-lime-400/5 transition-all flex flex-col items-center justify-center gap-3"
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
                {/* Preview Content Placeholder (Dark Theme) */}
                <div className="p-6 space-y-4 pointer-events-none opacity-10">
                  <div className="h-3 w-3/4 bg-zinc-100 rounded-full"></div>
                  <div className="h-2 w-1/2 bg-zinc-400 rounded-full"></div>
                  <div className="space-y-1.5 pt-4">
                    <div className="h-1.5 w-full bg-zinc-400 rounded-full"></div>
                    <div className="h-1.5 w-full bg-zinc-400 rounded-full"></div>
                    <div className="h-1.5 w-2/3 bg-zinc-400 rounded-full"></div>
                  </div>
                  <div className="space-y-1.5 pt-4">
                    <div className="h-1.5 w-full bg-zinc-400 rounded-full"></div>
                    <div className="h-1.5 w-3/4 bg-zinc-400 rounded-full"></div>
                  </div>
                </div>

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
                      onClick={() => deleteResume(resume._id)}
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
    </div>
  );
};

export default ResumeDashboard;
