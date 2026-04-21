import React from "react";
import { FiXCircle } from "react-icons/fi";

const PreferenceModal = ({
  show,
  onClose,
  preferences,
  setPreferences,
  skillsInput,
  setSkillsInput,
  onToggle,
  onSave,
  savingPrefs,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-[#121214] border border-white/10 rounded-3xl p-8 shadow-2xl animate-modal-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold">Interview Preferences</h3>
            <p className="text-zinc-400 text-sm mt-1">
              Customize how you interact with other peers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition"
          >
            <FiXCircle size={24} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              Gender Identity
            </label>
            <select
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 focus:border-[#bef264]/50 focus:ring-1 focus:ring-[#bef264]/50 transition outline-none"
              value={preferences.genderIdentity}
              onChange={(e) =>
                setPreferences((p) => ({
                  ...p,
                  genderIdentity: e.target.value,
                }))
              }
            >
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non_binary">Non-binary</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              Preferred Match
            </label>
            <select
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 focus:border-[#bef264]/50 focus:ring-1 focus:ring-[#bef264]/50 transition outline-none"
              value={preferences.preferredMatch}
              onChange={(e) =>
                setPreferences((p) => ({
                  ...p,
                  preferredMatch: e.target.value,
                }))
              }
            >
              <option value="any">Any</option>
              <option value="female_only">Female only</option>
              <option value="male_only">Male only</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              Target Role
            </label>
            <input
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 focus:border-[#bef264]/50 focus:ring-1 focus:ring-[#bef264]/50 transition outline-none"
              placeholder="e.g. Software Engineer"
              value={preferences.targetRole || ""}
              onChange={(e) =>
                setPreferences((p) => ({
                  ...p,
                  targetRole: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              Preferred Language
            </label>
            <input
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 focus:border-[#bef264]/50 focus:ring-1 focus:ring-[#bef264]/50 transition outline-none"
              value={preferences.preferredLanguage || "English"}
              onChange={(e) =>
                setPreferences((p) => ({
                  ...p,
                  preferredLanguage: e.target.value,
                }))
              }
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              Target Skills (comma-separated)
            </label>
            <input
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 focus:border-[#bef264]/50 focus:ring-1 focus:ring-[#bef264]/50 transition outline-none"
              placeholder="React, Node.js, System Design"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
          <div className="flex gap-4">
            <button
              onClick={() => onToggle("isPeerMatchingEnabled")}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition ${preferences.isPeerMatchingEnabled ? "bg-[#bef264]/10 border-[#bef264] text-[#bef264]" : "bg-white/5 border-white/10 text-zinc-400"}`}
            >
              Matching {preferences.isPeerMatchingEnabled ? "ON" : "OFF"}
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={savingPrefs}
              className="px-8 py-2.5 rounded-xl bg-[#bef264] text-black font-bold hover:bg-[#a3e635] transition shadow-lg shadow-[#bef264]/20 disabled:opacity-50"
            >
              {savingPrefs ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceModal;
