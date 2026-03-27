import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MonthYearPicker = ({
  value,
  onChange,
  placeholder = "MM/YYYY",
  align = "left",
  showPresent = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current value
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const isPresent = value === "Present";

  useEffect(() => {
    if (value && value !== "Present") {
      const [m, y] = value.split("/");
      if (m && y) {
        setSelectedMonth(m);
        setSelectedYear(y);
      }
    } else {
      setSelectedMonth("");
      setSelectedYear("");
    }
  }, [value]);

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

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear + 5; y >= currentYear - 40; y--) {
    years.push(y.toString());
  }

  const handleSelectMonth = (m) => {
    const monthNum = (months.indexOf(m) + 1).toString().padStart(2, "0");
    const newValue = `${monthNum}/${selectedYear || currentYear}`;
    onChange(newValue);
    setSelectedMonth(monthNum);
    if (!selectedYear) setSelectedYear(currentYear.toString());
  };

  const handleSelectYear = (y) => {
    const newValue = `${selectedMonth || "01"}/${y}`;
    onChange(newValue);
    setSelectedYear(y);
    if (!selectedMonth) setSelectedMonth("01");
  };

  const togglePresent = () => {
    if (isPresent) {
      onChange("");
    } else {
      onChange("Present");
    }
  };

  const displayValue = value || "";

  return (
    <div className="relative" ref={containerRef}>
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
          className={`absolute z-[9999] mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col w-[280px] md:w-[320px] animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/10 ${
            align === "right"
              ? "right-0 origin-top-right"
              : "left-0 origin-top-left"
          }`}
        >
          {showPresent && (
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Present (Current)
              </span>
              <button
                onClick={togglePresent}
                className={`w-10 h-5 rounded-full transition-all relative ${
                  isPresent ? "bg-lime-400" : "bg-zinc-700"
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

          <div className="flex flex-col md:flex-row flex-1">
            {/* Months Grid */}
            <div className="flex-1 p-2 border-b md:border-b-0 md:border-r border-zinc-800">
              <div className="grid grid-cols-3 gap-1">
                {months.map((m, idx) => {
                  const monthNum = (idx + 1).toString().padStart(2, "0");
                  const isSelected = selectedMonth === monthNum && !isPresent;
                  return (
                    <button
                      key={m}
                      disabled={isPresent}
                      onClick={() => handleSelectMonth(m)}
                      className={`px-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all ${
                        isSelected
                          ? "bg-lime-400 text-zinc-950 shadow-[0_0_10px_rgba(163,230,53,0.3)]"
                          : isPresent
                            ? "text-zinc-700 cursor-not-allowed"
                            : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Years Grid */}
            <div className="flex-1 p-2 max-h-[200px] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-1">
                {years.map((y) => {
                  const isSelected = selectedYear === y && !isPresent;
                  return (
                    <button
                      key={y}
                      disabled={isPresent}
                      onClick={() => handleSelectYear(y)}
                      className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all ${
                        isSelected
                          ? "bg-lime-400 text-zinc-950 shadow-[0_0_10px_rgba(163,230,53,0.3)]"
                          : isPresent
                            ? "text-zinc-700 cursor-not-allowed"
                            : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthYearPicker;
