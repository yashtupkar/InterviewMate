import React, { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

const TEMPLATES = {
  professional: (score, subject, url) =>
    `I just completed ${subject} on PlaceMateAI and scored ${score}/100! 🚀✨\n\nSharpening my interview skills one session at a time. 📈\n🔗 Report: ${url} \n#PlaceMateAI #InterviewPrep #CareerGrowth\n\n`,
  casual: (score, subject, url) =>
    `Just crushed ${subject} on PlaceMateAI! 🔥 Scored ${score}/100 💪😎 #LevelUp #PlaceMateAI\n\n👉 Report: ${url}`,
  minimal: (score, subject, url) => `🎯 ${score}/100 on PlaceMateAI — ${subject}.\n🔗 ${url}`,
};

const TEMPLATE_LABELS = {
  professional: "Professional",
  casual: "Casual",
  minimal: "Minimal",
};

const CaptionEditor = ({ caption, setCaption, score, subject, shareUrl }) => {
  const [activeTemplate, setActiveTemplate] = useState("professional");
  const [copied, setCopied] = useState(false);

  const applyTemplate = (key) => {
    setActiveTemplate(key);
    setCaption(TEMPLATES[key](score, subject, shareUrl));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Template chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mr-1">
          Style
        </span>
        {Object.keys(TEMPLATES).map((key) => (
          <button
            key={key}
            onClick={() => applyTemplate(key)}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
              activeTemplate === key
                ? "bg-[#bef264] text-black border-transparent"
                : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10"
            }`}
          >
            {TEMPLATE_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={5}
          className="w-full bg-white/[0.03] border custom-scrollbar  border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-300 leading-relaxed resize-none outline-none focus:border-[#bef264]/40 transition-colors font-medium placeholder:text-zinc-600"
          placeholder="Write your caption..."
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span
            className={`text-[10px] font-bold ${
              caption.length > 2900 ? "text-red-400" : "text-zinc-600"
            }`}
          >
            {caption.length}/3000
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            title="Copy caption"
          >
            {copied ? (
              <FiCheck size={12} className="text-[#bef264]" />
            ) : (
              <FiCopy size={12} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptionEditor;
