import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import {
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  FileCheck,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Send,
  Image as ImageIcon,
  CheckCheck,
  Building2,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Camera,
  Layers,
  ChevronRight,
  Zap,
  Cpu,
  Radio,
} from 'lucide-react';
import api from '../../services/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';
import StudentFeedbackCard from '../../components/common/StudentFeedbackCard';
import UpvoteButton from '../../components/common/UpvoteButton';
import SLACountdown from '../../components/common/SLACountdown';
import SLAProgressBar from '../../components/common/SLAProgressBar';
import EscalationTimeline from '../../components/common/EscalationTimeline';

export const TrackComplaintPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id') || 'CF-2026-1042';
  const [trackingInput, setTrackingInput] = useState(queryId);

  const [ticketData, setTicketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [userVoted, setUserVoted] = useState(false);

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && ticketData?.complaint?._id) {
      api.get('/complaints/my-votes')
        .then((res) => {
          setUserVoted((res.votedIds || []).includes(String(ticketData.complaint._id)));
        })
        .catch(() => {});
    }
  }, [user, ticketData?.complaint?._id]);

  const fetchTicket = async (id) => {
    if (!id || !id.trim()) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await api.get(`/complaints/track/${encodeURIComponent(id.trim().toUpperCase())}`);
      setTicketData(res);
    } catch (err) {
      setErrorMessage(err.message || 'Ticket not found. Please verify your tracking ID.');
      setTicketData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setTrackingInput(queryId);
      fetchTicket(queryId);
    }
  }, [queryId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      setSearchParams({ id: trackingInput.trim().toUpperCase() });
      fetchTicket(trackingInput.trim());
    }
  };

  const handleCopyId = () => {
    if (ticketData?.complaint?.trackingId) {
      navigator.clipboard.writeText(ticketData.complaint.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !ticketData?.complaint?._id) return;

    setIsPostingComment(true);
    try {
      const res = await api.post(`/complaints/${ticketData.complaint._id}/comments`, {
        content: newComment.trim(),
      });
      setTicketData((prev) => ({
        ...prev,
        comments: [...(prev?.comments || []), res.comment],
      }));
      setNewComment('');
    } catch (err) {
      alert(err.message || 'Failed to post comment. Ensure you are signed in.');
    } finally {
      setIsPostingComment(false);
    }
  };

  const complaint = ticketData?.complaint;
  const timeline = ticketData?.timeline || [];
  const comments = ticketData?.comments || [];

  // Determine stage progression
  const stageMap = {
    submitted: 1,
    assigned: 2,
    in_progress: 3,
    resolved: 4,
  };
  const currentStageNum = stageMap[complaint?.status] || 1;

  const stages = [
    { num: 1, title: 'Reported', desc: 'Ticket logged in campus registry' },
    { num: 2, title: 'Assigned', desc: 'Dispatched to technician' },
    { num: 3, title: 'In Progress', desc: 'Technician on-site repairing' },
    { num: 4, title: 'Resolved', desc: 'Verified with photo evidence' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 pb-12"
    >
      {/* Search Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 dark:bg-cyan-950/40 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-cyan-800/40 shadow-glow-cyan">
              ⚡ LIVE TELEMETRY AUDIT
            </span>
            <span className="text-xs text-slate-400 font-medium">Real-time SLA Timeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Campus Issue Audit &amp; Details
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track step-by-step progress, technician notes, and before-and-after photo evidence.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. CF-2026-1042"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-200 dark:border-indigo-900/60 bg-white dark:bg-[#0c1220] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 w-48 sm:w-60 shadow-hud-indigo"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading} className="font-bold text-xs py-2 shadow-glow-indigo">
            Audit
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-[#0c1220] rounded-3xl border border-slate-200 dark:border-indigo-900/60 shadow-hud-indigo">
          <Spinner size="lg" />
          <p className="text-xs text-cyan-400 font-mono animate-pulse">Querying campus telemetry registry logs...</p>
        </div>
      ) : errorMessage ? (
        <div className="p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">{errorMessage}</h3>
          <p className="text-xs text-rose-600 dark:text-rose-300 max-w-md mx-auto">
            Try searching for demo ticket <strong className="font-mono">CF-2026-1042</strong> or log a new issue from the student dashboard.
          </p>
        </div>
      ) : complaint ? (
        <div className="space-y-6">
          {/* Deep Navy Futuristic Ticket Header Ribbon */}
          <div className="relative overflow-hidden rounded-3xl bg-[#090d16] text-white p-6 sm:p-8 border border-indigo-900/50 shadow-hud-indigo space-y-4">
            {/* Animated Cyber Glow Orbs & Grid */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                x: [0, 20, 0],
                y: [0, -15, 0],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                x: [0, -20, 0],
                y: [0, 20, 0],
              }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-0 right-1/3 -mb-16 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
            />
            <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
            <div className="shimmer-line absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none" />

            {/* HUD Corner Tech Brackets */}
            <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-indigo-500/60 pointer-events-none" />
            <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-500/60 pointer-events-none" />
            <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-indigo-500/60 pointer-events-none" />
            <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500/60 pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl sm:text-2xl font-black text-cyan-400">
                  {complaint.trackingId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 inline-flex items-center gap-1 border border-slate-700 cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <UpvoteButton
                  complaintId={complaint._id}
                  initialCount={complaint.upvoteCount || 0}
                  initialVoted={userVoted}
                  onVoteChange={(newVoted, newCount) => {
                    setUserVoted(newVoted);
                    setTicketData((prev) => ({
                      ...prev,
                      complaint: { ...prev.complaint, upvoteCount: newCount },
                    }));
                  }}
                />
                <SLACountdown deadline={complaint.slaDeadline} status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            <div className="relative z-10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                {complaint.category?.name || 'Facility Repair'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {complaint.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Permission-Aware Quick Action Toolbar */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Logged on: {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied' : 'Share Link'}</span>
                </button>

                {user?.role === 'admin' && (
                  <Link to="/admin/complaints">
                    <Button variant="primary" size="sm" rightIcon={ArrowRight} className="font-bold text-xs py-1.5 bg-indigo-600 hover:bg-indigo-500">
                      Triage in Admin Console
                    </Button>
                  </Link>
                )}

                {user?.role === 'staff' && (
                  <Link to="/staff/queue">
                    <Button variant="primary" size="sm" rightIcon={Wrench} className="font-bold text-xs py-1.5 bg-amber-600 hover:bg-amber-500">
                      Open Work Queue
                    </Button>
                  </Link>
                )}

                {(!user || user.role === 'student') && (
                  <Link to={`/student/report?cat=${complaint.category?._id || ''}&title=${encodeURIComponent('Follow-up on ' + complaint.title)}`}>
                    <Button variant="secondary" size="sm" leftIcon={Sparkles} className="text-xs py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
                      Report Related Issue
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* 4-Stage Vertical / Horizontal Progress Timeline */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-indigo-950/60 bg-white dark:bg-[#0c1220] p-6 shadow-hud-indigo space-y-4 relative overflow-hidden">
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500/50 pointer-events-none" />

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                Service Resolution Lifecycle
              </h3>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40 font-bold">
                Stage {currentStageNum} of 4
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              {stages.map((st) => {
                const isPassed = currentStageNum >= st.num;
                const isCurrent = currentStageNum === st.num;

                return (
                  <motion.div
                    key={st.num}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      'p-3.5 rounded-2xl border transition-all text-left space-y-1.5 relative overflow-hidden',
                      isCurrent
                        ? 'border-cyan-500 dark:border-cyan-400 bg-cyan-50/40 dark:bg-cyan-950/30 ring-2 ring-cyan-500/20 shadow-glow-cyan'
                        : isPassed
                        ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-60'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs',
                          isCurrent
                            ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan font-black'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        )}
                      >
                        {isPassed ? <Check className="w-3.5 h-3.5" /> : st.num}
                      </div>
                      <span className="text-[10px] font-mono font-semibold uppercase text-slate-400">
                        Step 0{st.num}
                      </span>
                    </div>

                    <div>
                      <h4
                        className={cn(
                          'text-xs font-bold',
                          isCurrent ? 'text-cyan-400' : isPassed ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                        )}
                      >
                        {st.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">{st.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* SLA Resolution Deadline Progress Bar */}
            {complaint.slaDeadline && complaint.status !== 'resolved' && complaint.status !== 'closed' && (
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
                <SLAProgressBar
                  deadline={complaint.slaDeadline}
                  createdAt={complaint.createdAt}
                  status={complaint.status}
                  isOverdue={complaint.isOverdue}
                />
              </div>
            )}
          </div>

          {/* 2-Column Responsive Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Photos, Resolution Record, Comments */}
            <div className="lg:col-span-8 space-y-6">
              {/* Photo Evidence Gallery (Before & After) */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-premium space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Photographic Audit Gallery
                  </h3>
                  <span className="text-xs text-slate-400">Before & After Repair</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Initial Proof Photo */}
                  <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Initial Student Photo Evidence:
                    </span>
                    {complaint.images && complaint.images.length > 0 ? (
                      <a
                        href={complaint.images[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-95 transition-opacity"
                      >
                        <img
                          src={complaint.images[0].url}
                          alt="Initial student evidence"
                          className="w-full h-44 object-cover"
                        />
                      </a>
                    ) : (
                      <div className="h-44 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col items-center justify-center text-xs text-slate-400">
                        <ImageIcon className="w-6 h-6 mb-1 text-slate-300 dark:text-slate-600" />
                        No photo provided
                      </div>
                    )}
                  </div>

                  {/* Resolution Proof Photo */}
                  <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                      Technician Completion Proof:
                    </span>
                    {complaint.status === 'resolved' && complaint.images && complaint.images.length > 1 ? (
                      <a
                        href={complaint.images[complaint.images.length - 1].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-800 hover:opacity-95 transition-opacity"
                      >
                        <img
                          src={complaint.images[complaint.images.length - 1].url}
                          alt="Resolution proof"
                          className="w-full h-44 object-cover"
                        />
                      </a>
                    ) : (
                      <div className="h-44 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col items-center justify-center text-xs text-slate-400">
                        <CheckCheck className="w-6 h-6 mb-1 text-slate-300 dark:text-slate-600" />
                        {complaint.status === 'resolved' ? 'Resolved without completion photo' : 'Awaiting technician resolution photo'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Verified Resolution Record Banner */}
              {complaint.status === 'resolved' && (
                <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/80 to-teal-50/30 dark:from-emerald-950/40 dark:to-teal-950/20 p-6 shadow-premium space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Verified Resolution Record & Closure Remarks</span>
                  </div>
                  <p className="pl-7 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed">
                    &quot;{complaint.resolutionRemarks || 'All repair tasks completed and tested in accordance with university facility protocols.'}&quot;
                  </p>
                  {complaint.resolvedAt && (
                    <span className="pl-7 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 block">
                      Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Vertical Progress Timeline: Reported → Assigned → In Progress → Resolved */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-premium space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Incident Resolution Audit Trail
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      Sequential verification pipeline: Reported → Assigned → In Progress → Resolved
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                    Stage {currentStageNum}/4
                  </span>
                </div>

                <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {stages.map((st) => {
                    const isPassed = currentStageNum >= st.num;
                    const isCurrent = currentStageNum === st.num;
                    return (
                      <div key={st.num} className="relative flex items-start gap-4">
                        <div
                          className={cn(
                            'absolute -left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-[#111827] transition-all',
                            isCurrent
                              ? 'bg-indigo-600 text-white shadow-glow-indigo animate-pulse'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          )}
                        >
                          {isPassed ? <Check className="w-3.5 h-3.5" /> : st.num}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4
                              className={cn(
                                'text-xs font-bold',
                                isCurrent
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : isPassed
                                  ? 'text-slate-900 dark:text-white'
                                  : 'text-slate-400'
                              )}
                            >
                              {st.title}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400">
                              {st.num === 1 && complaint.createdAt
                                ? new Date(complaint.createdAt).toLocaleDateString()
                                : st.num === 4 && complaint.resolvedAt
                                ? new Date(complaint.resolvedAt).toLocaleDateString()
                                : isPassed
                                ? 'Verified'
                                : 'Pending'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{st.desc}</p>
                          {st.num === 2 && complaint.assignedStaff && (
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                              Assigned to: {complaint.assignedStaff.name} ({complaint.assignedStaff.department})
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Student Satisfaction & Desired Changes Feedback (For Students Only) */}
              <StudentFeedbackCard
                complaint={complaint}
                currentUser={user}
                onFeedbackUpdated={(updatedFeedback, updatedComplaint) => {
                  setTicketData((prev) => ({
                    ...prev,
                    complaint: {
                      ...prev.complaint,
                      feedback: updatedFeedback,
                    },
                  }));
                }}
              />

              {/* Real-time Discussion Stream & Comments */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-premium space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Issue Discussion Stream ({comments.length})
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Direct Dialogue</span>
                </div>

                {/* Comment list */}
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                      No comments yet. Have a question? Leave a remark below.
                    </div>
                  ) : (
                    comments.map((cm) => (
                      <div key={cm._id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{cm.author?.name || 'Campus Member'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{cm.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment or follow-up note..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isPostingComment}
                    leftIcon={Send}
                    className="font-bold text-xs"
                  >
                    Post
                  </Button>
                </form>
              </div>
            </div>

            {/* Right 4 Cols: Location, Staff, Reporter metadata */}
            <div className="lg:col-span-4 space-y-6">
              {/* Location Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-premium space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Facility Location
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{complaint.location?.building}</div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Room: <strong>{complaint.location?.room}</strong> ({complaint.location?.floor})
                  </p>
                  {complaint.location?.landmark && (
                    <p className="text-[11px] text-slate-400 italic">Ref: {complaint.location.landmark}</p>
                  )}
                </div>
              </div>

              {/* Assigned Staff Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-premium space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Assigned Maintenance Staff
                </h3>
                {complaint.assignedStaff ? (
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{complaint.assignedStaff.name}</p>
                    <p className="text-slate-500 dark:text-slate-400">{complaint.assignedStaff.department}</p>
                    <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">{complaint.assignedStaff.email}</p>
                  </div>
                ) : (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold italic">
                    Awaiting admin dispatch to technician.
                  </p>
                )}
              </div>

              {/* Reporter Info Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-premium space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Reported By
                </h3>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{complaint.student?.name || 'Student'}</p>
                  <p className="text-slate-500 dark:text-slate-400">{complaint.student?.department || 'Computer Science'}</p>
                  <p className="text-[10px] font-mono text-slate-400">{complaint.student?.email}</p>
                </div>
              </div>

              {/* Automatic SLA Escalation History Timeline */}
              {complaint.escalationHistory && complaint.escalationHistory.length > 0 && (
                <EscalationTimeline
                  escalationHistory={complaint.escalationHistory}
                  escalationLevel={complaint.escalationLevel}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
};

export default TrackComplaintPage;
