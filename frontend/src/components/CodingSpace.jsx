import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  FiPlay,
  FiSend,
  FiClock,
  FiRefreshCw,
  FiChevronRight,
  FiCode,
  FiTerminal,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiAlignLeft,
  FiAlertCircle,
  FiCheckCircle,
  FiThumbsUp,
  FiMaximize2,
  FiMinimize2,
  FiSettings,
  FiCopy,
  FiRotateCcw,
  FiBookOpen,
  FiTag,
  FiInfo,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";

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
  c: `#include <stdio.h>

// Write your solution here
int solution(int x) {
    return x;
}

int main() {
    return 0;
}
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
  c: "c",
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
  Easy: {
    text: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
  },
  Medium: { text: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  Hard: { text: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
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
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Problem
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-2 pt-2 gap-1 bg-[#141417] border-b border-white/5">
        {["description", "hints"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-t-lg transition-all
              ${
                activeTab === tab
                  ? "text-white bg-[#1a1a1e] border-t border-l border-r border-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
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
                <span className="text-zinc-500 text-xs font-bold">
                  #{task.id}
                </span>
                <h2 className="text-base font-black text-white">
                  {task.title}
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${diff.bg} ${diff.text}`}
                >
                  {task.difficulty}
                </span>
                {task.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-full"
                  >
                    <FiTag size={9} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {task.question}
            </p>

            {/* Examples */}
            {task.examples?.length > 0 && (
              <div className="space-y-3">
                {task.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-zinc-700 bg-zinc-900/50 overflow-hidden"
                  >
                    <div className="px-4 py-2 bg-zinc-900 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Example {i + 1}
                      </span>
                    </div>
                    <div className="p-4 space-y-2 font-mono text-xs">
                      <div>
                        <span className="text-zinc-500">Input: </span>
                        <span className="text-zinc-200">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Output: </span>
                        <span className="text-primary font-bold">
                          {ex.output}
                        </span>
                      </div>
                      {ex.explanation && (
                        <div className="pt-1 border-t border-white/5">
                          <span className="text-zinc-500">Explanation: </span>
                          <span className="text-zinc-400">
                            {ex.explanation}
                          </span>
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
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-zinc-300 font-mono"
                    >
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
            {task.hints?.length > 0 ? (
              task.hints.map((hint, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-700 bg-zinc-900/50 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedHint(expandedHint === i ? null : i)
                    }
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800/40 transition-colors"
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                      Hint {i + 1}
                    </span>
                    {expandedHint === i ? (
                      <FiChevronUp size={14} className="text-zinc-500" />
                    ) : (
                      <FiChevronDown size={14} className="text-zinc-500" />
                    )}
                  </button>
                  {expandedHint === i && (
                    <div className="px-4 pb-4 pt-1 text-sm text-zinc-300 leading-relaxed border-t border-white/5">
                      {hint}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-sm text-center py-8">
                No hints available for this problem.
              </p>
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
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Terminal
          </span>
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
            const isError =
              line.toLowerCase().includes("error") ||
              line.toLowerCase().includes("exception");
            const isSuccess =
              line.toLowerCase().includes("success") || line.startsWith("[");
            return (
              <div
                key={i}
                className={`leading-5 ${
                  isError
                    ? "text-red-400"
                    : isSuccess
                      ? "text-emerald-400"
                      : "text-zinc-300"
                }`}
              >
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
const CodingSpace = ({
  task: taskProp,
  onSubmit,
  disableCopyPaste = false,
  showTimer = false,
}) => {
  const getViewportWidth = () =>
    typeof window !== "undefined" ? window.innerWidth : 1024;
  const location = useLocation();
  const { getToken, isSignedIn } = useAuth();
  const routedTask = location.state?.task;
  const task = taskProp || routedTask || DEFAULT_TASK;

  const getTemplateForLanguage = (lang) => {
    if (task?.starterCodeMap?.[lang]) return task.starterCodeMap[lang];
    return LANG_TEMPLATES[lang] || task.initialCode || "";
  };

  const [language, setLanguage] = useState(task.language || "javascript");
  const [code, setCode] = useState(
    getTemplateForLanguage(task.language || "javascript"),
  );
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(task.timeLimit || 1800);
  // preview mode: 'editor' | 'split' | 'preview' (html/css only)
  const isWebLang = (l) => l === "html" || l === "css";
  const [previewMode, setPreviewMode] = useState(
    isWebLang(task.language || "javascript") ? "split" : "editor",
  );
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  const isMobileView = viewportWidth < 768;
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("code");
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

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(getViewportWidth());
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobileView) {
      setTerminalOpen(true);
      setIsDragging(false);
      setIsResizingTerminal(false);
      if (previewMode === "split") setPreviewMode("editor");
      return;
    }
  }, [isMobileView, previewMode]);

  /* ── Disable copy/paste when the prop is active ───────────────────── */
  useEffect(() => {
    if (!disableCopyPaste) return;
    const container = editorContainerRef.current;
    if (!container) return;

    const blockCopyPaste = (e) => {
      const key = e.key?.toLowerCase();
      // Block Ctrl/Cmd + C, V, X
      if (
        (e.ctrlKey || e.metaKey) &&
        (key === "c" || key === "v" || key === "x")
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const blockPaste = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const blockContext = (e) => {
      e.preventDefault();
    };

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
    if (!showTimer) return undefined;

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
  }, [showTimer]);

  // Handle auto-submit when time is up
  useEffect(() => {
    if (showTimer && timeLeft === 0) {
      handleSubmit(true);
    }
  }, [showTimer, timeLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  /* Horizontal panel resize */
  const handlePanelMouseDown = useCallback(
    (e) => {
      if (isMobileView) return;
      e.preventDefault();
      setIsDragging(true);
    },
    [isMobileView],
  );

  useEffect(() => {
    if (!isDragging || isMobileView) return;
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
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, isMobileView]);

  /* Terminal vertical resize */
  const handleTerminalMouseDown = useCallback(
    (e) => {
      if (isMobileView) return;
      e.preventDefault();
      setIsResizingTerminal(true);
    },
    [isMobileView],
  );

  useEffect(() => {
    if (!isResizingTerminal || isMobileView) return;
    const onMove = (e) => {
      const container = terminalResizeRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newH = rect.bottom - e.clientY;
      const maxAllowed = Math.max(140, rect.height - 140);
      setTerminalHeight(Math.min(Math.max(newH, 100), maxAllowed));
    };
    const onUp = () => setIsResizingTerminal(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizingTerminal, isMobileView]);

  /* Language change */
  const handleLangChange = (lang) => {
    setLanguage(lang);
    setCode(getTemplateForLanguage(lang));
    setOutput("");
    setActiveWorkspaceTab("code");
    // auto-switch to split preview for web languages
    setPreviewMode(
      isWebLang(lang) ? (isMobileView ? "editor" : "split") : "editor",
    );
  };

  /* Derived: the srcdoc to feed the preview iframe */
  const getPreviewDoc = () => {
    if (language === "html") return code;
    if (language === "css") return CSS_WRAPPER_HTML(code);
    return "";
  };

  const extractJavascriptFunctionCandidates = (userCode = "") => {
    const candidates = [];
    const pushUnique = (name) => {
      if (!name || candidates.includes(name)) return;
      candidates.push(name);
    };

    const functionDeclPattern = /function\s+([A-Za-z_$][\w$]*)\s*\(/g;
    let match = functionDeclPattern.exec(userCode);
    while (match) {
      pushUnique(match[1]);
      match = functionDeclPattern.exec(userCode);
    }

    const assignedFunctionPattern =
      /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/g;
    match = assignedFunctionPattern.exec(userCode);
    while (match) {
      pushUnique(match[1]);
      match = assignedFunctionPattern.exec(userCode);
    }

    return candidates;
  };

  const extractPythonFunctionCandidates = (userCode = "") => {
    const candidates = [];
    const pushUnique = (name) => {
      if (!name || candidates.includes(name)) return;
      candidates.push(name);
    };

    const functionDeclPattern = /^\s*def\s+([A-Za-z_][\w]*)\s*\(/gm;
    let match = functionDeclPattern.exec(userCode);
    while (match) {
      pushUnique(match[1]);
      match = functionDeclPattern.exec(userCode);
    }

    return candidates;
  };

  const splitTopLevelArgs = (input = "") => {
    const src = String(input || "").trim();
    if (!src) return [];

    const parts = [];
    let current = "";
    let depth = 0;
    let quote = null;

    for (let i = 0; i < src.length; i += 1) {
      const ch = src[i];
      const prev = src[i - 1];

      if ((ch === '"' || ch === "'") && prev !== "\\") {
        if (!quote) quote = ch;
        else if (quote === ch) quote = null;
      }

      if (!quote) {
        if (ch === "(" || ch === "[" || ch === "{") depth += 1;
        if (ch === ")" || ch === "]" || ch === "}")
          depth = Math.max(0, depth - 1);
        if (ch === "," && depth === 0) {
          if (current.trim()) parts.push(current.trim());
          current = "";
          continue;
        }
      }

      current += ch;
    }

    if (current.trim()) parts.push(current.trim());

    return parts.map((part) => {
      const eqIndex = part.indexOf("=");
      if (eqIndex === -1) return part.trim();
      return part.slice(eqIndex + 1).trim();
    });
  };

  const extractCppFunctionCandidates = (userCode = "") => {
    const names = [];
    const push = (name) => {
      if (!name || names.includes(name) || name === "main") return;
      names.push(name);
    };

    const pattern =
      /(?:^|\n)\s*(?:[A-Za-z_][\w:<>,\s\*&]*?)\s+([A-Za-z_][\w]*)\s*\([^;{}]*\)\s*\{/g;
    let match = pattern.exec(userCode);
    while (match) {
      push(match[1]);
      match = pattern.exec(userCode);
    }

    return names;
  };

  const extractCFunctionCandidates = (userCode = "") => {
    const names = [];
    const push = (name) => {
      if (!name || names.includes(name) || name === "main") return;
      names.push(name);
    };

    const pattern =
      /(?:^|\n)\s*(?:unsigned\s+|signed\s+)?(?:int|long|short|float|double|char|void)\s+\**\s*([A-Za-z_][\w]*)\s*\([^;{}]*\)\s*\{/g;
    let match = pattern.exec(userCode);
    while (match) {
      push(match[1]);
      match = pattern.exec(userCode);
    }

    return names;
  };

  const extractCFunctionSignature = (userCode = "", functionName = "") => {
    if (!functionName) return [];

    const escapedName = functionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const signaturePattern = new RegExp(
      String.raw`(?:^|\n)\s*[A-Za-z_][\w\s\*\[\]]*\b${escapedName}\s*\(([^)]*)\)\s*\{`,
      "m",
    );

    const match = userCode.match(signaturePattern);
    if (!match || !match[1].trim()) return [];

    return match[1]
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  };

  const extractJavaClassCandidates = (userCode = "") => {
    const classes = [];
    const push = (name) => {
      if (!name || classes.includes(name)) return;
      classes.push(name);
    };

    const classPattern = /\bclass\s+([A-Za-z_][\w]*)\b/g;
    let match = classPattern.exec(userCode);
    while (match) {
      push(match[1]);
      match = classPattern.exec(userCode);
    }

    return classes;
  };

  const extractJavaMethodCandidates = (userCode = "") => {
    const methods = [];
    const push = (name) => {
      if (!name || methods.includes(name) || name === "main") return;
      methods.push(name);
    };

    const methodPattern =
      /(?:public|private|protected)?\s*(?:static\s+)?[A-Za-z_][\w<>\[\]]*\s+([A-Za-z_][\w]*)\s*\([^;{}]*\)\s*\{/g;
    let match = methodPattern.exec(userCode);
    while (match) {
      push(match[1]);
      match = methodPattern.exec(userCode);
    }

    return methods;
  };

  const hasExamples = Array.isArray(task?.examples) && task.examples.length > 0;
  const hasRunnableExamples =
    hasExamples &&
    ["javascript", "python", "java", "cpp", "c"].includes(language);

  const buildJavascriptTestHarness = (
    userCode,
    examples,
    functionCandidates = [],
  ) => {
    const serializedExamples = JSON.stringify(examples || []);
    const serializedFunctionCandidates = JSON.stringify(functionCandidates);

    return `${userCode}

const __EXAMPLES__ = ${serializedExamples};
const __FUNCTION_CANDIDATES__ = ${serializedFunctionCandidates};

const __safeEval = (raw) => {
  const value = String(raw ?? "").trim();
  if (!value) return undefined;
  try {
    return Function(\`"use strict"; return (\${value});\`)();
  } catch {
    return value;
  }
};

const __parseInput = (input) => {
  const src = String(input || "").trim();
  if (!src) return [];

  const parts = [];
  let current = "";
  let depth = 0;
  let quote = null;

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    const prev = src[i - 1];

    if ((ch === '"' || ch === "'") && prev !== "\\\\") {
      if (!quote) quote = ch;
      else if (quote === ch) quote = null;
    }

    if (!quote) {
      if (ch === "(" || ch === "[" || ch === "{") depth += 1;
      if (ch === ")" || ch === "]" || ch === "}") depth = Math.max(0, depth - 1);
      if (ch === "," && depth === 0) {
        if (current.trim()) parts.push(current.trim());
        current = "";
        continue;
      }
    }

    current += ch;
  }

  if (current.trim()) parts.push(current.trim());

  const orderedArgs = [];
  for (const part of parts) {
    const eqIndex = part.indexOf("=");
    if (eqIndex === -1) {
      orderedArgs.push(__safeEval(part));
      continue;
    }

    const key = part.slice(0, eqIndex).trim();
    const rawValue = part.slice(eqIndex + 1).trim();
    const parsedValue = __safeEval(rawValue);
    orderedArgs.push(parsedValue);
    if (key) globalThis[key] = parsedValue;
  }

  return orderedArgs;
};

const __normalize = (value) => {
  if (typeof value === "string") return value.trim();
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const __results = [];

const __resolveByName = (name) => {
  try {
    const maybeFn = eval(name);
    if (typeof maybeFn === "function") return maybeFn;
  } catch {
    // Ignore lookup failures and try global scope fallback
  }

  if (typeof globalThis[name] === "function") {
    return globalThis[name];
  }

  return null;
};

const __pickRunner = () => {
  if (typeof solution === "function") return solution;

  for (const name of __FUNCTION_CANDIDATES__) {
    const resolved = __resolveByName(name);
    if (resolved) return resolved;
  }

  return null;
};

const __runner = __pickRunner();

if (!__runner) {
  __results.push("Error: Could not find a callable function to test.");
  __results.push("Tip: Define a function like solution() or any named function.");
} else {
  for (let i = 0; i < __EXAMPLES__.length; i += 1) {
    const test = __EXAMPLES__[i] || {};
    try {
      const args = __parseInput(test.input);
      const actual = __runner(...args);
      const expected = __safeEval(test.output);

      const actualNorm = __normalize(actual);
      const expectedNorm = __normalize(expected);
      const passed = actualNorm === expectedNorm;

      __results.push(\`Test \${i + 1}: \${passed ? "PASS" : "FAIL"}\`);
      if (!passed) {
        __results.push(\`  expected: \${expectedNorm}\`);
        __results.push(\`  received: \${actualNorm}\`);
      }
    } catch (err) {
      __results.push(\`Test \${i + 1}: ERROR\`);
      __results.push(\`  \${err?.message || String(err)}\`);
    }
  }
}

console.log(__results.join("\\n"));
`;
  };

  const buildPythonTestHarness = (
    userCode,
    examples,
    functionCandidates = [],
  ) => {
    const serializedExamples = JSON.stringify(examples || []);
    const serializedFunctionCandidates = JSON.stringify(functionCandidates);

    return `${userCode}

import json
import ast

__EXAMPLES__ = ${serializedExamples}
__FUNCTION_CANDIDATES__ = ${serializedFunctionCandidates}

def __safe_eval(raw):
  value = str(raw if raw is not None else "").strip()
  if not value:
    return None

  try:
    return ast.literal_eval(value)
  except Exception:
    lower = value.lower()
    if lower == "true":
      return True
    if lower == "false":
      return False
    if lower == "null" or lower == "none":
      return None
    return value

def __split_top_level(src):
  parts = []
  current = []
  depth = 0
  quote = None

  i = 0
  while i < len(src):
    ch = src[i]
    prev = src[i - 1] if i > 0 else ""

    if ch in ['"', "'"] and prev != "\\\\":
      if quote is None:
        quote = ch
      elif quote == ch:
        quote = None

    if quote is None:
      if ch in "([{":
        depth += 1
      elif ch in ")]}":
        depth = max(0, depth - 1)
      elif ch == "," and depth == 0:
        token = "".join(current).strip()
        if token:
          parts.append(token)
        current = []
        i += 1
        continue

    current.append(ch)
    i += 1

  token = "".join(current).strip()
  if token:
    parts.append(token)

  return parts

def __parse_input(input_text):
  src = str(input_text or "").strip()
  if not src:
    return []

  parts = __split_top_level(src)
  ordered = []

  for part in parts:
    if "=" not in part:
      ordered.append(__safe_eval(part))
      continue

    key, raw_value = part.split("=", 1)
    parsed = __safe_eval(raw_value)
    ordered.append(parsed)
    key = key.strip()
    if key:
      globals()[key] = parsed

  return ordered

def __normalize(value):
  if isinstance(value, str):
    return value.strip()
  if value is None:
    return "null"
  try:
    return json.dumps(value, sort_keys=True)
  except Exception:
    return str(value)

def __pick_runner():
  fn = globals().get("solution")
  if callable(fn):
    return fn

  for name in __FUNCTION_CANDIDATES__:
    fn = globals().get(name)
    if callable(fn):
      return fn

  return None

__runner = __pick_runner()
__results = []

if __runner is None:
  __results.append("Error: Could not find a callable function to test.")
  __results.append("Tip: Define solution() or any named function.")
else:
  for i, test in enumerate(__EXAMPLES__):
    try:
      args = __parse_input(test.get("input", ""))
      actual = __runner(*args)
      expected = __safe_eval(test.get("output", ""))

      actual_norm = __normalize(actual)
      expected_norm = __normalize(expected)
      passed = actual_norm == expected_norm

      __results.append(f"Test {i + 1}: {'PASS' if passed else 'FAIL'}")
      if not passed:
        __results.append(f"  expected: {expected_norm}")
        __results.append(f"  received: {actual_norm}")
    except Exception as err:
      __results.append(f"Test {i + 1}: ERROR")
      __results.append(f"  {err}")

print("\\n".join(__results))
`;
  };

  const buildCppTestHarness = (userCode, examples, runnerName) => {
    if (!runnerName) {
      return `${userCode}\n\n#include <iostream>\nint main(){ std::cout << "Error: Could not find a callable function to test." << std::endl; return 0; }`;
    }

    const toCppLiteral = (raw = "") => {
      const v = String(raw).trim();
      if (!v) return "0";

      const isQuoted =
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"));
      if (isQuoted) return v;

      if (/^\[.*\]$/.test(v)) {
        const inner = v.slice(1, -1).trim();
        if (!inner) return "std::vector<int>{}";
        return `std::vector<int>{${inner}}`;
      }

      if (/^(true|false)$/i.test(v)) return v.toLowerCase();
      return v;
    };

    const escapeForCppString = (value = "") =>
      String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

    const caseBlocks = (examples || [])
      .map((ex, i) => {
        const args = splitTopLevelArgs(ex?.input || "").map(toCppLiteral);
        const expected = escapeForCppString(String(ex?.output ?? "").trim());
        const argList = args.join(", ");
        return `
  {
    auto actual = ${runnerName}(${argList});
    std::string actualNorm = __stripSpaces(__norm(actual));
    std::string expectedNorm = __stripSpaces("${expected}");
    bool pass = (actualNorm == expectedNorm);
    std::cout << "Test ${i + 1}: " << (pass ? "PASS" : "FAIL") << "\\n";
    if (!pass) {
      std::cout << "  expected: " << expectedNorm << "\\n";
      std::cout << "  received: " << actualNorm << "\\n";
    }
  };
`;
      })
      .join("\n");

    return `
  #include <iostream>
  #include <vector>
  #include <string>
  #include <sstream>
  #include <cctype>
  #include <algorithm>

  #define main __user_main
  ${userCode}
  #undef main

using namespace std;
static std::string __stripSpaces(std::string s) {
  s.erase(remove_if(s.begin(), s.end(), [](unsigned char c){ return std::isspace(c); }), s.end());
  return s;
}

template <typename T>
std::string __norm(const T& value) {
  std::ostringstream oss;
  oss << value;
  return oss.str();
}

template <>
std::string __norm<std::vector<int>>(const std::vector<int>& value) {
  std::string out = "[";
  for (size_t i = 0; i < value.size(); ++i) {
    out += std::to_string(value[i]);
    if (i + 1 < value.size()) out += ",";
  }
  out += "]";
  return out;
}

template <>
std::string __norm<std::string>(const std::string& value) {
  return value;
}

int main() {
  if (${(examples || []).length} == 0) {
    cout << "Error: No testcases available." << endl;
    return 0;
  }
${caseBlocks || '  std::cout << "Error: No testcases available." << std::endl;'}
  return 0;
}
`;
  };

  const buildCTestHarnessV2 = (userCode, examples, runnerName) => {
    if (!runnerName) {
      return `${userCode}\n\n#include <stdio.h>\nint main(){ printf("Error: Could not find a callable function to test.\\n"); return 0; }`;
    }

    const buildTestBlock = (ex, caseIndex) => {
      const rawArgs = splitTopLevelArgs(ex?.input || "");
      const signature = extractCFunctionSignature(userCode, runnerName);
      const arrayTokenCount = rawArgs.filter((arg) =>
        /^\[.*\]$/.test(String(arg).trim()),
      ).length;
      const shouldAppendLength =
        arrayTokenCount === 1 && signature.length === rawArgs.length + 1;

      const declarations = [];
      const callArgs = [];
      let arrayCounter = 0;
      let scalarCounter = 0;

      rawArgs.forEach((arg) => {
        const value = String(arg).trim();

        if (/^\[.*\]$/.test(value)) {
          const inner = value.slice(1, -1).trim();
          const elements = inner
            ? inner.split(",").map((part) => part.trim())
            : [];
          const arrayName = `arr_${caseIndex}_${arrayCounter}`;
          const lenName = `${arrayName}_len`;
          declarations.push(
            `  int ${arrayName}[] = {${elements.join(", ")}};`,
            `  int ${lenName} = sizeof(${arrayName}) / sizeof(${arrayName}[0]);`,
          );
          callArgs.push(arrayName);
          if (shouldAppendLength) {
            callArgs.push(lenName);
          }
          arrayCounter += 1;
          return;
        }

        const scalarName = `value_${caseIndex}_${scalarCounter}`;
        declarations.push(`  int ${scalarName} = ${value || "0"};`);
        callArgs.push(scalarName);
        scalarCounter += 1;
      });

      const expectedRaw = String(ex?.output ?? "").trim();
      const expectedLiteral = /^-?\d+(?:\.\d+)?$/.test(expectedRaw)
        ? expectedRaw
        : expectedRaw === "true"
          ? "1"
          : expectedRaw === "false"
            ? "0"
            : `"${expectedRaw.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

      return `
  {
${declarations.join("\n")}
    int actual = ${runnerName}(${callArgs.join(", ")});
    int expected = ${expectedLiteral};
    if (actual == expected) {
      printf("Test ${caseIndex + 1}: PASS\\n");
    } else {
      printf("Test ${caseIndex + 1}: FAIL\\n  expected: %d\\n  received: %d\\n", expected, actual);
    }
  }
`;
    };

    const testLines = (examples || [])
      .map((ex, index) => buildTestBlock(ex, index))
      .join("\n");

    return `
#include <stdbool.h>
#include <stdio.h>

#define main __user_main
${userCode}
#undef main

int main() {
${testLines || '  printf("Error: No testcases available.\\n");'}
  return 0;
}
`;
  };

  const buildJavaTestHarness = (
    userCode,
    examples,
    classCandidates = [],
    methodCandidates = [],
  ) => {
    const serializedExamples = JSON.stringify(examples || []);
    const serializedClasses = JSON.stringify(classCandidates);
    const serializedMethods = JSON.stringify(methodCandidates);

    return `${userCode}

import java.lang.reflect.*;
import java.util.*;

class __JudgeMain {
  static final String EXAMPLES_JSON = ${JSON.stringify(serializedExamples)};
  static final String[] CLASS_CANDIDATES = ${serializedClasses.replace(/\[/g, "{").replace(/\]/g, "}")};
  static final String[] METHOD_CANDIDATES = ${serializedMethods.replace(/\[/g, "{").replace(/\]/g, "}")};

  static List<String[]> parseCases() {
    List<String[]> out = new ArrayList<>();
    String s = EXAMPLES_JSON;
    int i = 0;
    while ((i = s.indexOf("{\\\"input\\\"", i)) >= 0) {
      int inStart = s.indexOf("\\\"input\\\":\\\"", i) + 11;
      int inEnd = s.indexOf('"', inStart);
      int outStart = s.indexOf("\\\"output\\\":\\\"", inEnd) + 12;
      int outEnd = s.indexOf('"', outStart);
      if (inStart < 11 || inEnd < 0 || outStart < 12 || outEnd < 0) break;
      out.add(new String[]{s.substring(inStart, inEnd), s.substring(outStart, outEnd)});
      i = outEnd + 1;
    }
    return out;
  }

  static List<String> splitTopLevel(String src) {
    List<String> parts = new ArrayList<>();
    if (src == null || src.trim().isEmpty()) return parts;
    StringBuilder cur = new StringBuilder();
    int depth = 0;
    Character quote = null;
    for (int i = 0; i < src.length(); i++) {
      char ch = src.charAt(i);
      char prev = i > 0 ? src.charAt(i - 1) : 0;
      if ((ch == '"' || ch == '\'') && prev != '\\\\') {
        if (quote == null) quote = ch;
        else if (quote == ch) quote = null;
      }
      if (quote == null) {
        if (ch == '(' || ch == '[' || ch == '{') depth++;
        if (ch == ')' || ch == ']' || ch == '}') depth = Math.max(0, depth - 1);
        if (ch == ',' && depth == 0) {
          String p = cur.toString().trim();
          if (!p.isEmpty()) parts.add(p);
          cur.setLength(0);
          continue;
        }
      }
      cur.append(ch);
    }
    String tail = cur.toString().trim();
    if (!tail.isEmpty()) parts.add(tail);
    List<String> onlyVals = new ArrayList<>();
    for (String p : parts) {
      int eq = p.indexOf('=');
      onlyVals.add(eq >= 0 ? p.substring(eq + 1).trim() : p.trim());
    }
    return onlyVals;
  }

  static Object convert(String raw, Class<?> type) {
    String v = raw == null ? "" : raw.trim();
    if (type == int.class || type == Integer.class) return Integer.parseInt(v);
    if (type == long.class || type == Long.class) return Long.parseLong(v);
    if (type == double.class || type == Double.class) return Double.parseDouble(v);
    if (type == float.class || type == Float.class) return Float.parseFloat(v);
    if (type == boolean.class || type == Boolean.class) return "true".equalsIgnoreCase(v) || "1".equals(v);
    if (type == String.class) {
      if (v.length() >= 2 && ((v.startsWith("\"") && v.endsWith("\"")) || (v.startsWith("'") && v.endsWith("'")))) {
        return v.substring(1, v.length() - 1);
      }
      return v;
    }
    if (type == int[].class) {
      String inner = v.replaceAll("^\\[|\\]$", "");
      if (inner.trim().isEmpty()) return new int[0];
      String[] parts = inner.split(",");
      int[] arr = new int[parts.length];
      for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i].trim());
      return arr;
    }
    return null;
  }

  static String normalize(Object obj) {
    if (obj == null) return "null";
    if (obj instanceof int[]) return Arrays.toString((int[]) obj).replace(" ", "");
    return String.valueOf(obj).trim().replace(" ", "");
  }

  static Method pickMethod(Class<?> cls) {
    for (String name : METHOD_CANDIDATES) {
      for (Method m : cls.getDeclaredMethods()) {
        if (m.getName().equals(name)) {
          m.setAccessible(true);
          return m;
        }
      }
    }
    try {
      Method m = cls.getDeclaredMethod("solution");
      m.setAccessible(true);
      return m;
    } catch (Exception ignored) {
      return null;
    }
  }

  public static void main(String[] args) throws Exception {
    Class<?> pickedClass = null;
    for (String c : CLASS_CANDIDATES) {
      try {
        pickedClass = Class.forName(c);
        if (pickedClass != null) break;
      } catch (Exception ignored) {}
    }

    if (pickedClass == null) {
      System.out.println("Error: Could not locate a class to test.");
      return;
    }

    Method method = pickMethod(pickedClass);
    if (method == null) {
      System.out.println("Error: Could not find a callable method to test.");
      return;
    }

    Object instance = Modifier.isStatic(method.getModifiers()) ? null : pickedClass.getDeclaredConstructor().newInstance();
    List<String[]> cases = parseCases();
    if (cases.isEmpty()) {
      System.out.println("Error: No testcases available.");
      return;
    }

    for (int i = 0; i < cases.size(); i++) {
      try {
        List<String> raw = splitTopLevel(cases.get(i)[0]);
        Class<?>[] types = method.getParameterTypes();
        Object[] invokeArgs = new Object[types.length];
        for (int j = 0; j < types.length; j++) {
          String token = j < raw.size() ? raw.get(j) : "";
          invokeArgs[j] = convert(token, types[j]);
        }

        Object actual = method.invoke(instance, invokeArgs);
        String actualNorm = normalize(actual);
        String expectedNorm = normalize(cases.get(i)[1]);
        boolean pass = actualNorm.equals(expectedNorm);
        System.out.println("Test " + (i + 1) + ": " + (pass ? "PASS" : "FAIL"));
        if (!pass) {
          System.out.println("  expected: " + expectedNorm);
          System.out.println("  received: " + actualNorm);
        }
      } catch (Exception err) {
        System.out.println("Test " + (i + 1) + ": ERROR");
        System.out.println("  " + err.getMessage());
      }
    }
  }
}
`;
  };

  const buildCTestHarness = (userCode, examples, runnerName) => {
    if (!runnerName) {
      return `${userCode}\n\n#include <stdio.h>\nint main(){ printf("Error: Could not find a callable function to test.\\n"); return 0; }`;
    }

    const cases = (examples || []).map((ex) => ({
      args: splitTopLevelArgs(ex?.input || ""),
      expected: String(ex?.output ?? "").trim(),
    }));

    const testLines = cases
      .map((t, i) => {
        const arg = t.args[0] || "0";
        const expected = Number.isNaN(Number(t.expected)) ? "0" : t.expected;
        if (/\[|\]|\{/.test(arg)) {
          return `  { printf("Test ${i + 1}: ERROR\\n  Unsupported C testcase input format for auto-judge.\\n"); }`;
        }
        return `  { int actual = ${runnerName}(${arg}); int expected = ${expected}; if (actual == expected) { printf("Test ${i + 1}: PASS\\n"); } else { printf("Test ${i + 1}: FAIL\\n  expected: %d\\n  received: %d\\n", expected, actual); } }`;
      })
      .join("\n");

    return `
#define main __user_main
${userCode}
#undef main

#include <stdio.h>

int main() {
${testLines || '  printf("Error: No testcases available.\\n");'}
  return 0;
}
`;
  };

  /* Run Code */
  const handleRunCode = async () => {
    if (isWebLang(language)) {
      // For html/css, "Run" just ensures split-preview is visible
      setPreviewMode(isMobileView ? "preview" : "split");
      toast.success("Preview refreshed!");
      return;
    }

    if (!isSignedIn) {
      setOutput("Error: Please sign in to execute code.");
      toast.error("Sign in required to run code");
      return;
    }

    setIsRunning(true);
    setOutput("Executing code…\n");
    try {
      const token = await getToken();
      if (!token) {
        setOutput("Error: Please sign in to execute code.");
        toast.error("Sign in required to run code");
        return;
      }

      let scriptToExecute = code;
      if (hasRunnableExamples && language === "javascript") {
        scriptToExecute = buildJavascriptTestHarness(
          code,
          task.examples,
          extractJavascriptFunctionCandidates(code),
        );
      } else if (hasRunnableExamples && language === "python") {
        scriptToExecute = buildPythonTestHarness(
          code,
          task.examples,
          extractPythonFunctionCandidates(code),
        );
      } else if (hasRunnableExamples && language === "cpp") {
        const cppCandidates = extractCppFunctionCandidates(code);
        const runnerName = cppCandidates.includes("solution")
          ? "solution"
          : cppCandidates[0];
        scriptToExecute = buildCppTestHarness(code, task.examples, runnerName);
      } else if (hasRunnableExamples && language === "java") {
        scriptToExecute = buildJavaTestHarness(
          code,
          task.examples,
          extractJavaClassCandidates(code),
          extractJavaMethodCandidates(code),
        );
      } else if (hasRunnableExamples && language === "c") {
        const cCandidates = extractCFunctionCandidates(code);
        const runnerName = cCandidates.includes("solution")
          ? "solution"
          : cCandidates[0];
        scriptToExecute = buildCTestHarnessV2(code, task.examples, runnerName);
      }

      const resp = await fetch(`${backendURL}/api/coding/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ script: scriptToExecute, language }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        if (data.reason === "UPGRADE_REQUIRED") {
          setOutput(
            "Error: This feature requires a paid plan. Upgrade to continue.",
          );
          toast.error("Upgrade required for coding execution");
          return;
        }

        if (data.reason === "EXECUTION_LIMIT_REACHED") {
          setOutput(
            `Error: Monthly execution limit reached (${data.entitlement?.used}/${data.entitlement?.limit}).`,
          );
          toast.error("Monthly execution limit reached");
          return;
        }

        setOutput(`Error: ${data.error || "Execution failed"}`);
        return;
      }

      if (data.output) setOutput(data.output);
      else if (data.error) setOutput(`Error: ${data.error}`);
      else if (hasRunnableExamples) {
        setOutput("No test output was returned. Please try again.");
      } else if (hasExamples) {
        setOutput(
          "No output was returned.\nAuto-test execution is currently available for JavaScript, Python, Java, C, and C++.\nFor this language, print output in code to verify results.",
        );
      } else {
        setOutput("✓ Execution complete (no output).");
      }
    } catch {
      setOutput(
        "Error: Could not reach the execution server.\nMake sure the backend is running.",
      );
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
    navigator.clipboard
      .writeText(code)
      .then(() => toast.success("Code copied!"));
  };

  /* Reset */
  const handleReset = () => {
    setCode(getTemplateForLanguage(language));
    setOutput("");
    toast("Code reset to default.");
  };

  const isTimeLow = timeLeft < 120;

  return (
    <div
      ref={editorContainerRef}
      className={`relative flex flex-col bg-[#141417] overflow-hidden ${isFullscreen ? "fixed inset-0 z-[200]" : isMobileView ? "h-[100dvh] max-h-[100dvh]" : "h-screen max-h-screen"}`}
      style={{ userSelect: isDragging || isResizingTerminal ? "none" : "auto" }}
    >
      {/* ── Anti-cheat Banner (interview mode) ───────────────────────── */}
      {disableCopyPaste && (
        <div className="flex items-center justify-center gap-2 py-1.5 bg-red-500/10 border-b border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] shrink-0">
          <span>🔒</span> Interview Mode — Copy &amp; Paste Disabled
        </div>
      )}
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between px-3 md:px-4 py-2.5 bg-[#0f0f12] border-b border-white/5 shrink-0 gap-2 md:gap-4">
        {/* Left: Problem title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
          <span className="text-sm font-black text-white truncate">
            {task.title || "Coding Challenge"}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0
            ${(DIFFICULTY_STYLES[task.difficulty] || DIFFICULTY_STYLES.Easy).bg}
            ${(DIFFICULTY_STYLES[task.difficulty] || DIFFICULTY_STYLES.Easy).text}`}
          >
            {task.difficulty || "Easy"}
          </span>
        </div>

        {/* Center: Language selector */}
        <div className="flex items-center gap-2 bg-[#1a1a1e] border border-zinc-700 rounded-lg px-3 py-1.5 shrink-0">
          <FiCode size={12} className="text-zinc-500" />
          <select
            value={language}
            onChange={(e) => handleLangChange(e.target.value)}
            className="bg-transparent text-[10px] font-bold uppercase tracking-wide text-zinc-200 focus:outline-none"
          >
            {Object.keys(LANG_TEMPLATES).map((lang) => (
              <option
                key={lang}
                value={lang}
                className="bg-[#1a1a1e] text-zinc-200"
              >
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Timer */}
          {showTimer && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-black transition-all
            ${isTimeLow ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-[#1a1a1e] border-zinc-700 text-zinc-200"}`}
            >
              <FiClock size={12} className={isTimeLow ? "animate-pulse" : ""} />
              {formatTime(timeLeft)}
            </div>
          )}

          {!disableCopyPaste && (
            <button
              onClick={handleCopy}
              title="Copy code"
              className="hidden sm:inline-flex p-2 rounded-lg text-zinc-500 hover:text-white bg-[#1a1a1e] border border-zinc-700 transition-all"
            >
              <FiCopy size={14} />
            </button>
          )}
          <button
            onClick={handleReset}
            title="Reset code"
            className="hidden sm:inline-flex p-2 rounded-lg text-zinc-500 hover:text-white bg-[#1a1a1e] border border-zinc-700 transition-all"
          >
            <FiRotateCcw size={14} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
            className="hidden sm:inline-flex p-2 rounded-lg text-zinc-500 hover:text-white bg-[#1a1a1e] border border-zinc-700 transition-all"
          >
            <FiSettings size={14} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Fullscreen"
            className="hidden sm:inline-flex p-2 rounded-lg text-zinc-500 hover:text-white bg-[#1a1a1e] border border-zinc-700 transition-all"
          >
            {isFullscreen ? (
              <FiMinimize2 size={14} />
            ) : (
              <FiMaximize2 size={14} />
            )}
          </button>

          <div className="hidden md:block w-px h-5 bg-white/10" />

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="hidden md:flex items-center gap-2 px-3 md:px-4 py-2 bg-[#1a1a1e] hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isRunning ? (
              <FiRefreshCw size={13} className="animate-spin" />
            ) : (
              <FiPlay size={13} className="fill-primary text-primary" />
            )}
            Run
          </button>
          <button
            onClick={() => handleSubmit(false)}
            className="hidden md:flex items-center gap-2 px-3 md:px-4 py-2 bg-primary hover:bg-[#a3e635] text-black rounded-lg text-xs font-black transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <FiSend size={13} />
            Submit
          </button>
        </div>
      </div>

      {/* Mobile Tabs - Only show on small screens */}
      {isMobileView && (
        <div className="flex items-center px-2 pt-2 gap-1 bg-[#141417] border-b border-white/5 shrink-0">
          {["problem", "code"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveWorkspaceTab(tab)}
              className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-t-lg transition-all
                ${
                  activeWorkspaceTab === tab
                    ? "text-white bg-[#1a1a1e] border-t border-l border-r border-white/10"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Settings dropdown */}
      {showSettings && (
        <div
          className={`z-50 bg-[#1a1a1e] border border-white/10 rounded-xl p-4 shadow-2xl ${
            isMobileView
              ? "fixed inset-x-3 top-20"
              : "absolute top-14 right-4 w-56"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400">
              Editor Settings
            </span>
            <button onClick={() => setShowSettings(false)}>
              <FiX size={14} className="text-zinc-500" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min={11}
                max={22}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full mt-1 accent-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Main Split Layout ─────────────────────────────────────────────── */}
      <div
        className="flex flex-1 min-h-0 overflow-hidden"
        ref={containerRef}
        style={{
          maxHeight: `calc(${viewportHeight}px - ${isMobileView ? "170px" : "120px"})`,
        }}
      >
        {isMobileView ? (
          /* ── MOBILE: Tab-based switching ── */
          <>
            {activeWorkspaceTab === "problem" ? (
              <div className="flex-1 min-h-0">
                <ProblemPanel task={task} />
              </div>
            ) : (
              <div
                className="flex flex-col flex-1 min-w-0 min-h-0"
                ref={terminalResizeRef}
              >
                {isWebLang(language) ? (
                  /* ── HTML / CSS mode: editor + live preview ── */
                  <div className="flex flex-col flex-1 min-h-0">
                    {/* Web toolbar */}
                    <div className="flex items-center justify-between px-4 py-1.5 bg-[#141417] border-b border-white/5 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1e] border border-zinc-700 rounded-t-lg">
                          <FiCode size={11} className="text-primary" />
                          <span className="text-[10px] font-bold text-zinc-400">
                            index.{language}
                          </span>
                        </div>
                      </div>
                      {/* View mode toggle */}
                      <div className="flex items-center gap-1 bg-[#1a1a1e] border border-zinc-700 rounded-lg p-0.5">
                        {[
                          { id: "editor", label: "Editor", Icon: FiCode },
                          { id: "split", label: "Split", Icon: FiAlignLeft },
                          {
                            id: "preview",
                            label: "Preview",
                            Icon: FiMaximize2,
                          },
                        ].map(({ id, label, Icon }) => (
                          <button
                            key={id}
                            onClick={() => setPreviewMode(id)}
                            title={label}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition-all
                        ${previewMode === id ? "bg-primary text-black" : "text-zinc-500 hover:text-white"}`}
                          >
                            <Icon size={11} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Editor + Iframe area */}
                    <div
                      className={`flex flex-1 min-h-0 ${isMobileView && previewMode === "split" ? "flex-col" : ""}`}
                    >
                      {/* Monaco editor (hidden in preview-only) */}
                      {previewMode !== "preview" && (
                        <div
                          className={`flex flex-col min-h-0 ${previewMode === "split" ? (isMobileView ? "h-1/2 w-full" : "w-1/2") : "w-full"}`}
                        >
                          <Editor
                            height="100%"
                            theme="vs-dark"
                            language={LANG_MONACO[language] || "html"}
                            value={code}
                            onChange={(v) => setCode(v || "")}
                            options={{
                              minimap: { enabled: false },
                              fontSize,
                              fontFamily:
                                "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                              padding: { top: 16, bottom: 16 },
                              smoothScrolling: true,
                              cursorBlinking: "smooth",
                              cursorSmoothCaretAnimation: "on",
                              roundedSelection: true,
                              renderLineHighlight: "all",
                              scrollbar: {
                                useShadows: false,
                                vertical: "visible",
                                horizontal: "visible",
                                verticalScrollbarSize: 6,
                                horizontalScrollbarSize: 6,
                              },
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
                              ...(disableCopyPaste && {
                                contextmenu: false,
                                copyWithSyntaxHighlighting: false,
                              }),
                            }}
                          />
                        </div>
                      )}

                      {/* Divider between editor and preview */}
                      {previewMode === "split" && !isMobileView && (
                        <div className="w-px bg-white/8 shrink-0" />
                      )}

                      {/* Live preview iframe (hidden in editor-only) */}
                      {previewMode !== "editor" && (
                        <div
                          className={`flex flex-col min-h-0 bg-white ${previewMode === "split" ? (isMobileView ? "h-1/2 w-full" : "w-1/2") : "w-full"}`}
                        >
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
                            key={
                              code
                            } /* re-mount on each code change for true live reload */
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
                      <div className="flex items-center justify-between  bg-zinc-800  gap-2 shrink-0">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1e] border-b border-lime-400">
                          <FiCode size={11} className="text-primary" />
                          <span className="text-[10px] font-bold text-zinc-400">
                            solution.
                            {language === "javascript"
                              ? "js"
                              : language === "python"
                                ? "py"
                                : language === "cpp"
                                  ? "cpp"
                                  : language}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 px-4">
                          <button
                            onClick={handleRunCode}
                            disabled={isRunning}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-[#1a1a1e] hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isRunning ? (
                              <FiRefreshCw size={13} className="animate-spin" />
                            ) : (
                              <FiPlay
                                size={13}
                                className="fill-primary text-primary"
                              />
                            )}
                            Run
                          </button>
                          <button
                            onClick={() => handleSubmit(false)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-primary hover:bg-[#a3e635] text-black rounded-lg text-xs font-black transition-all active:scale-95 shadow-lg shadow-primary/20"
                          >
                            <FiSend size={13} />
                            Submit
                          </button>
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
                            fontFamily:
                              "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                            padding: { top: 16, bottom: 16 },
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            cursorSmoothCaretAnimation: "on",
                            roundedSelection: true,
                            renderLineHighlight: "all",
                            scrollbar: {
                              useShadows: false,
                              vertical: "visible",
                              horizontal: "visible",
                              verticalScrollbarSize: 6,
                              horizontalScrollbarSize: 6,
                            },
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
                            ...(disableCopyPaste && {
                              contextmenu: false,
                              copyWithSyntaxHighlighting: false,
                            }),
                          }}
                        />
                      </div>
                    </div>

                    {/* Terminal resize handle */}
                    {terminalOpen && !isMobileView && (
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
                      style={{
                        height: terminalOpen
                          ? `${isMobileView ? Math.min(terminalHeight, 220) : terminalHeight}px`
                          : "36px",
                      }}
                    >
                      <div
                        className="flex items-center justify-between px-4 py-2 bg-[#0f0f12] border-b border-white/5 cursor-pointer"
                        onClick={() => setTerminalOpen(!terminalOpen)}
                      >
                        <div className="flex items-center gap-2">
                          <FiTerminal size={12} className="text-emerald-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Terminal
                          </span>
                          {isRunning && (
                            <span className="flex items-center gap-1 text-amber-400 text-[9px] font-bold">
                              <FiRefreshCw size={9} className="animate-spin" />
                              Running
                            </span>
                          )}
                          {output &&
                            !isRunning &&
                            (output.toLowerCase().includes("error") ? (
                              <FiAlertCircle
                                size={11}
                                className="text-red-400"
                              />
                            ) : (
                              <FiCheckCircle
                                size={11}
                                className="text-emerald-400"
                              />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOutput("");
                            }}
                            className="text-zinc-600 hover:text-zinc-400 text-[9px] font-bold uppercase"
                          >
                            Clear
                          </button>
                          {terminalOpen ? (
                            <FiChevronDown
                              size={13}
                              className="text-zinc-500"
                            />
                          ) : (
                            <FiChevronUp size={13} className="text-zinc-500" />
                          )}
                        </div>
                      </div>

                      {terminalOpen && (
                        <div className="h-full overflow-y-auto custom-scrollbar bg-[#0d0d10] p-4 font-mono text-xs pb-8">
                          <div className="flex items-center gap-2 mb-2 text-zinc-500">
                            <span className="text-primary">➜</span>
                            <span>~/workspace</span>
                            <span className="text-zinc-600">$</span>
                            <span className="text-zinc-400">
                              {language === "javascript"
                                ? "node"
                                : language === "python"
                                  ? "python3"
                                  : language === "c"
                                    ? "gcc"
                                    : language === "cpp"
                                      ? "./a.out"
                                      : "java"}{" "}
                              solution.
                              {language === "javascript"
                                ? "js"
                                : language === "python"
                                  ? "py"
                                  : language === "c"
                                    ? "c"
                                    : language === "cpp"
                                      ? "cpp"
                                      : language}
                            </span>
                          </div>
                          {output ? (
                            output.split("\n").map((line, i) => {
                              const isErr = /error|exception|traceback/i.test(
                                line,
                              );
                              const isOk = /success|\[|\]|true|false/.test(
                                line,
                              );
                              return (
                                <div
                                  key={i}
                                  className={`leading-5 ${isErr ? "text-red-400" : isOk ? "text-emerald-400" : "text-zinc-300"}`}
                                >
                                  {line || "\u00A0"}
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-zinc-600 italic">
                              // Output will appear here after you click Run ▶
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          /* ── DESKTOP: Side-by-side layout ── */
          <>
            {/* Left: Problem Panel */}
            <div className="w-1/3 min-h-0 border-r border-white/5 shrink-0">
              <ProblemPanel task={task} />
            </div>

            {/* Right: Code Workspace */}
            <div
              className="flex flex-col flex-1 min-w-0 min-h-0"
              ref={terminalResizeRef}
            >
              {isWebLang(language) ? (
                /* ── HTML / CSS mode ── */
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
                    <div className="flex items-center gap-1 bg-[#1a1a1e] border border-white/8 rounded-lg p-0.5">
                      {[
                        { id: "editor", label: "Editor", Icon: FiCode },
                        { id: "split", label: "Split", Icon: FiAlignLeft },
                        { id: "preview", label: "Preview", Icon: FiMaximize2 },
                      ].map(({ id, label, Icon }) => (
                        <button
                          key={id}
                          onClick={() => setPreviewMode(id)}
                          title={label}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition-all
                            ${previewMode === id ? "bg-primary text-black" : "text-zinc-500 hover:text-white"}`}
                        >
                          <Icon size={11} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Editor + Iframe */}
                  <div className="flex flex-1 min-h-0">
                    {previewMode !== "preview" && (
                      <div
                        className={`flex flex-col min-h-0 ${previewMode === "split" ? "w-1/2" : "w-full"}`}
                      >
                        <Editor
                          height="100%"
                          theme="vs-dark"
                          language={LANG_MONACO[language] || "html"}
                          value={code}
                          onChange={(v) => setCode(v || "")}
                          options={{
                            minimap: { enabled: false },
                            fontSize,
                            fontFamily:
                              "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                            padding: { top: 16, bottom: 16 },
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            cursorSmoothCaretAnimation: "on",
                            roundedSelection: true,
                            renderLineHighlight: "all",
                            scrollbar: {
                              useShadows: false,
                              vertical: "visible",
                              horizontal: "visible",
                              verticalScrollbarSize: 6,
                              horizontalScrollbarSize: 6,
                            },
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
                            ...(disableCopyPaste && {
                              contextmenu: false,
                              copyWithSyntaxHighlighting: false,
                            }),
                          }}
                        />
                      </div>
                    )}
                    {previewMode === "split" && (
                      <div className="w-px bg-white/8 shrink-0" />
                    )}
                    {previewMode !== "editor" && (
                      <div
                        className={`flex flex-col min-h-0 bg-white ${previewMode === "split" ? "w-1/2" : "w-full"}`}
                      >
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
                          key={code}
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
                /* ── Normal language mode ── */
                <>
                  <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex items-center  bg-zinc-800  gap-2 shrink-0">
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1e] border-b border-lime-400">
                        <FiCode size={11} className="text-primary" />
                        <span className="text-[10px] font-bold text-zinc-400">
                          solution.
                          {language === "javascript"
                            ? "js"
                            : language === "python"
                              ? "py"
                              : language === "cpp"
                                ? "cpp"
                                : language}
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
                          fontFamily:
                            "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                          padding: { top: 16, bottom: 16 },
                          smoothScrolling: true,
                          cursorBlinking: "smooth",
                          cursorSmoothCaretAnimation: "on",
                          roundedSelection: true,
                          renderLineHighlight: "all",
                          scrollbar: {
                            useShadows: false,
                            vertical: "visible",
                            horizontal: "visible",
                            verticalScrollbarSize: 6,
                            horizontalScrollbarSize: 6,
                          },
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
                          ...(disableCopyPaste && {
                            contextmenu: false,
                            copyWithSyntaxHighlighting: false,
                          }),
                        }}
                      />
                    </div>
                  </div>

                  {terminalOpen && (
                    <div
                      onMouseDown={handleTerminalMouseDown}
                      className={`h-1 shrink-0 cursor-row-resize flex items-center justify-center group transition-colors
                        ${isResizingTerminal ? "bg-primary/40" : "bg-white/5 hover:bg-primary/30"}`}
                    >
                      <div className="h-0.5 w-12 rounded-full bg-white/20 group-hover:bg-primary/60 transition-colors" />
                    </div>
                  )}

                  <div
                    className="shrink-0 border-t border-white/5 overflow-hidden"
                    style={{
                      height: terminalOpen ? `${terminalHeight}px` : "36px",
                    }}
                  >
                    <div
                      className="flex items-center justify-between px-4 py-2 bg-[#0f0f12] border-b border-white/5 cursor-pointer"
                      onClick={() => setTerminalOpen(!terminalOpen)}
                    >
                      <div className="flex items-center gap-2">
                        <FiTerminal size={12} className="text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Terminal
                        </span>
                        {isRunning && (
                          <span className="flex items-center gap-1 text-amber-400 text-[9px] font-bold">
                            <FiRefreshCw size={9} className="animate-spin" />
                            Running
                          </span>
                        )}
                        {output &&
                          !isRunning &&
                          (output.toLowerCase().includes("error") ? (
                            <FiAlertCircle size={11} className="text-red-400" />
                          ) : (
                            <FiCheckCircle
                              size={11}
                              className="text-emerald-400"
                            />
                          ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOutput("");
                          }}
                          className="text-zinc-600 hover:text-zinc-400 text-[9px] font-bold uppercase"
                        >
                          Clear
                        </button>
                        {terminalOpen ? (
                          <FiChevronDown size={13} className="text-zinc-500" />
                        ) : (
                          <FiChevronUp size={13} className="text-zinc-500" />
                        )}
                      </div>
                    </div>

                    {terminalOpen && (
                      <div className="h-full overflow-y-auto custom-scrollbar bg-[#0d0d10] p-4 font-mono text-xs pb-8">
                        <div className="flex items-center gap-2 mb-2 text-zinc-500">
                          <span className="text-primary">➜</span>
                          <span>~/workspace</span>
                          <span className="text-zinc-600">$</span>
                          <span className="text-zinc-400">
                            {language === "javascript"
                              ? "node"
                              : language === "python"
                                ? "python3"
                                : language === "c"
                                  ? "gcc"
                                  : language === "cpp"
                                    ? "./a.out"
                                    : "java"}{" "}
                            solution.
                            {language === "javascript"
                              ? "js"
                              : language === "python"
                                ? "py"
                                : language === "c"
                                  ? "c"
                                  : language === "cpp"
                                    ? "cpp"
                                    : language}
                          </span>
                        </div>
                        {output ? (
                          output.split("\n").map((line, i) => {
                            const isErr = /error|exception|traceback/i.test(
                              line,
                            );
                            const isOk = /success|\[|\]|true|false/.test(line);
                            return (
                              <div
                                key={i}
                                className={`leading-5 ${isErr ? "text-red-400" : isOk ? "text-emerald-400" : "text-zinc-300"}`}
                              >
                                {line || "\u00A0"}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-zinc-600 italic">
                            // Output will appear here after you click Run ▶
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f12] border-t border-white/5 shrink-0">
        <div className="hidden sm:flex items-center gap-4 text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Connected
          </div>
          <div className="w-px h-3 bg-white/10" />
          <span>Autosave On</span>
          <div className="w-px h-3 bg-white/10" />
          <span>
            Ln {1}, Col {1}
          </span>
        </div>
        <div className="text-[9px] text-zinc-600 font-bold">
          PlaceMateAI Coding Environment · {language.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default CodingSpace;
