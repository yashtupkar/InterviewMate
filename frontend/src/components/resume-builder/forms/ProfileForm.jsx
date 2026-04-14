import React, { useState, useEffect } from "react";
import { useResume } from "../../../context/ResumeContext";
import AIUpgradePopup from "../../common/AIUpgradePopup";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Check,
  User,
  Sparkles,
} from "lucide-react";

const ProfileForm = ({ onDone }) => {
  const { resumeData, updateProfiles, rewriteResumeContent, resumeId } =
    useResume();
  const { getToken, isSignedIn } = useAuth();
  const { profiles = [] } = resumeData;
  const [editingIndex, setEditingIndex] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [showAIUpgrade, setShowAIUpgrade] = useState(false);
  const [tier, setTier] = useState("Free");
  const [isRewriting, setIsRewriting] = useState(false);

  const canUseAiRewrite = tier !== "Free";

  useEffect(() => {
    const fetchTier = async () => {
      if (!isSignedIn) return;
      try {
        const token = await getToken();
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setTier(res.data?.tier || "Free");
      } catch (error) {
        console.error("Failed to fetch subscription tier:", error);
      }
    };

    fetchTier();
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (profiles.length === 0 && editingIndex === null) {
      handleAdd();
    }
  }, [profiles.length]);

  const handleAdd = () => {
    const newEntry = {
      title: "Professional Summary",
      content: "",
      visible: true,
    };
    setEditingIndex(profiles.length);
    setEditEntry(newEntry);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditEntry({ ...profiles[index] });
  };

  const handleDone = () => {
    const newProfiles = [...profiles];
    if (editingIndex === profiles.length) {
      if (editEntry.content.trim()) {
        newProfiles.push(editEntry);
      }
    } else if (editEntry.content.trim()) {
      newProfiles[editingIndex] = editEntry;
    } else {
      newProfiles.splice(editingIndex, 1);
    }
    updateProfiles(newProfiles);
    setEditingIndex(null);
    setEditEntry(null);
  };

  const handleRemove = (index) => {
    const newProfiles = profiles.filter((_, i) => i !== index);
    updateProfiles(newProfiles);
  };

  const toggleVisibility = (index) => {
    const newProfiles = [...profiles];
    newProfiles[index].visible = !newProfiles[index].visible;
    updateProfiles(newProfiles);
  };

  const handleAiRewrite = async () => {
    if (!canUseAiRewrite) {
      setShowAIUpgrade(true);
      return;
    }

    if (!resumeId) {
      toast.error("Please sync this resume before using AI rewrite.");
      return;
    }

    const sourceText = editEntry?.content?.trim();
    if (!sourceText) {
      toast.error("Add some summary text first.");
      return;
    }

    setIsRewriting(true);
    try {
      const response = await rewriteResumeContent({
        resumeId,
        mode: "section",
        target: "profiles",
        content: sourceText,
      });

      const rewritten = response?.data?.rewritten;
      if (rewritten) {
        setEditEntry((prev) => ({
          ...prev,
          content: rewritten,
        }));
        toast.success("Summary rewritten successfully.");
      } else {
        toast.error("No rewritten content returned.");
      }
    } catch (error) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message || "Failed to rewrite summary.";

      if (status === 403) {
        setShowAIUpgrade(true);
      } else {
        toast.error(message);
      }
    } finally {
      setIsRewriting(false);
    }
  };

  if (editingIndex !== null) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Professional Summary
          </h2>
          <div className="flex items-center gap-2">
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
                if (editingIndex < profiles.length) {
                  handleRemove(editingIndex);
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
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={handleAiRewrite}
                disabled={isRewriting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed text-lime-400 rounded-lg border border-zinc-800 text-[10px] font-black uppercase tracking-widest transition-all group"
              >
                <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform" />
                {isRewriting ? "Rewriting..." : "Rewrite with AI"}
              </button>
            </div>
            <textarea
              value={editEntry.content}
              onChange={(e) =>
                setEditEntry({ ...editEntry, content: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all min-h-[150px] resize-none"
              placeholder="e.g. Results-oriented professional with a proven track record..."
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
        {profiles.map((profile, index) => (
          <div
            key={index}
            onClick={() => handleEdit(index)}
            className="group flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-lime-500/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
              <div>
                <span className="text-xs text-zinc-500 font-medium line-clamp-2 max-w-[300px]">
                  {profile.content || "Add your summary content..."}
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
                {profile.visible !== false ? (
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
        Add Profile
      </button>
    </div>
  );
};

export default ProfileForm;
