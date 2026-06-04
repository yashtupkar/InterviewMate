import React, { useMemo, useState } from "react";
import {
  IoSparkles,
  IoDocumentText,
  IoReload,
  IoCheckmark,
} from "react-icons/io5";

const AIToolsSection = ({
  onFullRewrite,
  isRewriting,
  rewriteInsights,
  rewriteResult,
  onApplySuggestedSkills,
  skillsApplied,
  onDoneRewrite,
}) => {
  const fullRewriteCreditCost = 10;
  const [mode, setMode] = useState("without_jd");
  const [jobDescription, setJobDescription] = useState("");

  const requiresJobDescription = mode === "with_jd";
  const canRewrite =
    !isRewriting && (!requiresJobDescription || jobDescription.trim());

  const keywordSuggestions = useMemo(() => {
    const items = rewriteInsights?.keywordSuggestions || [];
    return items
      .map((item) => {
        if (typeof item === "string") {
          return { keyword: item, section: "experience", priority: "medium" };
        }
        return {
          keyword: item?.keyword || "",
          section: item?.section || "experience",
          priority: item?.priority || "medium",
        };
      })
      .filter((item) => item.keyword);
  }, [rewriteInsights]);

  const missingSkills = useMemo(() => {
    const items = rewriteInsights?.missingSkills || [];
    return items
      .map((item) => {
        if (typeof item === "string") {
          return {
            skill: item,
            category: "Tools",
            reason: "Suggested for better JD alignment.",
            priority: "medium",
          };
        }

        return {
          skill: item?.skill || "",
          category: item?.category || "Tools",
          reason: item?.reason || "Suggested for better JD alignment.",
          priority: item?.priority || "medium",
        };
      })
      .filter((item) => item.skill);
  }, [rewriteInsights]);

  const handleRewrite = async () => {
    if (!canRewrite) return;
    await onFullRewrite({
      withJobDescription: requiresJobDescription,
      jobDescription: requiresJobDescription ? jobDescription.trim() : "",
    });
  };

  const handleDone = () => {
    setMode("without_jd");
    setJobDescription("");
    onDoneRewrite?.();
  };

  const isResultMode = Boolean(rewriteResult);

  return (
    <div className="p-3 md:p-6 space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 mb-4">
          <IoSparkles className="w-3.5 h-3.5 text-lime-400" />
          <span className="text-[10px] font-bold text-lime-400 uppercase tracking-widest">
            AI Tools
          </span>
        </div>
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
          AI Resume Tools
        </h2>
        <p className="text-sm text-zinc-500 font-medium">
          Rewrite your full resume with best practices and automatic
          spelling/grammar correction.
        </p>
      </div>

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4 overflow-hidden">
        {isRewriting && (
          <div className="absolute inset-0 z-20 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center px-6 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-lime-400/20 border-t-lime-400 animate-spin mb-4" />
            <p className="text-white font-black text-sm tracking-wide">
              Rewriting your resume...
            </p>
            <p className="text-zinc-400 text-xs mt-2 max-w-[260px] leading-relaxed">
              Tailoring keywords, improving grammar, and updating content from
              your JD.
            </p>
            <div className="mt-5 w-full max-w-[260px] h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 animate-pulse" />
            </div>
          </div>
        )}

        {!isResultMode ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white">
                Full Resume Rewrite
              </h3>
              <span className="inline-flex items-center rounded-full border border-lime-400/20 bg-lime-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-lime-400">
                {fullRewriteCreditCost} credits
              </span>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 cursor-pointer hover:border-zinc-700 transition-colors">
              <input
                type="radio"
                name="ai-full-rewrite-mode"
                value="without_jd"
                checked={mode === "without_jd"}
                onChange={() => setMode("without_jd")}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  Without Job Description
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Improve with general ATS-friendly resume writing rules.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 cursor-pointer hover:border-zinc-700 transition-colors">
              <input
                type="radio"
                name="ai-full-rewrite-mode"
                value="with_jd"
                checked={mode === "with_jd"}
                onChange={() => setMode("with_jd")}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  With Job Description
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Tailor resume content and keyword usage according to the JD.
                </p>
              </div>
            </label>

            {requiresJobDescription && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description here..."
                  className="w-full min-h-[160px] bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all resize-y"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleRewrite}
              disabled={!canRewrite}
              className="w-full py-3 bg-lime-400 hover:bg-lime-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 text-sm font-black tracking-wide rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isRewriting ? (
                <IoReload className="w-4 h-4 animate-spin" />
              ) : (
                <IoDocumentText className="w-4 h-4" />
              )}
              {isRewriting
                ? "Rewriting Resume..."
                : `Rewrite Full Resume • ${fullRewriteCreditCost} Credits`}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                Role Update
              </h4>
              <p className="text-xs text-zinc-400">
                Before:{" "}
                <span className="text-zinc-200 font-semibold">
                  {rewriteResult?.before?.role || "Not set"}
                </span>
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                After:{" "}
                <span className="text-lime-300 font-semibold">
                  {rewriteResult?.after?.role || "Not set"}
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">
                Summary Compare
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Before:{" "}
                {rewriteResult?.before?.summary || "No summary available."}
              </p>
              <p className="text-[11px] text-lime-200 leading-relaxed">
                After:{" "}
                {rewriteResult?.after?.summary || "No summary available."}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">
                Experience Highlights Compare
              </h4>
              <div className="space-y-2">
                {(rewriteResult?.before?.experienceHighlights || []).map(
                  (line, index) => (
                    <p
                      key={`before-exp-${index}`}
                      className="text-[11px] text-zinc-400 leading-relaxed"
                    >
                      Before {index + 1}: {line}
                    </p>
                  ),
                )}
                {(rewriteResult?.after?.experienceHighlights || []).map(
                  (line, index) => (
                    <p
                      key={`after-exp-${index}`}
                      className="text-[11px] text-lime-200 leading-relaxed"
                    >
                      After {index + 1}: {line}
                    </p>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {(keywordSuggestions.length > 0 || missingSkills.length > 0) &&
          !isRewriting && (
            <div className="space-y-4 border-t border-zinc-800 pt-4">
              {keywordSuggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">
                      Keyword Suggestions
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keywordSuggestions.map((keyword) => (
                      <span
                        key={`${keyword.keyword}-${keyword.section}`}
                        className="inline-flex items-center rounded-full border border-lime-400/20 bg-lime-400/10 px-2.5 py-1 text-[11px] font-bold text-lime-300"
                      >
                        {keyword.keyword} • {keyword.section}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {missingSkills.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">
                      Suggested Missing Skills
                    </h4>
                    {skillsApplied ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-lime-300">
                        <IoCheckmark className="w-3.5 h-3.5" />
                        Skills Applied
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onApplySuggestedSkills?.(missingSkills)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-700 transition-colors"
                      >
                        <IoCheckmark className="w-3.5 h-3.5" />
                        Apply Skills
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {missingSkills.map((skill) => (
                      <div
                        key={`${skill.skill}-${skill.priority}`}
                        className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-zinc-200">
                            {skill.skill}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-lime-400 font-black">
                            {skill.category || "Tools"} • {skill.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          {skill.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        {isResultMode && !isRewriting && (
          <button
            type="button"
            onClick={handleDone}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-black tracking-wide rounded-xl transition-all"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

export default AIToolsSection;
