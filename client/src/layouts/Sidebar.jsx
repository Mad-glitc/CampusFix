import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  ListTodo,
  Search,
  BarChart3,
  Users,
  Tags,
  CheckCircle2,
  Cpu,
  X,
  Sparkles,
  ShieldCheck,
  Wrench,
  GraduationCap,
  LogOut,
  ChevronRight,
  ChevronLeft,
  LifeBuoy,
  Megaphone,
  Compass,
} from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * Premium Deep Navy Sidebar inspired by Linear.app & Stripe Dashboard
 * Colors: Deep Navy (#111827) with subtle borders and glowing active indicators.
 */
export const Sidebar = ({ user, isOpen, onClose, onLogout, isCollapsed, onToggleCollapse }) => {
  const role = user?.role || 'student';

  const navItems = [
    // Student navigation
    {
      label: 'Student Workspace',
      to: '/student/dashboard',
      icon: LayoutDashboard,
      roles: ['student'],
      section: 'WORKSPACE',
    },
    {
      label: 'Report Issue',
      to: '/student/report',
      icon: PlusCircle,
      roles: ['student'],
      section: 'WORKSPACE',
      highlight: true,
    },
    {
      label: 'Ticket History',
      to: '/student/complaints',
      icon: ListTodo,
      roles: ['student'],
      section: 'WORKSPACE',
    },

    // Admin navigation
    {
      label: 'Command Center',
      to: '/admin/dashboard',
      icon: LayoutDashboard,
      roles: ['admin'],
      section: 'OPERATIONS',
    },
    {
      label: 'Triage & Dispatch',
      to: '/admin/complaints',
      icon: ListTodo,
      roles: ['admin'],
      section: 'OPERATIONS',
    },
    {
      label: 'SLA Telemetry',
      to: '/admin/analytics',
      icon: BarChart3,
      roles: ['admin'],
      section: 'ANALYTICS',
    },
    {
      label: 'Technician Staff',
      to: '/admin/staff',
      icon: Users,
      roles: ['admin'],
      section: 'MANAGEMENT',
    },
    {
      label: 'Categories & SLAs',
      to: '/admin/categories',
      icon: Tags,
      roles: ['admin'],
      section: 'MANAGEMENT',
    },

    // Staff navigation
    {
      label: 'Technician Workspace',
      to: '/staff/dashboard',
      icon: LayoutDashboard,
      roles: ['staff'],
      section: 'DISPATCH',
    },
    {
      label: 'Assigned Work Queue',
      to: '/staff/queue',
      icon: CheckCircle2,
      roles: ['staff'],
      section: 'DISPATCH',
    },

    // Universal tools
    {
      label: 'Campus Announcements',
      to: '/announcements',
      icon: Megaphone,
      roles: ['student', 'admin', 'staff'],
      section: 'TOOLS',
    },
    {
      label: 'Lost & Found',
      to: '/lost-found',
      icon: Compass,
      roles: ['student', 'admin', 'staff'],
      section: 'TOOLS',
    },
    {
      label: 'Public Issue Tracker',
      to: '/track',
      icon: Search,
      roles: ['student', 'admin', 'staff'],
      section: 'TOOLS',
    },
  ];

  const accessibleItems = navItems.filter((item) => item.roles.includes(role));

  // Group by sections
  const sections = accessibleItems.reduce((acc, item) => {
    const sec = item.section || 'MENU';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(item);
    return acc;
  }, {});

  const getRoleIcon = () => {
    if (role === 'admin') return ShieldCheck;
    if (role === 'staff') return Wrench;
    return GraduationCap;
  };
  const RoleIcon = getRoleIcon();

  const sidebarContent = (
    <div className="flex flex-col h-full w-full bg-[#111827] text-slate-300 border-r border-slate-800/80 selection:bg-indigo-600 selection:text-white select-none">
      {/* Brand Header (Strictly pinned at top) */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 6 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40 font-black text-sm shrink-0 ring-1 ring-white/30 cursor-pointer overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xs" />
            <span className="relative z-10">CF</span>
          </motion.div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-white tracking-tight leading-none">
                  Campus<span className="text-cyan-400">Fix</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                  GRID OS
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono tracking-widest mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                NEURAL DISPATCH
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar collapse"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections (Scrolls only internally if height is limited) */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto overscroll-contain">
        {Object.entries(sections).map(([sectionName, items]) => (
          <div key={sectionName} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-white flex items-center justify-between">
                <span>{sectionName}</span>
              </div>
            )}

            {items.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.to}
                  whileHover={{ x: 3 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                >
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 overflow-hidden',
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600/35 via-indigo-600/10 to-transparent text-white font-extrabold border-l-2 border-cyan-400 shadow-[inset_0_0_15px_rgba(99,102,241,0.25)]'
                          : 'text-slate-200 hover:text-white hover:bg-slate-800/80',
                        item.highlight && !isCollapsed
                          ? 'bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-cyan-600/10 border border-indigo-500/30 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : ''
                      )
                    }
                    title={item.label}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                        item.highlight ? 'text-cyan-400' : 'text-slate-200 group-hover:text-cyan-300'
                      )}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 truncate tracking-tight text-white font-bold">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_6px_rgba(6,182,212,0.3)]">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile & Logout Footer (Strictly pinned at bottom) */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                <RoleIcon className="w-4 h-4" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 shadow-[0_0_6px_#10b981]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Authorized User'}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium truncate capitalize">
                  <span className="text-indigo-400 font-bold">{role}</span>
                  <span>•</span>
                  <span>{user?.department || 'Main Campus'}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Sign out of CampusFix"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Full-Height Sidebar (Never scrolls out of view) */}
      <aside
        className={cn(
          'hidden lg:flex flex-col flex-shrink-0 h-full transition-all duration-200 z-30 select-none',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer (Full height, anchored) */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 h-full flex flex-col transform transition-transform duration-200 ease-in-out lg:hidden shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
