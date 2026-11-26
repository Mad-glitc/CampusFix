import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Activity,
  Building2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react';

/**
 * High-End Dual-Panel Enterprise Auth Layout
 * Eliminates empty space with a rich live campus telemetry showcase on the left
 * and an interactive, clean login/registration portal on the right.
 * Demonstrates Unit II Component Composition & Tailwind Design System
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col lg:flex-row text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Column: CampusFix Command Center Showcase (Full Screen on LG+) */}
      <div className="relative hidden lg:flex lg:w-7/12 xl:w-3/5 flex-col justify-between p-12 overflow-hidden border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white font-extrabold flex items-center justify-center text-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all">
              CF
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight">
                Campus<span className="text-indigo-400">Fix</span>
              </span>
              <span className="ml-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Enterprise v2.4
              </span>
            </div>
          </Link>
          <p className="mt-2 text-sm text-slate-400 max-w-md">
            Next-Generation Smart Campus Operations & Autonomous Maintenance Dispatch System.
          </p>
        </div>

        {/* Live System Telemetry Showcase (Solves empty space) */}
        <div className="relative z-10 my-8 space-y-6">
          {/* Live Status Beacon */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Campus Operational Grid: 100% Online & Active</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">
              Rapid Campus Issue Triage,
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Photo Proof & Automated SLAs.
              </span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Equipping 25,000+ students, facility managers, and specialized technicians with instant QR ticket tracking, live work status, and verified resolution workflows.
            </p>
          </div>

          {/* 3 Real-time Metric Cards */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md">
              <div className="flex items-center justify-between text-indigo-400 mb-1.5">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/50">
                  -35% YoY
                </span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">2.4 hrs</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Avg Resolution SLA</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md">
              <div className="flex items-center justify-between text-emerald-400 mb-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-800/50">
                  Verified
                </span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">98.6%</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">SLA Compliance Rate</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md">
              <div className="flex items-center justify-between text-purple-400 mb-1.5">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] font-bold text-purple-300 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-800/50">
                  Sem 2026
                </span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">1,480+</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Tickets Dispatched</div>
            </div>
          </div>

          {/* Campus Facility Zones Health Status Strip */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" /> Facility Zone Readiness
              </span>
              <span className="text-[11px] font-mono text-emerald-400">All Nodes Optimal</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="font-semibold text-white">Block C</div>
                <div className="text-[10px] text-emerald-400 font-medium">99% Ready</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="font-semibold text-white">Library</div>
                <div className="text-[10px] text-emerald-400 font-medium">100% Ready</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="font-semibold text-white">Science Lab</div>
                <div className="text-[10px] text-amber-400 font-medium">2 Active</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="font-semibold text-white">Hostels</div>
                <div className="text-[10px] text-emerald-400 font-medium">98% Ready</div>
              </div>
            </div>
          </div>
        </div>

        {/* Showcase Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> RBAC Authorization
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-purple-400" /> Real-Time Auto-Refresh
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">Enterprise Edition v2.4</span>
        </div>
      </div>

      {/* Right Column: Interactive Authentication Form Panel */}
      <div className="w-full lg:w-5/12 xl:w-2/5 flex flex-col justify-center px-6 py-12 sm:px-12 bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 relative transition-colors duration-150">
        {/* Mobile Header Logo for small screens */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xl shadow-md shadow-indigo-200 dark:shadow-none">
              CF
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Campus<span className="text-indigo-600 dark:text-indigo-400">Fix</span>
            </span>
          </Link>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Smart Campus Issue Management & Resolution Portal
          </p>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
