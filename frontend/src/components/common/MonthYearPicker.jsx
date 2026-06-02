import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MonthYearPicker = ({
  value,
  onChange,
  placeholder = "MM/YYYY",
  align = "left",
  showPresent = false,
  maxYear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const isPresent = value === "Present";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const parseValue = (val) => {
    if (!val || val === "Present") return null;
    const [m, y] = val.split("/");
    if (m && y) {
      return new Date(parseInt(y), parseInt(m) - 1, 1);
    }
    return null;
  };

  const handleDateChange = (date) => {
    if (!date) {
      onChange("");
      return;
    }
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString();
    onChange(`${m}/${y}`);
    setIsOpen(false); // Close dropdown on selection
  };

  const togglePresent = () => {
    if (isPresent) {
      onChange("");
    } else {
      onChange("Present");
      setIsOpen(false); // Close dropdown when selecting Present
    }
  };

  const displayValue = value || "";

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus-within:border-lime-500/50 transition-all cursor-pointer flex items-center justify-between group"
      >
        <span className={displayValue ? "text-white" : "text-zinc-600"}>
          {displayValue || placeholder}
        </span>
        <Calendar className="w-4 h-4 text-zinc-600 group-hover:text-lime-400 transition-colors" />
      </div>

      {isOpen && (
        <div
          className={`absolute z-[9999] mt-2 bg-white border border-zinc-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 w-max ${
            align === "right"
              ? "right-0 origin-top-right"
              : "left-0 origin-top-left"
          }`}
        >
          {showPresent && (
            <div className="p-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-100">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                Present (Current)
              </span>
              <button
                onClick={togglePresent}
                className={`w-10 h-5 rounded-full transition-all relative ${
                  isPresent ? "bg-[#216ba5]" : "bg-zinc-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${
                    isPresent ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          )}

          {!isPresent && (
            <DatePicker
              selected={parseValue(value)}
              onChange={handleDateChange}
              showMonthYearPicker
              inline
              maxDate={maxYear ? new Date(maxYear, 11, 31) : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MonthYearPicker;
