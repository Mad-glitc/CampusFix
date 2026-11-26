import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Wrench,
  Clock,
  Sparkles,
  ArrowRight,
  User,
  Building2,
  FileText,
  Mail,
  Phone,
} from 'lucide-react';
import Button from '../common/Button';
import { Spinner } from '../common/Spinner';
import Badge from '../common/Badge';
import { cn } from '../../utils/cn';
import api from '../../services/axiosInstance';
import { Link } from 'react-router-dom';

/**
 * TechnicianFeedbackModal
 * Enables Administrators to inspect student ratings, satisfaction, and feedback for any technician.
 * Displays full student identity (name, department, email, phone) to administrators.
 */
export const TechnicianFeedbackModal = ({ staff, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStarFilter, setSelectedStarFilter] = useState('all');

  useEffect(() => {
    if (isOpen && staff?._id) {
      fetchFeedback();
    }
  }, [isOpen, staff]);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/staff/${staff._id}/feedback`);
      setData(res);
    } catch (err) {
      console.error('Failed to load technician feedback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !staff) return null;

  const feedbacks = data?.feedbacks || [];
  const metrics = data?.metrics || {
    totalReviews: staff.reviewCount || 0,
    averageRating: staff.rating || 4.9,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    satisfaction: { satisfied: 0, partially_satisfied: 0, unsatisfied: 0 },
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (selectedStarFilter === 'all') return true;
    return Math.round(f.rating) === Number(selectedStarFilter);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg ring-2 ring-white/20">
              {staff.name ? staff.name.slice(0, 2).toUpperCase() : 'TC'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Technician Quality Scorecard
                </span>
                <span className="text-slate-400 text-xs">• Admin Audit View</span>
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
                {staff.name}
              </h2>
              <p className="text-xs text-slate-300">
                {staff.specialty || staff.department} • Shift: {staff.shift || 'General'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Spinner size="lg" />
              <p className="text-xs text-slate-400 font-medium">Fetching student feedback audits...</p>
            </div>
          ) : (
            <>
              {/* Top Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Score */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 block">
                      Overall Rating
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {metrics.averageRating}
                      </span>
                      <span className="text-xs text-slate-400">/ 5.0</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'w-3.5 h-3.5',
                            star <= Math.round(metrics.averageRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded-lg">
                      {metrics.totalReviews} Total Reviews
                    </span>
                  </div>
                </div>

                {/* Satisfaction */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">
                    Student Satisfaction
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {metrics.totalReviews > 0
                        ? Math.round((metrics.satisfaction.satisfied / metrics.totalReviews) * 100)
                        : 100}%
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      Satisfied Rate
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Fully Satisfied:</span>
                      <strong className="text-emerald-600">{metrics.satisfaction.satisfied}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Changes Requested:</span>
                      <strong className="text-amber-600">{metrics.satisfaction.partially_satisfied + metrics.satisfaction.unsatisfied}</strong>
                    </div>
                  </div>
                </div>

                {/* Star Distribution */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Rating Distribution
                  </span>
                  {[5, 4, 3, 2, 1].map((s) => {
                    const count = metrics.distribution[s] || 0;
                    const pct = metrics.totalReviews > 0 ? (count / metrics.totalReviews) * 100 : 0;
                    return (
                      <div key={s} className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-5 text-slate-500 font-bold flex items-center">
                          {s} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 ml-0.5" />
                        </span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-right font-mono text-[10px] text-slate-400">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 font-semibold">
                  Showing {filteredFeedbacks.length} Student Reviews:
                </span>
                <div className="flex items-center gap-1">
                  {['all', '5', '4', '3', '2', '1'].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSelectedStarFilter(star)}
                      className={cn(
                        'px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                        selectedStarFilter === star
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      )}
                    >
                      {star === 'all' ? 'All' : `${star}★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedbacks List */}
              {filteredFeedbacks.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No student reviews recorded yet
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When students report satisfaction and rate resolved tickets for {staff.name}, their reviews and audit logs will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredFeedbacks.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs space-y-3"
                    >
                      {/* Review Card Top: Student Identity & Star Rating */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {f.student?.name ? f.student.name.slice(0, 2).toUpperCase() : 'ST'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                {f.student?.name}
                              </h4>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {f.student?.registrationNumber || 'Student'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {f.student?.department} {f.student?.email && `• ${f.student.email}`}
                            </p>
                          </div>
                        </div>

                        {/* Stars & Satisfaction Pill */}
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
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                              f.isSatisfied === 'satisfied'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200'
                            )}
                          >
                            {f.isSatisfied === 'satisfied' ? 'Satisfied' : 'Requested Changes'}
                          </span>
                        </div>
                      </div>

                      {/* Comments & Changes */}
                      <div className="space-y-2 text-xs">
                        {f.comments && (
                          <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                            &quot;{f.comments}&quot;
                          </p>
                        )}

                        {f.desiredChanges && (
                          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs">
                            <span className="font-bold block text-[11px] text-amber-800 dark:text-amber-300 mb-0.5">
                              ⚠️ Student Requested Adjustments / Follow-up:
                            </span>
                            <span>{f.desiredChanges}</span>
                          </div>
                        )}
                      </div>

                      {/* Ticket Footer Link */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {f.trackingId}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{f.title}</span>
                          <span>•</span>
                          <span>{f.location}</span>
                        </div>

                        <span className="text-[10px] text-slate-400">
                          {new Date(f.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Scorecard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianFeedbackModal;
