import React from "react";
import {
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiMic,
  FiShield,
  FiUsers,
  FiVideo,
  FiZap,
} from "react-icons/fi";

const topicSuggestions = [
  "DSA",
  "System Design",
  "React",
  "Node.js",
  "Behavioral",
  "SQL",
];

const HomeHeroSection = ({
  navigate,
  preferences,
  setPreferences,
  skillsInput,
  setSkillsInput,
  onToggle,
  onStartMatching,
  savingPrefs,
  queueBusy,
}) => (
  <div className="hero-gradient">
    <div className="max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-20">
      <div className="flex  gap-8 items-start">
        <div className="space-y-4 animate-fade-in">
          <div className="text-[#bef264] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block underline decoration-[#bef264]/30 underline-offset-4">
            Live Peer Practice
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[0.92]">
            Practice real{" "}
            <span className="text-[#bef264] italic">Interviews</span> with peers
          </h1>

          <p className="text-zinc-400 text-sm md:text-lg max-w-lg leading-relaxed">
            Get matched instantly based on your preferences and start a live
            interview.
          </p>

          <div className="glass-panel rounded-3xl p-5 space-y-4">
            <h2 className="text-lg font-bold">How It Works</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
                  Step 1
                </p>
                <p className="text-sm font-semibold">Set preferences</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
                  Step 2
                </p>
                <p className="text-sm font-semibold">Get matched instantly</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
                  Step 3
                </p>
                <p className="text-sm font-semibold">Start interview</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5 space-y-4">
            <h2 className="text-lg font-bold">Live System Signals</h2>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-white/10 p-3 bg-black/20">
                <p className="text-zinc-400 flex items-center gap-2">
                  <FiUsers className="text-[#bef264]" /> Users online
                </p>
                <p className="text-xl font-black mt-1">523</p>
              </div>
              <div className="rounded-xl border border-white/10 p-3 bg-black/20">
                <p className="text-zinc-400 flex items-center gap-2">
                  <FiClock className="text-[#bef264]" /> Avg match time
                </p>
                <p className="text-xl font-black mt-1">~8 sec</p>
              </div>
              <div className="rounded-xl border border-white/10 p-3 bg-black/20">
                <p className="text-zinc-400 flex items-center gap-2">
                  <FiShield className="text-[#bef264]" /> Success rate
                </p>
                <p className="text-xl font-black mt-1">92%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 lg:sticky lg:top-24">
          <div className="glass-panel rounded-3xl p-6 border-[#bef264]/20 shadow-2xl shadow-black/20 space-y-5">
            <div>
              <h2 className="text-2xl font-black">
                Set your interview preferences
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Configure once and start matching immediately.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs text-zinc-400 uppercase tracking-wider">
                  Role
                </span>
                <input
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-[#bef264]/50"
                  placeholder="Interviewer / Interviewee / Both"
                  value={preferences.targetRole || ""}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      targetRole: e.target.value,
                    }))
                  }
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs text-zinc-400 uppercase tracking-wider">
                  Preferred match
                </span>
                <select
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-[#bef264]/50"
                  value={preferences.preferredMatch}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      preferredMatch: e.target.value,
                    }))
                  }
                >
                  <option value="any">Any</option>
                  <option value="female_only">Female only</option>
                  <option value="male_only">Male only</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs text-zinc-400 uppercase tracking-wider">
                  Gender identity
                </span>
                <select
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-[#bef264]/50"
                  value={preferences.genderIdentity}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      genderIdentity: e.target.value,
                    }))
                  }
                >
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non_binary">Non-binary</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs text-zinc-400 uppercase tracking-wider">
                  Language
                </span>
                <input
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-[#bef264]/50"
                  placeholder="English"
                  value={preferences.preferredLanguage || "English"}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      preferredLanguage: e.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 uppercase tracking-wider">
                  Topics
                </span>
                <span className="text-[11px] text-zinc-500">Multi-select</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {topicSuggestions.map((topic) => {
                  const selected = skillsInput
                    .toLowerCase()
                    .split(",")
                    .map((s) => s.trim())
                    .includes(topic.toLowerCase());

                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        const existing = skillsInput
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);

                        const hasTopic = existing.some(
                          (s) => s.toLowerCase() === topic.toLowerCase(),
                        );

                        const next = hasTopic
                          ? existing.filter(
                              (s) => s.toLowerCase() !== topic.toLowerCase(),
                            )
                          : [...existing, topic];

                        setSkillsInput(next.join(", "));
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs border transition ${
                        selected
                          ? "bg-[#bef264]/15 border-[#bef264]/50 text-[#bef264]"
                          : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
              <input
                className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-[#bef264]/50"
                placeholder="Add custom topics (comma separated)"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => onToggle("isPeerMatchingEnabled")}
                className={`rounded-xl border px-3 py-2.5 font-semibold transition ${
                  preferences.isPeerMatchingEnabled
                    ? "border-[#bef264]/50 bg-[#bef264]/10 text-[#bef264]"
                    : "border-white/10 bg-zinc-950/60 text-zinc-300"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <FiZap /> Matching{" "}
                  {preferences.isPeerMatchingEnabled ? "ON" : "OFF"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToggle("allowDirectInvites")}
                className={`rounded-xl border px-3 py-2.5 font-semibold transition ${
                  preferences.allowDirectInvites
                    ? "border-[#bef264]/50 bg-[#bef264]/10 text-[#bef264]"
                    : "border-white/10 bg-zinc-950/60 text-zinc-300"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <FiActivity /> Direct invites{" "}
                  {preferences.allowDirectInvites ? "ON" : "OFF"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToggle("allowInstantMatch")}
                className={`rounded-xl border px-3 py-2.5 font-semibold transition ${
                  preferences.allowInstantMatch
                    ? "border-[#bef264]/50 bg-[#bef264]/10 text-[#bef264]"
                    : "border-white/10 bg-zinc-950/60 text-zinc-300"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <FiCheckCircle /> Instant match{" "}
                  {preferences.allowInstantMatch ? "ON" : "OFF"}
                </span>
              </button>

              <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-zinc-300 font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  {preferences.allowInstantMatch ? <FiVideo /> : <FiMic />}
                  {preferences.allowInstantMatch ? "Video" : "Audio"} mode
                </span>
              </div>
            </div>

            <button
              onClick={onStartMatching}
              disabled={savingPrefs || queueBusy}
              className="w-full mt-2 px-5 py-3.5 rounded-xl bg-[#bef264] text-black font-black hover:bg-[#a3e635] transition disabled:opacity-60"
            >
              {savingPrefs || queueBusy ? "Starting..." : "Start Matching"}
            </button>

            <p className="text-xs text-zinc-500 text-center">
              Preferences are saved automatically before matchmaking starts.
            </p>

            <div className="pt-1 text-[11px] text-zinc-400 flex items-center justify-center gap-2">
              <FiShield className="text-[#bef264]" />
              Session quality and matching confidence improve after each
              interview.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default HomeHeroSection;
