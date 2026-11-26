import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuthStore } from '../store/authStore';
import { ChevronRight, Zap, Radio, Activity, Sparkles } from 'lucide-react';

/**
 * Hyper-Animatic Futuristic Enterprise Shell with Cyber Mesh Background
 * Features floating ambient gradient orbs, live telemetry status ribbons, and smooth page transitions.
 */
export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }) + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickTrack = (trackingId) => {
    navigate(`/track?id=${encodeURIComponent(trackingId)}`);
  };

  // Breadcrumbs map
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbLabels = {
    student: 'Student Hub',
    admin: 'Administration',
    dashboard: 'Dashboard',
    report: 'Report Issue',
    complaints: 'Issue Registry',
    queue: 'Work Queue',
    analytics: 'SLA Telemetry',
    staff: 'Technician Field',
    categories: 'Category Config',
    track: 'Issue Tracker',
    announcements: 'Campus Broadcast',
    'lost-found': 'Lost & Found Hub',
  };

  return (
    <div className="relative h-screen w-screen bg-[#F8FAFC] dark:bg-[#070A12] flex text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200 overflow-hidden select-auto">
      {/* 1. Futuristic Ambient Mesh Background with Floating Light Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle Cyber Grid */}
        <div className="absolute inset-0 cyber-grid opacity-60 dark:opacity-40" />

        {/* Ambient Floating Glow Orb 1 (Indigo / Blue) */}
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-500/15 to-cyan-500/15 blur-3xl"
        />

        {/* Ambient Floating Glow Orb 2 (Purple / Violet) */}
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-pink-500/15 blur-3xl"
        />

        {/* Ambient Floating Glow Orb 3 (Emerald / Cyan on bottom left) */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 blur-3xl"
        />
      </div>

      {/* 2. Fixed Full-Height Sidebar (Never scrolls out of view) */}
      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* 3. Main Content Shell */}
      <div className="relative z-10 flex-1 h-full flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar (Fixed at top) */}
        <div className="shrink-0 z-20">
          <Navbar
            user={user}
            onToggleSidebar={handleToggleSidebar}
            onLogout={handleLogout}
            onQuickTrack={handleQuickTrack}
          />
        </div>

        {/* Sub-header Breadcrumb & Futuristic Telemetry Context Bar (Fixed) */}
        <div className="shrink-0 z-10 bg-white/80 dark:bg-[#0A0E1A]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-indigo-950/60 px-4 sm:px-6 lg:px-8 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs transition-colors duration-200">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
            <Link
              to="/"
              className="text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 font-extrabold flex items-center gap-1.5 transition-colors group"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
              <span>CampusFix</span>
            </Link>

            {pathParts.map((part, index) => (
              <React.Fragment key={part + index}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                <span
                  className={
                    index === pathParts.length - 1
                      ? 'font-extrabold text-indigo-600 dark:text-cyan-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }
                >
                  {breadcrumbLabels[part] || part.charAt(0).toUpperCase() + part.slice(1)}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Futuristic Telemetry Status Badges */}
          <div className="hidden md:flex items-center gap-3 text-[11px] font-mono">
            {/* Live Telemetry Beacon */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[10px] tracking-wide">MESH ONLINE</span>
            </div>

            {/* Neural SLA Engine Status */}
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25">
              <Zap className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              <span className="text-[10px] font-bold">NEURAL SLA ACTIVE</span>
            </div>

            {/* Futuristic Clock */}
            <span className="text-slate-400 dark:text-slate-500 text-xs">•</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] font-bold">
              {currentTime}
            </span>
          </div>
        </div>

        {/* 4. Page View Body (Only this area scrolls smoothly) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="max-w-7xl w-full mx-auto pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.995 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
