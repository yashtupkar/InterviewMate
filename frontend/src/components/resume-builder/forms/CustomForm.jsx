import React, { useState, useEffect } from "react";
import { useResume } from "../../../context/ResumeContext";
import AIUpgradePopup from "../../common/AIUpgradePopup";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Check,
  Sparkles,
  Link as LinkIcon,
  Lightbulb,
} from "lucide-react";

import MonthYearPicker from "../../common/MonthYearPicker";

const CustomForm = ({ sectionId, sectionTitle }) => {
  const { resumeData, updateCustomSection, removeCustomSection } = useResume();
  const section = (resumeData.customSections || []).find(
    (s) => s.id === sectionId,
  );
  const entries = section?.entries || [];

  const [editingIndex, setEditingIndex] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [showAIUpgrade, setShowAIUpgrade] = useState(false);
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [tempHeading, setTempHeading] = useState(section?.title || "");
  const [showLinkInput, setShowLinkInput] = useState(false);

  useEffect(() => {
    if (entries.length === 0 && editingIndex === null) {
      handleAdd();
    }
  }, [entries.length]);

  const handleAdd = () => {
    const newEntry = {
      title: "",
      subtitle: "",
      location: "",
      startDate: "",
      endDate: "",
      content: "",
      link: "",
      visible: true,
    };
    setEditingIndex(entries.length);
    setEditEntry(newEntry);
    setShowLinkInput(false);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditEntry({ ...entries[index] });
    setShowLinkInput(!!entries[index].link);
  };

  const handleSaveHeading = () => {
    updateCustomSection(sectionId, { title: tempHeading });
    setIsEditingHeading(false);
  };

  const handleDone = () => {
    const newEntries = [...entries];
    if (editingIndex === entries.length) {
      newEntries.push(editEntry);
    } else {
      newEntries[editingIndex] = editEntry;
    }
    updateCustomSection(sectionId, { entries: newEntries });
    setEditingIndex(null);
    setEditEntry(null);
  };

  const handleRemoveEntry = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    updateCustomSection(sectionId, { entries: newEntries });
  };

  const toggleVisibility = (index) => {
    const newEntries = [...entries];
    newEntries[index].visible = !newEntries[index].visible;
    updateCustomSection(sectionId, { entries: newEntries });
  };

  if (editingIndex !== null) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Edit Entry
          </h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-lime-400 transition-colors text-xs font-bold">
              <Lightbulb className="w-4 h-4" />
              Get Tips
            </button>
            <button
              onClick={() => {
                setEditEntry({ ...editEntry, visible: !editEntry.visible });
              }}
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
                if (editingIndex < entries.length) {
                  handleRemoveEntry(editingIndex);
                }
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
              Title
            </label>
            <div className="relative">
              <input
                type="text"
                value={editEntry.title}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, title: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pr-20 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
                placeholder="Enter title"
              />
              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                  showLinkInput || editEntry.link
                    ? "bg-lime-400/10 text-lime-400 border-lime-400/20"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-lime-400 hover:border-lime-500/30"
                }`}
              >
                <LinkIcon className="w-3 h-3" />
                Link
              </button>
            </div>
            {showLinkInput && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <input
                  type="url"
                  value={editEntry.link || ""}
                  onChange={(e) =>
                    setEditEntry({ ...editEntry, link: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
                  placeholder="https://example.com"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Content
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
              value={editEntry.content}
              onChange={(e) =>
                setEditEntry({ ...editEntry, content: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all min-h-[150px] resize-none"
              placeholder="Enter your content here..."
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
      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl mb-6">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
          Section Heading
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tempHeading}
            onChange={(e) => setTempHeading(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
            placeholder="e.g. Core Competencies"
          />
          <button
            onClick={handleSaveHeading}
            className="px-6 py-3 bg-lime-500/20 border border-lime-500/30 rounded-xl font-bold text-lime-400 flex items-center justify-center gap-2 hover:bg-lime-500/30 transition-all active:scale-[0.98] shadow-sm"
          >
            <Check className="w-5 h-5" />
            Save
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={index}
            onClick={() => handleEdit(index)}
            className="group flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-lime-500/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
              <div>
                <span className="block font-bold text-white tracking-tight group-hover:text-lime-400 transition-colors">
                  {entry.title || "(No Title)"}
                </span>
                <span className="text-xs text-zinc-500 font-medium line-clamp-1 max-w-[300px]">
                  {entry.subtitle || entry.content || "Add your content..."}
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
                {entry.visible !== false ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveEntry(index);
                }}
                className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="flex-1 py-4 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
        <button
          onClick={() => removeCustomSection(sectionId)}
          className="px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-xl font-bold text-red-500 flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all active:scale-[0.98] shadow-sm"
          title="Delete Section"
        >
          <Trash2 className="w-5 h-5" />
          Delete Section
        </button>
      </div>
    </div>
  );
};

export default CustomForm;
