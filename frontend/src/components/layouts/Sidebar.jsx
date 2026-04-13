import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, useUser, useClerk } from "@clerk/clerk-react";
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
  FiUsers,
  FiCreditCard,
  FiStar,
  FiLinkedin,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiGift,
  FiBookOpen,
} from "react-icons/fi";

import Logo from "../common/Logo";
import { MdSpaceDashboard, MdLiveHelp } from "react-icons/md";
import { HiSparkles } from "react-icons/hi2";
import { FaBook, FaUsers } from "react-icons/fa";
import { BsFileEarmarkTextFill, BsFileEarmarkPersonFill } from "react-icons/bs";
import { IoChatboxEllipses } from "react-icons/io5";
import FeedbackPopup from "../modals/FeedbackPopup";
import { TbBriefcaseFilled } from "react-icons/tb";
import Skeleton from "../common/Skeleton";

const Sidebar = ({ isOpen, onClose, isCollapsed, toggleCollapse }) => {
  const location = useLocation();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { openUserProfile, signOut } = useClerk();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const menuRef = React.useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/subscription/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setSubscription(res.data);
      } catch (err) {
        console.error("Error fetching subscription:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [getToken]);

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
    {
      name: "Overview",
      icon: <MdSpaceDashboard />,
      path: "/dashboard",
      active: location.pathname === "/dashboard",
    },
    {
      name: "Mock Interviews",
      icon: <HiSparkles />,
      path: "/dashboard/setup",
      active: location.pathname === "/dashboard/setup",
    },
    {
      name: "GD Simulator",
      icon: <FaUsers />,
      path: "/gd/setup",
      active: location.pathname === "/gd/setup",
    },
    {
      name: "Reports",
      icon: <BsFileEarmarkTextFill />,
      path: "/dashboard/reports",
      active: location.pathname.startsWith("/dashboard/reports"),
    },
    {
      name: "Resume Tools",
      icon: <TbBriefcaseFilled />,
      active:
        location.pathname === "/ats-scorer" ||
        location.pathname === "/resume-builder",
      subItems: [
        {
          name: "ATS Scanner",
          path: "/ats-scorer",
          active: location.pathname === "/ats-scorer",
          badge: "New",
        },
        {
          name: "Resume Builder",
          path: "/resume-builder",
          active: location.pathname === "/resume-builder",
          badge: "New",
        },
      ],
    },
    {
      name: "Question Bank",
      icon: <FaBook />,
      path: "/questions",
      active: location.pathname.startsWith("/questions"),
      badge: "Free",
    },
  ];

  const exposureItems = [
    {
      name: "LinkedIn AI",
      icon: <FiLinkedin />,
      path: "/dashboard/linkedin",
      active: location.pathname === "/dashboard/linkedin",
      badge: "Premium",
    },
  ];

  const bottomItems = [
    { name: "Feedback", icon: <IoChatboxEllipses />, path: "#" },
    { name: "Help", icon: <MdLiveHelp />, path: "/help" },
  ];

  const mainCredits = subscription?.credits || 0;
  const creditLimit = subscription?.limits?.credits || 200;
  const topupCredits = subscription?.topupCredits || 0;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-black border-r border-white/20 flex flex-col z-[50] transition-all duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} ${isCollapsed ? "w-18 " : "w-64"}`}
    >
      {/* Logo */}
      <div
        className={`px-4 py-4 flex items-center h-16 relative ${isCollapsed ? "justify-center" : "justify-between"}`}
      >
        <Link to="/" className="flex items-center gap-2">
          {<Logo size={isCollapsed ? 32 : 32} />}
          {!isCollapsed && (
            <span className="text-white text-xl cursor-pointer font-semibold tracking-tight">
              PlaceMate<span className="text-primary">AI</span>
            </span>
          )}
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-white/10"
        >
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            height="20"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Collapse Toggle Button (Desktop only) */}
      <button
        onClick={toggleCollapse}
        className="hidden md:flex absolute -right-3 top-[3rem] bg-[#bef264] text-black hover:text-black border border-white/20 hover:border-white/40 items-center justify-center rounded-full w-6 h-6 transition-colors z-[51] shadow-md"
      >
        {isCollapsed ? (
          <FiChevronRight size={14} />
        ) : (
          <FiChevronLeft size={14} />
        )}
      </button>

      {/* Navigation */}
      <div
        className={`flex-1 ${isCollapsed ? "px-2 overflow-x-hidden" : "px-4"} py-4 space-y-8 custom-scrollbar overflow-y-auto`}
      >
        {/* Main Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider px-2 mb-2">
              Main
            </h3>
          )}
          <div className="space-y-1">
            {menuItems.map((item) =>
              item.subItems ? (
                <div key={item.name} className="flex flex-col space-y-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (isCollapsed) {
                        toggleCollapse();
                        setOpenDropdowns((prev) => ({
                          ...prev,
                          [item.name]: true,
                        }));
                      } else {
                        setOpenDropdowns((prev) => ({
                          ...prev,
                          [item.name]: !prev[item.name],
                        }));
                      }
                    }}
                    title={isCollapsed ? item.name : ""}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group ${
                      item.active || openDropdowns[item.name]
                        ? "bg-[#bef264]/10 text-[#bef264]"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                    }`}
                  >
                    <div
                      className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-2"}`}
                    >
                      <span
                        className={`text-lg shrink-0 ${item.active || openDropdowns[item.name] ? "text-[#bef264]" : "text-zinc-500"}`}
                      >
                        {item.icon}
                      </span>
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <FiChevronDown
                        className={`transition-transform duration-200 ${openDropdowns[item.name] ? "rotate-180" : ""}`}
                      />
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-white/10 shadow-xl">
                        {item.name}
                      </div>
                    )}
                  </button>
                  {!isCollapsed && openDropdowns[item.name] && (
                    <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          onClick={onClose}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            subItem.active
                              ? "text-[#bef264] bg-[#bef264]/5"
                              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                          }`}
                        >
                          <span className="truncate">{subItem.name}</span>
                          {subItem.badge && (
                            <span className="text-[9px]  bg-[#bef264] px-3 py-0.2 rounded text-black whitespace-nowrap shrink-0 ml-2">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  title={isCollapsed ? item.name : ""}
                  className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"} px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group ${
                    item.active
                      ? "bg-[#bef264]/10 text-[#bef264]"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <span
                    className={`text-lg shrink-0 ${item.active ? "text-[#bef264]" : "text-zinc-500"}`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.name}</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-white/10 shadow-xl">
                      {item.name}
                    </div>
                  )}
                </Link>
              ),
            )}
          </div>
        </div>
        {/* Exposure Section */}
        <div>
          {!isCollapsed && (
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider px-2 mb-2">
              Exposure
            </h3>
          )}
          <div className="space-y-1">
            {exposureItems.map((item) =>
              item.path === "#" || item.badge === "Working On" ? (
                <div
                  key={item.name}
                  title={isCollapsed ? item.name : ""}
                  className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 cursor-not-allowed group relative`}
                >
                  <div
                    className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}
                  >
                    <span className="text-lg shrink-0 text-zinc-600">
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5 whitespace-nowrap">
                      {item.badge}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-white/10 shadow-xl">
                      {item.name} {item.badge ? `(${item.badge})` : ""}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  title={isCollapsed ? item.name : ""}
                  className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group ${
                    item.active
                      ? "bg-[#bef264]/10 text-[#bef264]"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <div
                    className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}
                  >
                    <span
                      className={`text-lg shrink-0 ${item.active ? "text-[#bef264]" : "text-zinc-500"}`}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border whitespace-nowrap ${item.active ? "bg-[#bef264]/20 text-[#bef264] border-[#bef264]/30" : "bg-white/5 text-white/70 border-white/10"}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-white/10 shadow-xl">
                      {item.name} {item.badge ? `(${item.badge})` : ""}
                    </div>
                  )}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className={`${isCollapsed ? "px-2" : "px-4"} py-4 border-t border-white/5 space-y-3`}
      >
        <div className="space-y-0.5">
          {bottomItems.map((item) =>
            item.name === "Feedback" ? (
              <button
                key={item.name}
                onClick={() => {
                  setShowFeedback(true);
                  onClose && onClose();
                }}
                title={isCollapsed ? item.name : ""}
                className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-2 text-left"} px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors relative group`}
              >
                <span className="text-lg shrink-0 text-zinc-500">
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.name}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-white/10 shadow-xl">
                    {item.name}
                  </div>
                )}
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                title={isCollapsed ? item.name : ""}
                className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"} px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-white transition-colors relative group`}
              >
                <span className="text-lg shrink-0 text-zinc-500">
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.name}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-white/10 shadow-xl">
                    {item.name}
                  </div>
                )}
              </Link>
            ),
          )}
        </div>

        {/* Compact Subscriptions Card - Circular Redesign */}
        {!isCollapsed &&
          (loading ? (
            <Skeleton className="h-[100px] w-full rounded-2xl mx-1" />
          ) : subscription ? (
            <div
              onClick={() => navigate("/billing")}
              className="relative bg-[#bef264] rounded-xl p-4 space-y-4 shadow-[0_10px_30px_-10px_rgba(190,242,100,0.5)] mx-1 group transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] leading-none opacity-80">
                  {subscription.tier}
                </span>
                <Link
                  to="/pricing"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="text-[10px] font-black text-black/60 hover:text-black transition-all uppercase tracking-widest leading-none border-b border-black/10 hover:border-black pb-0.5"
                >
                  Upgrade
                </Link>
              </div>

              <div className="space-y-2.5">
                <div className="relative flex items-center justify-between gap-2 text-black">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-60">
                    Main Credits
                  </p>

                  <p className="text-[11px] leading-none font-black italic mt-1">
                    {Math.round(mainCredits)}
                    <span className="text-black/35 mx-1 not-italic">/</span>
                    {creditLimit}
                  </p>

                  <div className="absolute right-0 top-10 z-30 w-44 rounded-lg border border-black/15 bg-[#d7f6a7] shadow-xl px-2.5 py-2 space-y-1.5 text-[10px] font-black tracking-widest text-black opacity-0 pointer-events-none translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0">
                    <div className="flex items-center justify-between">
                      <span className="uppercase opacity-60">Available</span>
                      <span className="italic">
                        {Math.round(mainCredits + topupCredits)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="uppercase opacity-60">Main</span>
                      <span className="italic">{Math.round(mainCredits)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="uppercase opacity-60">Top-up</span>
                      <span className="italic">{Math.round(topupCredits)}</span>
                    </div>
                  </div>
                </div>

                <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden p-[1px] border border-black/5">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-1000 ease-out relative"
                    style={{
                      width: `${Math.min(100, (mainCredits / creditLimit) * 100)}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/10 animate-shimmer"></div>
                  </div>
                </div>

                {topupCredits > 0 && (
                  <div className="flex items-center justify-between font-black uppercase tracking-[0.18em] text-black/60">
                    <span className="text-[9px]">Top-up Credits</span>
                    <span className="text-[11px] text-black">
                      {Math.round(topupCredits)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : null)}

        {/* User Profile */}
        <div
          className="relative mt-auto border-t border-white/5 pt-4"
          ref={menuRef}
        >
          {isProfileOpen && (
            <div
              className={`absolute bottom-16 ${isCollapsed ? "left-14 w-48" : "left-0 right-0"} mb-2 bg-zinc-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50`}
            >
              <button className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-zinc-800/50 transition-all duration-200 group border border-transparent hover:border-white/5">
                <div className="relative">
                  <img
                    src={user?.imageUrl}
                    alt={user?.firstName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#bef264]/20 transition-all"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-white text-[11px] font-bold truncate">
                    {user?.fullName}
                  </h4>
                  <p className="text-zinc-500 text-[10px] truncate">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </button>
              <button
                onClick={() => {
                  openUserProfile();
                  setIsProfileOpen(false);
                  onClose && onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-b border-white/5"
              >
                <FiUsers className="text-zinc-500 shrink-0" />
                Manage Profile
              </button>
              <Link
                to="/billing"
                onClick={() => {
                  setIsProfileOpen(false);
                  onClose && onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-b border-white/5"
              >
                <FiCreditCard className="text-zinc-500 shrink-0" />
                Plans & Billing
              </Link>
              <Link
                to="/referrals"
                onClick={() => {
                  setIsProfileOpen(false);
                  onClose && onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-b border-white/5"
              >
                <FiGift className="text-zinc-500 shrink-0" />
                Referrals
              </Link>
              <button
                onClick={() => {
                  signOut();
                  onClose && onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <FiLogOut className="shrink-0" />
                Sign Out
              </button>
            </div>
          )}

          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 bg-transparent" : "gap-3 px-2 bg-zinc-800/70"} py-2 rounded-xl transition-all duration-200 group border border-transparent hover:border-white/5`}
          >
            <div className="relative">
              <img
                src={user?.imageUrl}
                alt={user?.firstName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#bef264]/20 transition-all"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-white text-[11px] font-bold truncate">
                  {user?.fullName}
                </h4>
                <p className="text-zinc-500 text-[10px] truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            )}
          </button>
        </div>
      </div>
      <FeedbackPopup
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </aside>
  );
};

export default Sidebar;
