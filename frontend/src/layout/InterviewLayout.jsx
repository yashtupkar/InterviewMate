import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { InterviewProvider } from "../context/InterviewContext";
import Sidebar from "../components/layouts/Sidebar";
import Logo from "../components/common/Logo";

const InterviewLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-900">
      {/* Mobile Menu Button - Top Header */}
      <div className="md:hidden fixed top-0 left-0 w-full z-[40] bg-zinc-900 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <div className="font-bold text-white tracking-tight text-xl">
            PlaceMate<span className="text-[#bef264]">AI</span>
          </div>
        </div>
        <button 
          className="p-2 bg-zinc-800 rounded-lg text-white border border-white/10 hover:bg-zinc-700 transition"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <FiMenu size={20} />
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-[40] backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isDesktopCollapsed}
        toggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
      />
      
      <main className={`flex-1 min-h-screen w-full mt-16 md:mt-0 pb-16 md:pb-0 transition-all duration-300 ease-in-out ${isDesktopCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default InterviewLayout;
