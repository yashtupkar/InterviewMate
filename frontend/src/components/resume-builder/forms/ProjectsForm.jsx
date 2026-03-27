import React, { useState, useEffect } from "react";
import { useResume } from "../../../context/ResumeContext";
import AIUpgradePopup from "../../common/AIUpgradePopup";
import MonthYearPicker from "../../common/MonthYearPicker";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Check,
  FolderKanban,
  Sparkles,
} from "lucide-react";

const ProjectsForm = () => {
  const { resumeData, updateProjects } = useResume();
  const { projects } = resumeData;
  const [editingIndex, setEditingIndex] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [showAIUpgrade, setShowAIUpgrade] = useState(false);

  useEffect(() => {
    if (projects.length === 0 && editingIndex === null) {
      handleAdd();
    }
  }, [projects.length]);

  const handleAdd = () => {
    const newEntry = {
      title: "",
      link: "",
      githubUrl: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      visible: true,
    };
    setEditingIndex(projects.length);
    setEditEntry(newEntry);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditEntry({ ...projects[index] });
  };

  const handleDone = () => {
    const newProj = [...projects];
    if (editingIndex === projects.length) {
      newProj.push(editEntry);
    } else {
      newProj[editingIndex] = editEntry;
    }
    updateProjects(newProj);
    setEditingIndex(null);
    setEditEntry(null);
  };

  const handleRemove = (index) => {
    const newProj = projects.filter((_, i) => i !== index);
    updateProjects(newProj);
  };

  const toggleVisibility = (index) => {
    const newProj = [...projects];
    newProj[index].visible = !newProj[index].visible;
    updateProjects(newProj);
  };

  if (editingIndex !== null) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Edit Project
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleVisibility(editingIndex)}
              className="p-2 bg-zinc-800/50 rounded-lg hover:text-lime-400 transition-colors"
            >
              {editEntry.visible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => {
                setEditingIndex(null);
                setEditEntry(null);
              }}
              className="p-2 bg-zinc-800/50 rounded-lg hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Project Title
            </label>
            <input
              type="text"
              value={editEntry.title || ""}
              onChange={(e) =>
                setEditEntry({ ...editEntry, title: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
              placeholder="e.g. Chatbot AI"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Live Link (Portfolio/Demo)
            </label>
            <input
              type="url"
              value={editEntry.link || ""}
              onChange={(e) =>
                setEditEntry({ ...editEntry, link: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
              placeholder="https://my-demo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              GitHub Source Code (Optional)
            </label>
            <input
              type="url"
              value={editEntry.githubUrl || ""}
              onChange={(e) =>
                setEditEntry({ ...editEntry, githubUrl: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
              placeholder="https://github.com/..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Start Date
              </label>
              <MonthYearPicker
                value={editEntry.startDate}
                onChange={(val) =>
                  setEditEntry({ ...editEntry, startDate: val })
                }
              />
            </div>
            {!editEntry.current && (
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  End Date
                </label>
                <MonthYearPicker
                  value={editEntry.endDate}
                  onChange={(val) =>
                    setEditEntry({ ...editEntry, endDate: val })
                  }
                  align="right"
                  showPresent={true}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="current-project"
              checked={editEntry.current || false}
              onChange={(e) =>
                setEditEntry({ ...editEntry, current: e.target.checked })
              }
              className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-lime-500 focus:ring-lime-500/20"
            />
            <label
              htmlFor="current-project"
              className="text-sm text-zinc-400 cursor-pointer select-none"
            >
              Ongoing Project
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Description
              </label>
              <button
                type="button"
                onClick={() => setShowAIUpgrade(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-lime-400 rounded-lg border border-zinc-800 text-[10px] font-black uppercase tracking-widest transition-all group"
              >
                <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform" />
                Rewrite with AI
              </button>
            </div>
            <textarea
              value={editEntry.description}
              onChange={(e) =>
                setEditEntry({ ...editEntry, description: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all min-h-[150px] resize-none"
              placeholder="Describe the project, technologies used, and your impact..."
            />
          </div>

          <button
            onClick={handleDone}
            className="w-full py-4 bg-gradient-to-r from-lime-600 to-lime-400 text-zinc-950 font-bold rounded-2xl shadow-lg hover:shadow-lime-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 group mt-4"
          >
            <Check className="w-5 h-5" />
            DONE
          </button>
        </div>
        <AIUpgradePopup
          isOpen={showAIUpgrade}
          onClose={() => setShowAIUpgrade(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {projects.map((proj, index) => (
          <div
            key={index}
            onClick={() => handleEdit(index)}
            className="group flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-lime-500/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
              <div>
                <span className="block font-bold text-white tracking-tight group-hover:text-lime-400 transition-colors">
                  {proj.title || "(No Project Title)"}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium block">
                  {proj.startDate &&
                    `${proj.startDate} - ${proj.current ? "Present" : proj.endDate || "End"}`}
                  {proj.link && ` • Link`}
                  {proj.githubUrl && ` • Code`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(index);
                }}
                className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-lime-400 transition-colors"
              >
                {proj.visible !== false ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAdd}
        className="w-full py-4 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm"
      >
        <Plus className="w-5 h-5" />
        Add Project
      </button>
    </div>
  );
};

export default ProjectsForm;
