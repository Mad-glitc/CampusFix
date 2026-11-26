import React, { useState } from 'react';
import { AlertTriangle, X, ArrowRight, Megaphone, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

/**
 * Top Campus Emergency / Resolved Issue Alert Banner
 */
export const AnnouncementBanner = ({ announcement, className }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!announcement || isDismissed) return null;

  const isResolved = announcement.isResolved || announcement.status === 'resolved';
  const isEmergency = !isResolved && (announcement.isEmergency || announcement.priority === 'emergency');

  return (
    <div
      className={cn(
        'relative rounded-2xl border p-4 shadow-premium flex items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300',
        isResolved
          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-500 shadow-emerald-500/20'
          : isEmergency
          ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white border-rose-700 shadow-rose-500/20'
          : 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white border-indigo-700 shadow-indigo-500/20',
        className
      )}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
          {isResolved ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
          )}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
              {isResolved
                ? '✅ Resolved • Normal Operations'
                : isEmergency
                ? 'Critical Campus Alert'
                : 'Active Notice'}
            </span>
            <span className="text-xs font-semibold text-white/90">
              {announcement.category}
            </span>
          </div>

          <p className="text-xs font-bold text-white line-clamp-1">
            {isResolved ? (
              <>
                <span className="underline decoration-white/60 font-black">
                  [RESOLVED] {announcement.title}:
                </span>{' '}
                <span className="font-normal text-white/90">
                  {announcement.resolutionNote || `${announcement.title} problem has been resolved.`}
                </span>
              </>
            ) : (
              <>
                {announcement.title}:{' '}
                <span className="font-normal text-white/90">{announcement.content}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/announcements"
          className="text-xs font-bold text-white hover:underline bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1.5 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
