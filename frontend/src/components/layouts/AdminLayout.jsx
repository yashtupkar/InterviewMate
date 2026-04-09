import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiHome,
  FiUsers,
  FiCreditCard,
  FiMessageSquare,
  FiMail,
  FiList,
  FiBook,
  FiVideo,
  FiTrendingUp,
  FiSettings,
} from 'react-icons/fi';
import { MdSpaceDashboard } from 'react-icons/md';
import Logo from '../common/Logo';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminModules = [
    { label: 'Dashboard', icon: <MdSpaceDashboard />, path: '/admin', exact: true },
    { label: 'Users', icon: <FiUsers />, path: '/admin/users' },
    { label: 'Subscriptions', icon: <FiCreditCard />, path: '/admin/subscriptions' },
    { label: 'Feedback', icon: <FiMessageSquare />, path: '/admin/feedback' },
    { label: 'Contacts', icon: <FiMail />, path: '/admin/contacts' },
    { label: 'Waitlist', icon: <FiList />, path: '/admin/waitlist' },
    { label: 'Questions', icon: <FiBook />, path: '/admin/questions' },
    { label: 'Interviews', icon: <FiVideo />, path: '/admin/interviews' },
    { label: 'Analytics', icon: <FiTrendingUp />, path: '/admin/analytics' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative left-0 top-0 h-screen bg-surface border-r border-white/10 transition-all duration-300 z-40 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'w-64'}`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-white/10">
          {!isCollapsed && (
            <>
              <Link to="/" className="flex items-center gap-2">
                <Logo size={32} />
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="md:hidden text-zinc-400 hover:text-white"
              >
                <FiX size={20} />
              </button>
            </>
          )}
          {isCollapsed && (
            <Logo size={32} />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {adminModules.map((module) => (
            <Link
              key={module.path}
              to={module.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative ${
                isActive(module.path, module.exact)
                  ? 'bg-primary/20 text-primary'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title={isCollapsed ? module.label : ''}
            >
              <span className="text-lg shrink-0">{module.icon}</span>
              {!isCollapsed && (
                <>
                  <span className="font-medium text-sm">{module.label}</span>
                  {isActive(module.path, module.exact) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-surface-alt rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap text-xs border border-white/10 shadow-xl z-50">
                  {module.label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-20 bg-primary text-black hover:bg-primary hover:scale-110 items-center justify-center rounded-full w-6 h-6 transition-all shadow-lg z-50"
        >
          {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-surface border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              <FiMenu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-zinc-500">Welcome, {user?.firstName || 'Admin'}</p>
            </div>
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <img
                src={user?.imageUrl || 'https://via.placeholder.com/32'}
                alt={user?.fullName}
                className="w-8 h-8 rounded-full"
              />
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium text-white">{user?.firstName}</span>
                  <FiChevronDown size={16} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-alt border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-semibold text-white">{user?.fullName}</p>
                  <p className="text-xs text-zinc-500">{user?.emailAddresses?.[0]?.emailAddress}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <FiLogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-background">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
