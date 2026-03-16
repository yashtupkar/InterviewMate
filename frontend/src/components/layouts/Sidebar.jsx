import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiTrendingUp, 
  FiMessageSquare, 
  FiBriefcase, 
  FiFileText, 
  FiAward, 
  FiMessageCircle, 
  FiHelpCircle,
  FiLogOut,
  FiPlus,
  FiUsers
} from "react-icons/fi";
import { useUser, useClerk } from "@clerk/clerk-react";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { name: "Overview", icon: <FiTrendingUp />, path: "/dashboard", active: location.pathname === "/dashboard" },
    { name: "Create Interview", icon: <FiPlus />, path: "/dashboard/setup", active: location.pathname === "/dashboard/setup" }, 
    { name: "Interviews", icon: <FiMessageSquare />, path: "/dashboard/interviews", active: location.pathname === "/dashboard/interviews" },
    { name: "Group Discussion", icon: <FiUsers />, path: "/gd/setup", active: location.pathname === "/gd/setup" },
    { name: "GD Interviews", icon: <FiMessageCircle />, path: "/dashboard/gd-interviews", active: location.pathname === "/dashboard/gd-interviews" },
  ];

  const exposureItems = [
    // { name: "Jobs", icon: <FiBriefcase />, path: "#", badge: "Coming soon" },
    // { name: "Resume builder", icon: <FiFileText />, path: "#", badge: "Coming.." },
    // { name: "Leaderboard", icon: <FiAward />, path: "#", badge: "Coming So.." },
  ];

  const bottomItems = [
    { name: "Feedback", icon: <FiMessageCircle />, path: "#" },
    { name: "Help", icon: <FiHelpCircle />, path: "#" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64  bg-black border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-[#bef264] rounded-lg flex items-center justify-center font-bold text-black text-xl">
          P
        </div>
        <span className="text-white font-bold text-lg tracking-tight">
           PriPareAi
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
        {/* Main Section */}
        <div>
          <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider px-2 mb-4">Main</h3>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active 
                    ? "bg-[#bef264]/10 text-[#bef264]" 
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`}
              >
                <span className={item.active ? "text-[#bef264]" : "text-zinc-500"}>{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Exposure Section */}
        <div>
          <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider px-2 mb-4">Exposure</h3>
          <div className="space-y-1">
            {exposureItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 cursor-not-allowed group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-4 py-4 border-t border-white/5 space-y-4">
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors"
            >
              <span className="text-zinc-500">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>

        {/* User Profile */}
        <div className="relative mt-auto border-t border-white/5 pt-4" ref={menuRef}>
          {isProfileOpen && (
            <div className="absolute bottom-16 left-0 right-0 mb-2 bg-zinc-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
              <button
               
                className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-zinc-800/50 transition-all duration-200 group border border-transparent hover:border-white/5"
              >
                <div className="relative">
                  <img
                    src={user?.imageUrl}
                    alt={user?.firstName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#bef264]/20 transition-all"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-white text-[11px] font-bold truncate">{user?.fullName}</h4>
                  <p className="text-zinc-500 text-[10px] truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </button>
              <button 
                onClick={() => { openUserProfile(); setIsProfileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-b border-white/5"
              >
                <FiUsers className="text-zinc-500" />
                Manage Profile
              </button>
              <button 
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <FiLogOut />
                Sign Out
              </button>
            </div>
          )}
          
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-zinc-800/50 transition-all duration-200 group border border-transparent hover:border-white/5"
          >
            <div className="relative">
              <img 
                src={user?.imageUrl} 
                alt={user?.firstName} 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#bef264]/20 transition-all"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h4 className="text-white text-[11px] font-bold truncate">{user?.fullName}</h4>
              <p className="text-zinc-500 text-[10px] truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
