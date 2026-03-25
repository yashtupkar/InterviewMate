import React, { useState } from "react";
import { useResume } from "../../../context/ResumeContext";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Check,
  FolderKanban,
  Pencil,
  X,
} from "lucide-react";

const ProjectsForm = () => {
  const { resumeData, updateProjects, updateSectionTitle } = useResume();
  const { projects, sectionTitles } = resumeData;
  const [editingIndex, setEditingIndex] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(sectionTitles.projects);

  const handleTitleSave = () => {
    updateSectionTitle("projects", tempTitle);
    setIsEditingTitle(false);
  };

  const handleAdd = () => {
    const newEntry = {
      title: "",
      link: "",
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={editEntry.title}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, title: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
                placeholder="e.g. Chatbot AI"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Project Link (Optional)
              </label>
              <input
                type="url"
                value={editEntry.link}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, link: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all shadow-sm"
                placeholder="e.g. https://github.com/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={editEntry.description}
              onChange={(e) =>
                setEditEntry({ ...editEntry, description: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all min-h-[150px] resize-none"
              placeholder="Describe the project, technologies used, and your impact..."
            />
          </div>

          <button
            onClick={handleDone}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-pink-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 group mt-4"
          >
            <Check className="w-5 h-5" />
            DONE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <FolderKanban className="w-5 h-5 text-pink-500" />
          </div>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-pink-500 transition-all w-48"
                autoFocus
              />
              <button
                onClick={handleTitleSave}
                className="p-1 text-lime-400 hover:scale-110 transition-transform"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditingTitle(false);
                  setTempTitle(sectionTitles.projects);
                }}
                className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h2 className="text-xl font-bold text-white tracking-tight">
              {sectionTitles.projects}
            </h2>
          )}
        </div>

        {!isEditingTitle && (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-pink-500 transition-colors bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800/50 hover:border-pink-500/30"
          >
            <Pencil className="w-3 h-3" />
            Edit Heading
          </button>
        )}
      </div>

      <div className="space-y-3">
        {projects.map((proj, index) => (
          <div
            key={index}
            onClick={() => handleEdit(index)}
            className="group flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-pink-500/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
              <div>
                <span className="block font-bold text-white tracking-tight group-hover:text-pink-400 transition-colors">
                  {proj.title || "(No Project Title)"}
                </span>
                {proj.link && (
                  <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[200px] block">
                    {proj.link}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
