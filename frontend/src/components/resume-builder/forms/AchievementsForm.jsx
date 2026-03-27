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
  Trophy,
  Sparkles,
} from "lucide-react";

const AchievementsForm = () => {
  const { resumeData, updateAchievements } = useResume();
  const { achievements } = resumeData;
  const [editingIndex, setEditingIndex] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [showAIUpgrade, setShowAIUpgrade] = useState(false);

  useEffect(() => {
    if (achievements.length === 0 && editingIndex === null) {
      handleAdd();
    }
  }, [achievements.length]);

  const handleAdd = () => {
    const newEntry = {
      title: "",
      date: "",
      description: "",
      visible: true,
    };
    setEditingIndex(achievements.length);
    setEditEntry(newEntry);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditEntry({ ...achievements[index] });
  };

  const handleDone = () => {
    const newAch = [...achievements];
    if (editingIndex === achievements.length) {
      newAch.push(editEntry);
    } else {
      newAch[editingIndex] = editEntry;
    }
    updateAchievements(newAch);
    setEditingIndex(null);
    setEditEntry(null);
  };

  const handleRemove = (index) => {
    const newAch = achievements.filter((_, i) => i !== index);
    updateAchievements(newAch);
  };

  const toggleVisibility = (index) => {
    const newAch = [...achievements];
    newAch[index].visible = !newAch[index].visible;
    updateAchievements(newAch);
  };

  if (editingIndex !== null) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Edit Achievement
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
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              <Trophy className="w-3 h-3 text-lime-400" />
              Achievement Title
            </label>
            <input
              type="text"
              value={editEntry.title}
              onChange={(e) =>
                setEditEntry({ ...editEntry, title: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
              placeholder="e.g. Hackathon Winner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Date
            </label>
            <MonthYearPicker
              value={editEntry.date}
              onChange={(val) => setEditEntry({ ...editEntry, date: val })}
            />
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
              placeholder="Describe your achievement..."
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
        {achievements.map((ach, index) => (
          <div
            key={index}
            onClick={() => handleEdit(index)}
            className="group flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-lime-500/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
              <div>
                <span className="block font-bold text-white tracking-tight group-hover:text-lime-400 transition-colors">
                  {ach.title || "(No Title)"}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {ach.date || "Date"}
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
                {ach.visible !== false ? (
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
        Add Achievement
      </button>
    </div>
  );
};

export default AchievementsForm;
