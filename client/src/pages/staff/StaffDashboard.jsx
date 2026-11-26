import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from '../../components/common/StatCard';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  MapPin,
  PlayCircle,
  Image as ImageIcon,
  Sparkles,
  PhoneCall,
  CheckSquare,
  Shield,
  Layers,
  ChevronRight,
  Calendar,
  Star,
  Lock,
  MessageSquare,
  ThumbsUp,
  ShieldAlert,
  Radio,
  Cpu,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/axiosInstance';
import { cn } from '../../utils/cn';

export const StaffDashboard = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/staff/queue');
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to load staff queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setIsLoadingFeedback(true);
    try {
      const res = await api.get('/staff/feedback');
      setFeedbackData(res);
    } catch (err) {
      console.error('Failed to load technician feedback:', err);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchFeedback();
  }, []);

  const assignedCount = tasks.filter((t) => t.status === 'assigned').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tasks.filter((t) => t.status === 'resolved').length;
  const nextTask = tasks.find((t) => t.status === 'assigned' || t.status === 'in_progress');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 pb-12"
    >
      {/* 1. Futuristic Technician Shift Ribbon */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0d121f] text-white p-6 sm:p-8 border border-amber-500/30 shadow-hud-amber">
        {/* Animated Cyber Glow Orbs & Grid */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 right-1/3 -mb-16 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"
        />
        <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
        <div className="shimmer-line absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent pointer-events-none" />

        {/* HUD Corner Tech Brackets */}
        <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-500/60 pointer-events-none" />
        <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-500/60 pointer-events-none" />
        <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-500/60 pointer-events-none" />
        <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500/60 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] border border-amber-500/40 shadow-glow-amber">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <span>⚡ FIELD DISPATCH TELEMETRY ACTIVE</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 font-mono text-[11px]">
                <Cpu className="w-3.5 h-3.5 text-amber-400" /> SHIFT: ACTIVE
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {todayFormatted}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.name || 'Technician'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Assigned to active campus maintenance dispatch. Review priority work orders, record on-site repair progress, and upload photo verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchQueue}
              leftIcon={RefreshCw}
              isLoading={isLoading}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80"
            >
              Sync Work
            </Button>
            <Link to="/staff/queue">
              <Button
                variant="primary"
                size="sm"
                rightIcon={ArrowRight}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold shadow-glow-amber"
              >
                Work Queue ({tasks.length})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Five Premium StatCards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Assigned"
          value={isLoading ? '-' : tasks.length}
          description="Assigned work orders"
          icon={Layers}
          variant="indigo"
          trend={{ value: 'Fleet Active', isNeutral: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Start"
          value={isLoading ? '-' : assignedCount}
          description="Awaiting arrival on-site"
          icon={Clock}
          variant="rose"
          trend={{ value: assignedCount > 0 ? 'Action Req.' : 'Clear', isNeutral: assignedCount === 0 }}
          isLoading={isLoading}
        />
        <StatCard
          title="In Progress"
          value={isLoading ? '-' : inProgressCount}
          description="Active repair orders"
          icon={Wrench}
          variant="amber"
          trend={{ value: 'In Triage', isNeutral: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Completed Tasks"
          value={isLoading ? '-' : resolvedCount}
          description="Verified with photo evidence"
          icon={CheckCircle2}
          variant="emerald"
          trend={{ value: '+100%', isPositive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="SLA Met Rate"
          value={isLoading ? '-' : `${tasks.length > 0 ? Math.round((resolvedCount / tasks.length) * 100) : 100}%`}
          description="Zero turnaround breaches"
          icon={Shield}
          variant="blue"
          trend={{ value: 'Optimal', isPositive: true }}
          isLoading={isLoading}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* 3. 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Priority Spotlight & Active Queue */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Priority Spotlight Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-premium space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                  Priority Dispatch Focus
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Immediate Assigned Task in Schedule
                </h3>
              </div>
              <Link to="/staff/queue" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                View all tasks
              </Link>
            </div>

            {isLoading ? (
              <div className="py-12 flex justify-center">
                <Spinner size="md" />
              </div>
            ) : !nextTask ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">All Scheduled Work Completed</p>
                <p className="text-slate-400">Great job! There are no pending maintenance tasks assigned to you right now.</p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-amber-50/20 dark:from-slate-900/80 dark:to-amber-950/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {nextTask.trackingId}
                    </span>
                    <PriorityBadge priority={nextTask.priority} />
                    <StatusBadge status={nextTask.status} />
                  </div>
                  <span className="text-xs text-slate-400">
                    Category: <strong className="text-slate-700 dark:text-slate-300">{nextTask.category?.name}</strong>
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{nextTask.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {nextTask.description}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>
                      {nextTask.location?.building} • Room {nextTask.location?.room} ({nextTask.location?.floor})
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    Reported by: {nextTask.student?.name}
                  </span>
                </div>

                {nextTask.images && nextTask.images.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    <ImageIcon className="w-4 h-4" />
                    <a
                      href={nextTask.images[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      View Student Photographic Evidence
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <Link to="/staff/queue">
                    <Button variant="primary" size="sm" rightIcon={ArrowRight} className="font-bold text-xs py-2">
                      {nextTask.status === 'assigned' ? 'Commence Work On-Site' : 'Upload Proof & Resolve'}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Queue List Preview */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-premium space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              All Assigned Tickets Overview
            </h3>
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No tickets in your active list.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.slice(0, 4).map((t) => (
                  <div key={t._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{t.trackingId}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{t.title}</p>
                      <p className="text-[11px] text-slate-400">{t.location?.building} • {t.location?.room}</p>
                    </div>
                    <Link to="/staff/queue">
                      <Button variant="ghost" size="sm" rightIcon={ChevronRight} className="text-xs">
                        Action
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Standard Repair Protocols & Hotline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Repair Protocol Checklist */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-premium space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Field Repair Protocol
            </h3>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <span>Verify location and click &quot;Mark In Progress&quot; on arrival.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <span>Isolate electrical and mechanical hazards before commencing work.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <span>Execute repair and test output with lab faculty or student.</span>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                <span>Capture completion photo evidence and input detailed resolution remarks.</span>
              </div>
            </div>
          </div>

          {/* Central Maintenance Hotline */}
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 text-white shadow-premium space-y-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              Maintenance Storeroom
            </div>
            <h4 className="text-sm font-bold text-white">Need Additional Tools or Spares?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Contact the central maintenance storeroom for HDMI splitters, circuit breakers, or plumbing gaskets.
            </p>
            <div className="pt-1">
              <div className="font-mono text-xs font-bold text-amber-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 inline-block">
                Ext: 4402 (Central Maintenance)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Student Satisfaction & Star Ratings (Anonymous to Technician) */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-premium space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                Technician Performance Score
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700">
                <Lock className="w-3 h-3 text-slate-500" />
                Anonymous Student Feedback
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Student Reviews & Star Ratings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Feedback submitted by students upon ticket resolution. Ratings and comments help maintain campus quality, while individual student identities remain strictly confidential.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 px-4 py-3 rounded-2xl shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {feedbackData?.metrics?.averageRating || user?.rating || 4.9}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <div className="border-l border-amber-200 dark:border-amber-800 pl-3 space-y-0.5">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-3.5 h-3.5',
                      star <= Math.round(feedbackData?.metrics?.averageRating || user?.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    )}
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                {feedbackData?.metrics?.totalReviews || 0} Student Reviews
              </span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {isLoadingFeedback ? (
          <div className="py-12 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : !feedbackData?.feedbacks || feedbackData.feedbacks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No student reviews recorded yet</p>
            <p className="text-slate-400">
              When students rate your completed maintenance work, their satisfaction stars and suggestions will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbackData.feedbacks.map((f, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl border border-slate-200/90 dark:border-amber-950/60 bg-slate-50/60 dark:bg-[#0c1220] shadow-hud-amber space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            'w-3.5 h-3.5',
                            s <= (f.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {f.rating}/5
                    </span>
                  </div>

                  {/* Student anonymity badge */}
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-500 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                    <Lock className="w-3 h-3 text-amber-500" />
                    [ANONYMOUS STUDENT]
                  </span>
                </div>

                {f.comments && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    &quot;{f.comments}&quot;
                  </p>
                )}

                {f.desiredChanges && (
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300">
                    <strong>Student Suggestion:</strong> {f.desiredChanges}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="font-mono font-bold text-indigo-600 dark:text-cyan-400">
                    Ticket: {f.trackingId}
                  </span>
                  <span>
                    {new Date(f.submittedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StaffDashboard;
