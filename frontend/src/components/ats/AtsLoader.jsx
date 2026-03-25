import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const steps = [
  "Parsing your resume",
  "Analyzing your experience",
  "Extracting your skills",
  "Generating recommendations"
];

const AtsLoader = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Simulate steps progressing while the single API request is ongoing
    const timers = [];
    
    // Step 0 -> 1 after 1s
    timers.push(setTimeout(() => setCurrentStep(1), 1000));
    // Step 1 -> 2 after 3.5s
    timers.push(setTimeout(() => setCurrentStep(2), 3500));
    // Step 2 -> 3 after 6s
    timers.push(setTimeout(() => setCurrentStep(3), 6000));
    
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] flex items-center flex-col justify-center border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
      
     
      <div className="flex flex-col gap-8 relative z-10 w-full max-w-sm mx-auto">
        <h3 className="text-white text-xl font-bold tracking-tight mb-2 text-center">
          Scanning in progress...
        </h3>

        <div className="space-y-6 relative">
          {/* Connecting line */}
          <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-white/5 z-0 rounded-full"></div>

          {steps.map((step, index) => {
            const isCompleted = currentStep > index;
            const isActive = currentStep === index;
            const isPending = currentStep < index;

            return (
              <div 
                key={index} 
                className={`flex items-center gap-4 relative z-10 transition-all duration-500 ${isPending ? 'opacity-40 translate-y-2' : isActive ? 'opacity-100 translate-y-0 scale-105' : 'opacity-100 translate-y-0'}`}
              >
                <div className="bg-[#121214] p-0.5 rounded-full">
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-[#bef264] fill-[#bef264]/20" />
                  ) : isActive ? (
                    <div className="w-6 h-6 rounded-full border-2 border-[#bef264] border-t-transparent animate-spin flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-zinc-600" />
                  )}
                </div>
                
                <span className={`font-medium text-[15px] transition-colors duration-300 ${isActive ? 'text-white font-bold' : isCompleted ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AtsLoader;
