import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

const InteractiveMCQ = ({ data, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(data.timeLimit || 60);

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
      onSubmit("Time's up! No option selected.");
    }, 2500);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isSubmitted) return;
    setIsSubmitted(true);
    setTimeout(() => {
      const selectedText = data.options[selectedOption];
      onSubmit(`Selected Option: ${selectedText}`);
    }, 2500);
  };

  const isCorrect = selectedOption === data.correctOptionIndex;

  return (
    <div className="my-2 rounded-xl border border-zinc-700 bg-zinc-800/80 p-4 shadow-lg w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-white">{data.question}</h4>
        <div className="flex items-center gap-1 text-xs font-medium bg-zinc-900 px-2 py-1 rounded-md text-zinc-300">
          <FiClock />
          <span className={timeLeft <= 10 ? "text-red-400" : ""}>{timeLeft}s</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {data.options.map((option, index) => {
          let buttonClass = "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors flex justify-between items-center ";
          
          if (!isSubmitted) {
            buttonClass += selectedOption === index 
              ? "border-indigo-500 bg-indigo-500/20 text-white" 
              : "border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800";
          } else {
            if (index === data.correctOptionIndex) {
              buttonClass += "border-green-500 bg-green-500/20 text-green-300";
            } else if (selectedOption === index) {
              buttonClass += "border-red-500 bg-red-500/20 text-red-300";
            } else {
              buttonClass += "border-zinc-800 bg-zinc-900/30 text-zinc-500 opacity-50";
            }
          }

          return (
            <button
              key={index}
              disabled={isSubmitted}
              onClick={() => setSelectedOption(index)}
              className={buttonClass}
            >
              <span>{option}</span>
              {isSubmitted && index === data.correctOptionIndex && <FiCheckCircle className="text-green-500" />}
              {isSubmitted && selectedOption === index && index !== data.correctOptionIndex && <FiXCircle className="text-red-500" />}
            </button>
          );
        })}
      </div>

      {!isSubmitted && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="px-4 py-2 bg-primary hover:bg-primary/70 text-black text-sm font-medium rounded-lg transition-colors  disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      )}
      {isSubmitted && (
        <div className="text-center mt-2 text-xs text-zinc-400 animate-pulse">
          Moving to next question...
        </div>
      )}
    </div>
  );
};

export default InteractiveMCQ;
