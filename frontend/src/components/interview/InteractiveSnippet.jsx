import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { FiClock, FiCode } from "react-icons/fi";

const InteractiveSnippet = ({ data, onSubmit }) => {
  const [answer, setAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(data.timeLimit || 90);

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const handleTimeUp = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      onSubmit(`Time's up! Partial answer: ${answer}`);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!answer.trim() || isSubmitted) return;
    setIsSubmitted(true);
    setTimeout(() => {
      onSubmit(`Answer: ${answer}`);
    }, 1500);
  };

  return (
    <div className="my-2 rounded-xl border border-zinc-700 bg-zinc-800/80 p-4 shadow-lg w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <FiCode className="text-indigo-400" />
          {data.question}
        </h4>
        <div className="flex items-center gap-1 text-xs font-medium bg-zinc-900 px-2 py-1 rounded-md text-zinc-300">
          <FiClock />
          <span className={timeLeft <= 10 ? "text-red-400" : ""}>{timeLeft}s</span>
        </div>
      </div>

      <div className="relative bg-[#1e1e1e] rounded-lg overflow-hidden border border-zinc-700 mb-4" style={{ height: '200px' }}>
        <Editor
          height="100%"
          language={data.language === 'js' ? 'javascript' : data.language}
          theme="vs-dark"
          value={data.code}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            padding: { top: 12, bottom: 12 },
            lineNumbers: "on",
            folding: false,
            wordWrap: "on"
          }}
        />
      </div>

      <div className="space-y-3">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isSubmitted}
          placeholder="Type your answer here..."
          className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none h-24 disabled:opacity-50"
        />

        {!isSubmitted ? (
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="px-4 py-2 bg-primary hover:bg-primary/70 text-black text-sm font-medium rounded-lg transition-colors  disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          </div>
        ) : (
          <div className="text-center mt-2 text-xs text-zinc-400 animate-pulse">
            Submitting and moving to next question...
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveSnippet;
