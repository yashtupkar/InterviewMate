import React from "react";

const TopNav = ({
  navigate,
  navItems,
  currentSection,
  joinQueue,
  queueBusy,
}) => (
  <div className="sticky top-0 z-40 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      <button
        onClick={() => navigate("/peer-interview")}
        className="text-sm md:text-base font-black tracking-wide text-white hover:text-[#bef264] transition"
      >
        Peer Interview Hub
      </button>

      <div className="flex flex-wrap items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.key;

          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                isActive
                  ? "bg-[#bef264]/15 border-[#bef264]/50 text-[#bef264]"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
              }`}
            >
              <Icon size={14} /> {item.label}
            </button>
          );
        })}

        <button
          onClick={joinQueue}
          disabled={queueBusy}
          className="px-5 py-2 rounded-xl bg-[#bef264] text-black text-sm font-black hover:bg-[#a3e635] transition disabled:opacity-70"
        >
          {queueBusy ? "Matching..." : "Start Match"}
        </button>
      </div>
    </div>
  </div>
);

export default TopNav;
