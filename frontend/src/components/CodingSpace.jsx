import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  FiPlay, FiSend, FiClock, FiRefreshCw,
  FiChevronRight, FiCode, FiTerminal, FiX,
  FiChevronDown, FiChevronUp, FiAlignLeft,
  FiAlertCircle, FiCheckCircle, FiThumbsUp,
  FiMaximize2, FiMinimize2, FiSettings, FiCopy,
  FiRotateCcw, FiBookOpen, FiTag, FiInfo
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const backendURL = import.meta.env.VITE_BACKEND_URL;

/* ─── Default demo question ──────────────────────────────────────────────── */
const DEFAULT_TASK = {
  id: 1,
  title: "Coding challenge",
  difficulty: "Medium",
  language: "javascript",
  timeLimit: 300,
  tags: ["Algorithm"],
  question: `Please implement the solution for the question asked by the interviewer.`,
  examples: [],
  constraints: [],
  hints: [],
  initialCode: `// Write your solution here
function solution() {
  
}

// You can run your code to see the output below.
`,
};

/* ─── Language starter templates ─────────────────────────────────────────── */
const LANG_TEMPLATES = {
  javascript: DEFAULT_TASK.initialCode,
  python: `# Write your solution here
def solution():
    pass
`,
  cpp: `#include <iostream>
using namespace std;

// Write your solution here
void solution() {
    
}

int main() {
    solution();
    return 0;
}
`,
  java: `import java.util.*;

class Solution {
    // Write your solution here
    public static void main(String[] args) {
        
    }
}
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Page</title>
  <style>
    body {
      font-family: sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      color: #eee;
    }
    .card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 2rem 3rem;
      text-align: center;
      backdrop-filter: blur(10px);
    }
    h1 { color: #bef264; margin-bottom: 0.5rem; }
    button {
      margin-top: 1rem;
      padding: 0.6rem 1.5rem;
      background: #bef264;
      color: #000;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    button:hover { opacity: 0.85; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, World! 👋</h1>
    <p>Edit this HTML to see live changes in the preview panel.</p>
    <button onclick="alert('It works!')">Click Me</button>
  </div>
</body>
</html>
`,
  css: `/* CSS Challenge – style the page below */
body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background: #0f0f12;
  color: #fff;
}

.container {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  color: #bef264;
  margin-bottom: 1rem;
}

p {
  color: #888;
  font-size: 1rem;
  line-height: 1.6;
}

.badge {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.4rem 1rem;
  background: #bef264;
  color: #000;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
}
`,
};

const LANG_MONACO = {
  javascript: "javascript",
  python: "python",
  cpp: "cpp",
  java: "java",
  html: "html",
  css: "css",
};

/* HTML built around CSS-only template for the iframe */
const CSS_WRAPPER_HTML = (css) => `<!DOCTYPE html>
<html><head><style>${css}</style></head>
<body>
  <div class="container">
    <h1>CSS Preview</h1>
    <p>Your styles are applied live to this page.</p>
    <span class="badge">Live Preview</span>
  </div>
</body></html>`;

const DIFFICULTY_STYLES = {
  Easy:   { text: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  Medium: { text: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20"   },
  Hard:   { text: "text-red-400",     bg: "bg-red-400/10 border-red-400/20"       },
};

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function ProblemPanel({ task }) {
  const [activeTab, setActiveTab] = useState("description");
  const [expandedHint, setExpandedHint] = useState(null);
  const diff = DIFFICULTY_STYLES[task.difficulty] || DIFFICULTY_STYLES.Easy;

  return (
    <div className="flex flex-col h-full bg-[#1a1a1e] overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#141417] border-b border-white/5">
        <FiBookOpen className="text-primary" size={14} />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Problem</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-2 pt-2 gap-1 bg-[#141417] border-b border-white/5">
        {["description", "hints"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-t-lg transition-all capitalize
              ${activeTab === tab
                ? "text-white bg-[#1a1a1e] border-t border-l border-r border-white/10"
                : "text-zinc-500 hover:text-zinc-300"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
        {activeTab === "description" && (
          <>
            {/* Title + Difficulty */}
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className="text-zinc-500 text-xs font-bold">#{task.id}</span>
                <h2 className="text-base font-black text-white">{task.title}</h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${diff.bg} ${diff.text}`}>
                  {task.difficulty}
                </span>
                {task.tags?.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-full">
                    <FiTag size={9} />{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{task.question}</p>

            {/* Examples */}
            {task.examples?.length > 0 && (
              <div className="space-y-3">
                {task.examples.map((ex, i) => (
                  <div key={i} className="rounded-xl border border-white/8 bg-zinc-900/50 overflow-hidden">
                    <div className="px-4 py-2 bg-zinc-900 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Example {i + 1}</span>
                    </div>
                    <div className="p-4 space-y-2 font-mono text-xs">
                      <div>
                        <span className="text-zinc-500">Input: </span>
                        <span className="text-zinc-200">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Output: </span>
                        <span className="text-primary font-bold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div className="pt-1 border-t border-white/5">
                          <span className="text-zinc-500">Explanation: </span>
                          <span className="text-zinc-400">{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {task.constraints?.length > 0 && (
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-1.5">
                  <FiInfo size={11} /> Constraints
                </h4>
                <ul className="space-y-1">
                  {task.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-300 font-mono">
                      <span className="text-primary mt-0.5">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {activeTab === "hints" && (
          <div className="space-y-3">
            {task.hints?.length > 0 ? task.hints.map((hint, i) => (
              <div key={i} className="rounded-xl border border-white/8 bg-zinc-900/50 overflow-hidden">
                <button
                  onClick={() => setExpandedHint(expandedHint === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800/40 transition-colors"
                >
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                    Hint {i + 1}
                  </span>
                  {expandedHint === i ? <FiChevronUp size={14} className="text-zinc-500" /> : <FiChevronDown size={14} className="text-zinc-500" />}
                </button>
                {expandedHint === i && (
                  <div className="px-4 pb-4 pt-1 text-sm text-zinc-300 leading-relaxed border-t border-white/5">
                    {hint}
                  </div>
                )}
              </div>
            )) : (
              <p className="text-zinc-500 text-sm text-center py-8">No hints available for this problem.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Terminal({ output, isRunning, onClear }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  const lines = output
    ? output.split("\n")
    : ["// Output will appear here after you click Run ▶"];

  return (
    <div className="flex flex-col h-full bg-[#0d0d10]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#141417] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <FiTerminal className="text-emerald-400" size={13} />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Terminal</span>
          {isRunning && (
            <div className="flex items-center gap-1 text-amber-400">
              <FiRefreshCw size={10} className="animate-spin" />
              <span className="text-[9px] font-bold">Running...</span>
            </div>
          )}
        </div>
        <button
          onClick={onClear}
          className="text-zinc-600 hover:text-zinc-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-xs">
        {/* Prompt line */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-primary">➜</span>
          <span className="text-zinc-500">~/workspace</span>
          <span className="text-zinc-600 text-[10px]">$</span>
          <span className="text-zinc-400">node solution.js</span>
        </div>
        <div className="space-y-0.5">
          {lines.map((line, i) => {
            const isError = line.toLowerCase().includes("error") || line.toLowerCase().includes("exception");
            const isSuccess = line.toLowerCase().includes("success") || line.startsWith("[");
            return (
              <div key={i} className={`leading-5 ${
                isError ? "text-red-400" : isSuccess ? "text-emerald-400" : "text-zinc-300"
              }`}>
                {line || "\u00A0"}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
const CodingSpace = ({ task: taskProp, onSubmit, disableCopyPaste = false }) => {
  const task = taskProp || DEFAULT_TASK;

  const [language, setLanguage] = useState(task.language || "javascript");
  const [code, setCode] = useState(LANG_TEMPLATES[task.language] || task.initialCode || "");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(task.timeLimit || 1800);
  // preview mode: 'editor' | 'split' | 'preview' (html/css only)
  const isWebLang = (l) => l === "html" || l === "css";
  const [previewMode, setPreviewMode] = useState(
    isWebLang(task.language || "javascript") ? "split" : "editor"
  );
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [panelWidth, setPanelWidth] = useState(40); // percent for left panel
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingTerminal, setIsResizingTerminal] = useState(false);

  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const terminalResizeRef = useRef(null);
  const editorContainerRef = useRef(null); // for copy-paste blocking

  /* ── Disable copy/paste when the prop is active ───────────────────── */
  useEffect(() => {
    if (!disableCopyPaste) return;
    const container = editorContainerRef.current;
    if (!container) return;

    const blockCopyPaste = (e) => {
      const key = e.key?.toLowerCase();
      // Block Ctrl/Cmd + C, V, X
      if ((e.ctrlKey || e.metaKey) && (key === "c" || key === "v" || key === "x")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const blockPaste = (e) => { e.preventDefault(); e.stopPropagation(); };
    const blockContext = (e) => { e.preventDefault(); };

    container.addEventListener("keydown", blockCopyPaste, true);
    container.addEventListener("paste", blockPaste, true);
    container.addEventListener("contextmenu", blockContext, true);
    document.addEventListener("keydown", blockCopyPaste, true);

    return () => {
      container.removeEventListener("keydown", blockCopyPaste, true);
      container.removeEventListener("paste", blockPaste, true);
      container.removeEventListener("contextmenu", blockContext, true);
      document.removeEventListener("keydown", blockCopyPaste, true);
    };
  }, [disableCopyPaste]);

  /* Timer */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Handle auto-submit when time is up
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit(true);
    }
  }, [timeLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  /* Horizontal panel resize */
  const handlePanelMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setPanelWidth(Math.min(Math.max(pct, 20), 70));
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [isDragging]);

  /* Terminal vertical resize */
  const handleTerminalMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizingTerminal(true);
  }, []);

  useEffect(() => {
    if (!isResizingTerminal) return;
    const onMove = (e) => {
      const container = terminalResizeRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newH = rect.bottom - e.clientY;
      setTerminalHeight(Math.min(Math.max(newH, 100), 500));
    };
    const onUp = () => setIsResizingTerminal(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [isResizingTerminal]);

  /* Language change */
  const handleLangChange = (lang) => {
    setLanguage(lang);
    setCode(LANG_TEMPLATES[lang] || task.initialCode || "");
    setOutput("");
    // auto-switch to split preview for web languages
    setPreviewMode(isWebLang(lang) ? "split" : "editor");
  };

  /* Derived: the srcdoc to feed the preview iframe */
  const getPreviewDoc = () => {
    if (language === "html") return code;
    if (language === "css") return CSS_WRAPPER_HTML(code);
    return "";
  };

  /* Run Code */
  const handleRunCode = async () => {
    if (isWebLang(language)) {
      // For html/css, "Run" just ensures split-preview is visible
      setPreviewMode("split");
      toast.success("Preview refreshed!");
      return;
    }
    setIsRunning(true);
    setOutput("Executing code…\n");
    try {
      const resp = await fetch(
        `${backendURL}/api/coding/execute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ script: code, language }),
        }
      );
      const data = await resp.json();
      if (data.output) setOutput(data.output);
      else if (data.error) setOutput(`Error: ${data.error}`);
      else setOutput("✓ Execution complete (no output).");
    } catch {
      setOutput("Error: Could not reach the execution server.\nMake sure the backend is running.");
      toast.error("Execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  /* Submit */
  const handleSubmit = (isAuto = false) => {
    if (isAuto) toast.success("Time's up! Submitting automatically…");
    else toast.success("Solution submitted! Great work 🎉");
    onSubmit?.({ code, language, output, isAutoSubmit: isAuto });
  };

  /* Copy code */
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => toast.success("Code copied!"));
  };

  /* Reset */
  const handleReset = () => {
    setCode(LANG_TEMPLATES[language] || task.initialCode || "");
    setOutput("");
    toast("Code reset to default.");
  };

  const isTimeLow = timeLeft < 120;

  return (
    <div
      ref={editorContainerRef}
      className={`flex flex-col bg-[#141417] overflow-hidden ${isFullscreen ? "fixed inset-0 z-[200]" : "h-full"}`}
      style={{ userSelect: isDragging || isResizingTerminal ? "none" : "auto" }}
    >
      {/* ── Anti-cheat Banner (interview mode) ───────────────────────── */}
      {disableCopyPaste && (
        <div className="flex items-center justify-center gap-2 py-1.5 bg-red-500/10 border-b border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] shrink-0">
          <span>🔒</span> Interview Mode — Copy &amp; Paste Disabled
        </div>
      )}
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f0f12] border-b border-white/5 shrink-0 gap-4">
        {/* Left: Problem title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
          <span className="text-sm font-black text-white truncate">{task.title || "Coding Challenge"}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0
            ${(DIFFICULTY_STYLES[task.difficulty] || DIFFICULTY_STYLES.Easy).bg}
            ${(DIFFICULTY_STYLES[task.difficulty] || DIFFICULTY_STYLES.Easy).text}`}>
            {task.difficulty || "Easy"}
          </span>
        </div>

        {/* Center: Language selector */}
        <div className="flex items-center gap-1 bg-[#1a1a1e] border border-white/8 rounded-lg p-1 shrink-0">
          {Object.keys(LANG_TEMPLATES).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLangChange(lang)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all
                ${language === lang ? "bg-primary text-black shadow" : "text-zinc-500 hover:text-white"}`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-black transition-all
            ${isTimeLow ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-[#1a1a1e] border-white/8 text-zinc-200"}`}>
            <FiClock size={12} className={isTimeLow ? "animate-pulse" : ""} />
            {formatTime(timeLeft)}
          </div>

          {!disableCopyPaste && (
            <button onClick={handleCopy} title="Copy code" className="p-2 rounded-lg text-zinc-500 hover:text-white bg-[#1a1a1e] border border-white/8 transition-all">
              <FiCopy size={14} />
            </button>
          )}
          <button onClick={handleReset} title="Reset code" className="p-2 rounded-lg text-zinc-500 hover:text-white bg-[#1a1a1e] border border-white/8 transition-all">
            <FiRotateCcw size={14} />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} title="Settings" className="p-2 rounded-lg text-zinc-500 hover:text-white bg-[#1a1a1e] border border-white/8 transition-all">
            <FiSettings size={14} />
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} title="Fullscreen" className="p-2 rounded-lg text-zinc-500 hover:text-white bg-[#1a1a1e] border border-white/8 transition-all">
            {isFullscreen ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
          </button>

          <div className="w-px h-5 bg-white/10" />

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1e] hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-white/8 transition-all active:scale-95 disabled:opacity-50"
          >
            {isRunning ? <FiRefreshCw size={13} className="animate-spin" /> : <FiPlay size={13} className="fill-primary text-primary" />}
            Run
          </button>
          <button
            onClick={() => handleSubmit(false)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#a3e635] text-black rounded-lg text-xs font-black transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <FiSend size={13} />
            Submit
          </button>
        </div>
      </div>

      {/* Settings dropdown */}
      {showSettings && (
        <div className="absolute top-14 right-4 z-50 bg-[#1a1a1e] border border-white/10 rounded-xl p-4 shadow-2xl w-56">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400">Editor Settings</span>
            <button onClick={() => setShowSettings(false)}><FiX size={14} className="text-zinc-500" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Font Size: {fontSize}px</label>
              <input
                type="range" min={11} max={22} value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full mt-1 accent-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Main Split Layout ─────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0" ref={containerRef}>

        {/* Left: Problem Panel */}
        <div style={{ width: `${panelWidth}%` }} className="flex flex-col min-w-0 shrink-0">
          <ProblemPanel task={task} />
        </div>

        {/* Drag Handle */}
        <div
          onMouseDown={handlePanelMouseDown}
          className={`w-1 shrink-0 cursor-col-resize flex items-center justify-center relative group transition-colors
            ${isDragging ? "bg-primary/40" : "bg-white/5 hover:bg-primary/30"}`}
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
          <div className="w-0.5 h-12 rounded-full bg-white/20 group-hover:bg-primary/60 transition-colors" />
        </div>

        {/* Right: Editor + Preview/Terminal */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0" ref={terminalResizeRef}>

          {isWebLang(language) ? (
            /* ── HTML / CSS mode: editor + live preview ── */
            <div className="flex flex-col flex-1 min-h-0">
              {/* Web toolbar */}
              <div className="flex items-center justify-between px-4 py-1.5 bg-[#141417] border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1e] border border-white/8 rounded-t-lg">
                    <FiCode size={11} className="text-primary" />
                    <span className="text-[10px] font-bold text-zinc-400">
                      index.{language}
                    </span>
                  </div>
                </div>
                {/* View mode toggle */}
                <div className="flex items-center gap-1 bg-[#1a1a1e] border border-white/8 rounded-lg p-0.5">
                  {[
                    { id: "editor",  label: "Editor",  Icon: FiCode },
                    { id: "split",   label: "Split",   Icon: FiAlignLeft },
                    { id: "preview", label: "Preview", Icon: FiMaximize2 },
                  ].map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setPreviewMode(id)}
                      title={label}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition-all
                        ${previewMode === id ? "bg-primary text-black" : "text-zinc-500 hover:text-white"}`}
                    >
                      <Icon size={11} />{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor + Iframe area */}
              <div className="flex flex-1 min-h-0">
                {/* Monaco editor (hidden in preview-only) */}
                {previewMode !== "preview" && (
                  <div className={`flex flex-col min-h-0 ${previewMode === "split" ? "w-1/2" : "w-full"}`}>
                    <Editor
                      height="100%"
                      theme="vs-dark"
                      language={LANG_MONACO[language] || "html"}
                      value={code}
                      onChange={(v) => setCode(v || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                        padding: { top: 16, bottom: 16 },
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        roundedSelection: true,
                        renderLineHighlight: "all",
                        scrollbar: { useShadows: false, vertical: "visible", horizontal: "visible", verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                        lineNumbers: "on",
                        glyphMargin: false,
                        lineDecorationsWidth: 10,
                        folding: true,
                        bracketPairColorization: { enabled: true },
                        autoClosingBrackets: "always",
                        autoClosingQuotes: "always",
                       formatOnPaste: true,
                        tabSize: 2,
                        wordWrap: "on",
                        // interview anti-cheat
                        ...(disableCopyPaste && { contextmenu: false, copyWithSyntaxHighlighting: false }),
                      }}
                    />
                  </div>
                )}

                {/* Divider between editor and preview */}
                {previewMode === "split" && (
                  <div className="w-px bg-white/8 shrink-0" />
                )}

                {/* Live preview iframe (hidden in editor-only) */}
                {previewMode !== "editor" && (
                  <div className={`flex flex-col min-h-0 bg-white ${previewMode === "split" ? "w-1/2" : "w-full"}`}>
                    {/* Preview header bar */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-b border-gray-200 shrink-0">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 bg-white rounded-md px-3 py-0.5 text-[10px] text-gray-400 font-mono border border-gray-200 truncate">
                        Live Preview · {language.toUpperCase()}
                      </div>
                    </div>
                    <iframe
                      key={code}  /* re-mount on each code change for true live reload */
                      title="live-preview"
                      srcDoc={getPreviewDoc()}
                      sandbox="allow-scripts allow-modals"
                      className="flex-1 w-full border-none"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── Normal language mode: Monaco + Terminal ── */
            <>
              {/* Editor area */}
              <div className="flex-1 min-h-0 flex flex-col">
                {/* Editor tab bar */}
                <div className="flex items-center px-4 py-1.5 bg-[#141417] border-b border-white/5 gap-2 shrink-0">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1e] border border-white/8 rounded-t-lg">
                    <FiCode size={11} className="text-primary" />
                    <span className="text-[10px] font-bold text-zinc-400">
                      solution.{language === "javascript" ? "js" : language === "python" ? "py" : language === "cpp" ? "cpp" : language}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language={LANG_MONACO[language] || "javascript"}
                    value={code}
                    onChange={(v) => setCode(v || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize,
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                      padding: { top: 16, bottom: 16 },
                      smoothScrolling: true,
                      cursorBlinking: "smooth",
                      cursorSmoothCaretAnimation: "on",
                      roundedSelection: true,
                      renderLineHighlight: "all",
                      scrollbar: { useShadows: false, vertical: "visible", horizontal: "visible", verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                      lineNumbers: "on",
                      glyphMargin: false,
                      lineDecorationsWidth: 10,
                      folding: true,
                      bracketPairColorization: { enabled: true },
                      autoClosingBrackets: "always",
                      autoClosingQuotes: "always",
                      formatOnPaste: true,
                      tabSize: 2,
                      wordWrap: "on",
                      suggest: { showMethods: true, showFunctions: true },
                      // interview anti-cheat
                      ...(disableCopyPaste && { contextmenu: false, copyWithSyntaxHighlighting: false }),
                    }}
                  />
                </div>
              </div>

              {/* Terminal resize handle */}
              {terminalOpen && (
                <div
                  onMouseDown={handleTerminalMouseDown}
                  className={`h-1 shrink-0 cursor-row-resize flex items-center justify-center group transition-colors
                    ${isResizingTerminal ? "bg-primary/40" : "bg-white/5 hover:bg-primary/30"}`}
                >
                  <div className="h-0.5 w-12 rounded-full bg-white/20 group-hover:bg-primary/60 transition-colors" />
                </div>
              )}

              {/* Terminal */}
              <div
                className="shrink-0 border-t border-white/5 overflow-hidden"
                style={{ height: terminalOpen ? `${terminalHeight}px` : "36px" }}
              >
                <div
                  className="flex items-center justify-between px-4 py-2 bg-[#0f0f12] border-b border-white/5 cursor-pointer"
                  onClick={() => setTerminalOpen(!terminalOpen)}
                >
                  <div className="flex items-center gap-2">
                    <FiTerminal size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Terminal</span>
                    {isRunning && <span className="flex items-center gap-1 text-amber-400 text-[9px] font-bold"><FiRefreshCw size={9} className="animate-spin" />Running</span>}
                    {output && !isRunning && (
                      output.toLowerCase().includes("error")
                        ? <FiAlertCircle size={11} className="text-red-400" />
                        : <FiCheckCircle size={11} className="text-emerald-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOutput(""); }}
                      className="text-zinc-600 hover:text-zinc-400 text-[9px] font-bold uppercase"
                    >
                      Clear
                    </button>
                    {terminalOpen ? <FiChevronDown size={13} className="text-zinc-500" /> : <FiChevronUp size={13} className="text-zinc-500" />}
                  </div>
                </div>

                {terminalOpen && (
                  <div className="h-full overflow-y-auto custom-scrollbar bg-[#0d0d10] p-4 font-mono text-xs pb-8">
                    <div className="flex items-center gap-2 mb-2 text-zinc-500">
                      <span className="text-primary">➜</span>
                      <span>~/workspace</span>
                      <span className="text-zinc-600">$</span>
                      <span className="text-zinc-400">
                        {language === "javascript" ? "node" : language === "python" ? "python3" : language === "cpp" ? "./a.out" : "java"} solution.{language === "javascript" ? "js" : language === "python" ? "py" : language}
                      </span>
                    </div>
                    {output ? (
                      output.split("\n").map((line, i) => {
                        const isErr = /error|exception|traceback/i.test(line);
                        const isOk  = /success|\[|\]|true|false/.test(line);
                        return (
                          <div key={i} className={`leading-5 ${isErr ? "text-red-400" : isOk ? "text-emerald-400" : "text-zinc-300"}`}>
                            {line || "\u00A0"}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-zinc-600 italic">// Output will appear here after you click Run ▶</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f12] border-t border-white/5 shrink-0">
        <div className="flex items-center gap-4 text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Connected
          </div>
          <div className="w-px h-3 bg-white/10" />
          <span>Autosave On</span>
          <div className="w-px h-3 bg-white/10" />
          <span>Ln {1}, Col {1}</span>
        </div>
        <div className="text-[9px] text-zinc-600 font-bold">
          PlaceMateAI Coding Environment · {language.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default CodingSpace;
