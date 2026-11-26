import React from 'react';
import { AlertTriangle, Copy, ArrowRight, CheckCircle2 } from 'lucide-react';
import SimilarComplaintCard from './SimilarComplaintCard';
import Button from './Button';
import { cn } from '../../utils/cn';

/**
 * Duplicate Complaint Detection Panel
 * Surfaces matching unresolved tickets during complaint submission
 */
export const DuplicateComplaintPanel = ({
  duplicates = [],
  userVotedIds = [],
  onProceedAnyway,
  onVoteChange,
  className,
}) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className={cn('rounded-3xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20 p-5 shadow-premium space-y-4 animate-in fade-in duration-200', className)}>
      <div className="flex items-start justify-between gap-3 border-b border-amber-200/80 dark:border-amber-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Potential Duplicate Issues Detected ({duplicates.length})
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Similar unresolved complaints have already been logged for this facility.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 shrink-0">
          Avoid Duplicates
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        To expedite repairs, you can <strong>support an existing ticket</strong> below. Upvoted issues gain higher priority in technician dispatch. If your problem is genuinely different, you may proceed.
      </p>

      {/* List of Similar Complaints */}
      <div className="space-y-3">
        {duplicates.map((dup) => (
          <SimilarComplaintCard
            key={dup._id}
            complaint={dup}
            isVoted={userVotedIds.includes(String(dup._id))}
            onVoteChange={onVoteChange}
          />
        ))}
      </div>

      {onProceedAnyway && (
        <div className="pt-2 flex items-center justify-between border-t border-amber-200/60 dark:border-amber-900/40 text-xs">
          <span className="text-[11px] text-slate-400">
            Is your facility problem genuinely different?
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onProceedAnyway}
            rightIcon={ArrowRight}
            className="text-xs font-bold"
          >
            Proceed With New Issue
          </Button>
        </div>
      )}
    </div>
  );
};

export default DuplicateComplaintPanel;
