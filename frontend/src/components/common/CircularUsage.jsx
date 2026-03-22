import React from 'react';

const CircularUsage = ({ label, value, max, unit = "", color, size = 44, strokeWidth = 3 }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5 group cursor-default">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Shadow Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out opacity-80"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9px] font-black text-white leading-none">
            {value}{unit}
          </span>
          <span className="text-[7px] font-bold text-zinc-500 mt-0.5">
            /{max}{unit}
          </span>
        </div>
      </div>
      <span className="text-[8px] font-black text-zinc-200 uppercase tracking-widest">{label}</span>
    </div>
  );
};

export default CircularUsage;
