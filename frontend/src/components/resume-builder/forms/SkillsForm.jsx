import React, { useState, useEffect } from "react";
import { useResume } from "../../../context/ResumeContext";
import AIUpgradePopup from "../../common/AIUpgradePopup";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Brain,
  Check,
  Sparkles,
} from "lucide-react";

const SkillsForm = () => {
  const { resumeData, updateSkills } = useResume();
  const { skills } = resumeData;
  const [editingIndex, setEditingIndex] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [showAIUpgrade, setShowAIUpgrade] = useState(false);

  useEffect(() => {
    if (skills.length === 0 && editingIndex === null) {
      handleAddEntry();
    }
  }, [skills.length]);

  const handleAddEntry = () => {
    const newEntry = {
      category: "",
      subSkills: "",
      level: "Beginner",
      visible: true,
    };
    setEditingIndex(skills.length);
    setEditEntry(newEntry);
  };

  const handleEditEntry = (index) => {
    setEditingIndex(index);
    setEditEntry({ ...skills[index] });
  };

  const handleDone = () => {
    const newSkills = [...skills];
    if (editingIndex === skills.length) {
      newSkills.push(editEntry);
    } else {
      newSkills[editingIndex] = editEntry;
    }
    updateSkills(newSkills);
    setEditingIndex(null);
    setEditEntry(null);
  };

  const handleRemoveEntry = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    updateSkills(newSkills);
  };

  const toggleVisibility = (index) => {
    const newSkills = [...skills];
    newSkills[index].visible = !newSkills[index].visible;
    updateSkills(newSkills);
  };

  if (editingIndex !== null) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Edit Entry
          </h2>
          <div className="flex items-center gap-4">
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
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Skill
            </label>
            <input
              type="text"
              value={editEntry.category}
              onChange={(e) =>
                setEditEntry({ ...editEntry, category: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-zinc-600 shadow-sm"
              placeholder="e.g. Programing Languages:"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Information / Sub-skills
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
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <textarea
                value={editEntry.subSkills}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, subSkills: e.target.value })
                }
                className="w-full bg-transparent px-4 py-3 text-sm text-white focus:outline-none min-h-[100px] resize-none"
                placeholder="C, C++, JavaScript"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Skill level
            </label>
            <select
              value={editEntry.level}
              onChange={(e) =>
                setEditEntry({ ...editEntry, level: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all shadow-sm appearance-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
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
        {skills.map((skill, index) => (
          <div
            key={index}
            onClick={() => handleEditEntry(index)}
            className="group flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-lime-500/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
              <span className="font-bold text-white tracking-tight group-hover:text-lime-400 transition-colors">
                {skill.category || "(No Title)"}
              </span>
            </div>
            <div className="flex items-center gap-2 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(index);
                }}
                className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-lime-400 transition-colors"
              >
                {skill.visible ? (
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

      <div className="flex items-center gap-4 pt-4">
        <button
          onClick={handleAddEntry}
          className="flex-1 py-4 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Entry
        </button>
      </div>
    </div>
  );
};

export default SkillsForm;
