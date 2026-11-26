import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  User,
  LogOut,
  Wrench,
  Shield,
  GraduationCap,
  Search,
  PlusCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import NotificationPanel from '../components/common/NotificationPanel';
import { useThemeStore } from '../store/themeStore';
import api from '../services/axiosInstance';

/**
 * Premium Modern SaaS Header with Light & Dark Mode Toggle
 * Minimalist design inspired by Linear & Vercel
 */
export const Navbar = ({ user, onToggleSidebar, onLogout, onQuickTrack }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchInputRef = React.useRef(null);
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (user) {
      api
        .get('/notifications')
        .then((res) => {
          if (res?.unreadCount !== undefined) setUnreadCount(res.unreadCount);
        })
        .catch(() => {});
    }
  }, [user]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="purple" size="sm" withDot className="font-semibold px-2.5 py-0.5">
            <Shield className="w-3 h-3 mr-1 inline" /> Admin
          </Badge>
        );
      case 'staff':
        return (
          <Badge variant="warning" size="sm" withDot className="font-semibold px-2.5 py-0.5">
            <Wrench className="w-3 h-3 mr-1 inline" /> Staff
          </Badge>
        );
      case 'student':
      default:
        return (
          <Badge variant="primary" size="sm" withDot className="font-semibold px-2.5 py-0.5">
            <GraduationCap className="w-3 h-3 mr-1 inline" /> Student
          </Badge>
        );
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim() && onQuickTrack) {
      onQuickTrack(searchValue.trim());
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#0B0F19]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-150">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: mobile hamburger & breadcrumb or branding */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 -ml-2 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 focus:outline-none transition-colors lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                CF
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base">
                Campus<span className="text-indigo-600 dark:text-indigo-400">Fix</span>
              </span>
            </div>

            {/* Campus Operational Beacon (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Campus Grid: Active</span>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-lg mx-4 sm:mx-8">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search ticket ID (e.g. CF-2026-3969) or press Enter to track..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-16 py-1.5 text-xs rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right section: Theme Toggle, Quick action, Help, Notification Bell, User Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Action: Report an Issue */}
            <Link to="/student/report" className="hidden sm:inline-flex">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all duration-150 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </button>
            </Link>

            {/* LIGHT / DARK MODE TOGGLE BUTTON */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-90 duration-200" />
              )}
            </button>

            {/* Help / Guide Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsHelpOpen((prev) => !prev)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="System Guide & SLA Policies"
                aria-label="Help information"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {isHelpOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsHelpOpen(false)} />
                  <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-elevated p-4 text-xs animate-in fade-in duration-150 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-bold text-slate-900 dark:text-white">CampusFix Help & SLAs</h4>
                    </div>
                    <div className="space-y-2 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      <p>• <strong>Urgent:</strong> 4h target for critical outages (gas, power, floods).</p>
                      <p>• <strong>High:</strong> 12h target for high-disruption classroom faults.</p>
                      <p>• <strong>Medium / Low:</strong> 24h - 72h standard maintenance cycle.</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Campus Grid v2.4</span>
                      <Link to="/track" onClick={() => setIsHelpOpen(false)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                        Live Tracker →
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-[#0B0F19]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationPanel
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                onUnreadCountChange={setUnreadCount}
              />
            </div>

            {/* Role Badge */}
            {user && (
              <div className="hidden md:flex items-center">
                {getRoleBadge(user.role)}
              </div>
            )}

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CF'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-elevated p-2 text-xs animate-in fade-in duration-150">
                    <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/student/complaints"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                      >
                        My Complaints
                      </Link>
                      <Link
                        to="/track"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                      >
                        Public Tracker
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
