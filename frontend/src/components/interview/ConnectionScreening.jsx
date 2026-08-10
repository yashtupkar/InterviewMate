import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiLoader, FiShield, FiWifi, FiMic, FiVideo } from "react-icons/fi";

const ConnectionScreening = ({ agentName }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800), // Check connection
      setTimeout(() => setStep(2), 1600), // Secure environment
      setTimeout(() => setStep(3), 2400), // Verify hardware
      setTimeout(() => setStep(4), 3200), // Ready
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { icon: FiWifi, label: "Establishing secure connection..." },
    { icon: FiShield, label: "Securing interview environment..." },
    { icon: FiMic, label: "Verifying audio/video devices..." },
    { icon: FiCheckCircle, label: "Connecting to agent..." },
  ];

  return (
    <div className="absolute inset-0 z-[200] bg-zinc-900 flex flex-col items-center justify-center font-sans overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 flex flex-col items-center">
        {/* Animated Orbs */}
        <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-zinc-800 rounded-full animate-[spin_4s_linear_infinite]" />
          <div className="absolute inset-2 border-4 border-primary/30 rounded-full animate-[spin_3s_linear_infinite_reverse]" />
          <div className="absolute inset-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <FiLoader className="w-6 h-6 text-primary animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 tracking-wide text-center">
          Preparing Session
        </h2>
        <p className="text-zinc-400 text-sm mb-8 text-center">
          Setting up your interview with <span className="text-primary font-medium">{agentName}</span>
        </p>

        {/* Steps List */}
        <div className="w-full space-y-4 mb-10">
          {steps.map((s, index) => {
            const isActive = step === index;
            const isCompleted = step > index;
            const isPending = step < index;
            
            return (
              <div 
                key={index}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${
                  isActive ? "bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]" : "bg-transparent border border-transparent"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  isCompleted ? "bg-green-500/20 text-green-400" :
                  isActive ? "bg-primary/20 text-primary" : "bg-zinc-800 text-zinc-600"
                }`}>
                  {isCompleted ? <FiCheckCircle className="w-4 h-4" /> : <s.icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />}
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isCompleted ? "text-zinc-300" :
                  isActive ? "text-primary" : "text-zinc-600"
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tips Section */}
        <div className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5 backdrop-blur-sm">
          <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Pro Tips
          </h3>
          <ul className="text-xs text-zinc-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Speak clearly and naturally, as if talking to a real person.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Ensure your face is well-lit and clearly visible in the camera.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Use the code editor when prompted to solve technical challenges.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConnectionScreening;
