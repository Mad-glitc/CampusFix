import React from 'react';
import { ExternalLink, MapPin, Layers, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './Badge';
import UpvoteButton from './UpvoteButton';
import { cn } from '../../utils/cn';

/**
 * Similar Complaint Card for Duplicate Detection Workflow
 */
export const SimilarComplaintCard = ({
  complaint,
  isVoted = false,
  onVoteChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-4 rounded-2xl border border-amber-200/90 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 dark:from-[#111827] dark:via-slate-900 dark:to-amber-950/20 shadow-2xs space-y-3 transition-all',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {complaint.trackingId}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
              {complaint.similarityScore}% Match
            </span>
          </div>

          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
            {complaint.title}
          </h4>
        </div>

        <StatusBadge status={complaint.status} size="sm" />
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span className="truncate">
          {complaint.location?.building} • Room {complaint.location?.room}
        </span>
      </div>

      {complaint.matchReasons && complaint.matchReasons.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {complaint.matchReasons.map((reason, i) => (
            <span
              key={i}
              className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
            >
              ✓ {reason}
            </span>
          ))}
        </div>
      )}

      {/* Action Row */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <UpvoteButton
          complaintId={complaint._id}
          initialCount={complaint.upvoteCount || 0}
          initialVoted={isVoted}
          onVoteChange={onVoteChange}
          size="sm"
        />

        <a
          href={`/track?id=${complaint.trackingId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          <span>View Ticket Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default SimilarComplaintCard;
