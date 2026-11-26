import React, { useState } from 'react';
import {
  Megaphone,
  AlertTriangle,
  Zap,
  Droplet,
  Wifi,
  Wrench,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import Button from './Button';
import { cn } from '../../utils/cn';

/**
 * Campus Announcement Card Component with Problem Resolution Support
 */
export const AnnouncementCard = ({
  announcement,
  onMarkAsRead,
  onResolve,
  onReopen,
  isAdmin = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Electricity Maintenance':
        return Zap;
      case 'Water Supply Disruption':
        return Droplet;
      case 'Wi-Fi Outage':
        return Wifi;
      case 'Building Maintenance':
        return Wrench;
      case 'Emergency Notice':
        return AlertTriangle;
      default:
        return Megaphone;
    }
  };

  const Icon = getCategoryIcon(announcement.category);
  const isResolved = announcement.isResolved || announcement.status === 'resolved';
  const isEmergency = !isResolved && (announcement.isEmergency || announcement.priority === 'emergency');

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 transition-all shadow-premium space-y-3.5',
        isResolved
          ? 'border-emerald-300/80 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/20 dark:from-emerald-950/20 dark:via-[#111827] dark:to-slate-900'
          : isEmergency
          ? 'border-rose-300 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/70 via-white to-red-50/30 dark:from-rose-950/40 dark:via-[#111827] dark:to-slate-900'
          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
              isResolved
                ? 'bg-emerald-600 text-white'
                : isEmergency
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            )}
          >
            {isResolved ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                  isResolved
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                    : isEmergency
                    ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                )}
              >
                {announcement.category}
              </span>

              {isResolved && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3" /> Problem Resolved
                </span>
              )}

              {isEmergency && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                  Emergency Notice
                </span>
              )}

              {announcement.isRead ? (
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Read
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" title="Unread" />
              )}
            </div>

            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
              {isResolved ? (
                <span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">[RESOLVED] </span>
                  {announcement.title}
                </span>
              ) : (
                announcement.title
              )}
            </h3>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400 shrink-0">
          {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {/* Content description */}
      <p
        className={cn(
          'text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium',
          !isExpanded && 'line-clamp-2'
        )}
      >
        {announcement.content}
      </p>

      {/* Resolved Confirmation Box */}
      {isResolved && (
        <div className="p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Problem Resolved & Verified
            </span>
            {announcement.resolvedAt && (
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                Resolved: {new Date(announcement.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(announcement.resolvedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
            {announcement.resolutionNote || 'Technicians have completed repairs and restored full campus operational capacity.'}
          </p>
        </div>
      )}

      {/* Metadata & Actions Bar */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          {announcement.targetLocations && announcement.targetLocations.length > 0 && (
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{announcement.targetLocations.join(', ')}</span>
            </div>
          )}

          <span>Posted by: {announcement.author?.name || 'Campus Administrator'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Read more toggle */}
          {announcement.content.length > 120 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer mr-1"
            >
              <span>{isExpanded ? 'Show less' : 'Read more'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Mark as read */}
          {!announcement.isRead && onMarkAsRead && (
            <button
              type="button"
              onClick={() => onMarkAsRead(announcement._id)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer mr-1"
            >
              Mark as read
            </button>
          )}

          {/* Admin "Mark as Resolved" / "Reopen" button */}
          {isAdmin && (
            <>
              {!isResolved && onResolve && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onResolve(announcement)}
                  leftIcon={CheckCircle2}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-xs py-1 font-bold"
                >
                  Mark as Resolved
                </Button>
              )}

              {isResolved && onReopen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReopen(announcement._id)}
                  leftIcon={RotateCcw}
                  className="text-xs py-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Reopen Issue
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;
