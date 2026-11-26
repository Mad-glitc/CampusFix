import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Visual SLA Resolution Timeline Progress Bar
 */
export const SLAProgressBar = ({
  createdAt,
  deadline,
  status = 'submitted',
  className,
}) => {
  if (!createdAt || !deadline) return null;

  const startMs = new Date(createdAt).getTime();
  const endMs = new Date(deadline).getTime();
  const nowMs = Date.now();

  const totalDuration = Math.max(1, endMs - startMs);
  const elapsed = Math.max(0, nowMs - startMs);
  const percent = Math.min(100, Math.round((elapsed / totalDuration) * 100));

  const isResolved = status === 'resolved';
  const isOverdue = nowMs > endMs && !isResolved;

  const barColor = isResolved
    ? 'bg-emerald-500'
    : isOverdue
      ? 'bg-rose-500 animate-pulse'
      : percent > 80
        ? 'bg-amber-500'
        : 'bg-indigo-600';

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <span>Target SLA Elapsed</span>
        <span className={cn('font-bold font-mono', isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300')}>
          {isOverdue ? '100% (Breached)' : isResolved ? 'Completed' : `${percent}%`}
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${isOverdue ? 100 : percent}%` }}
        />
      </div>
    </div>
  );
};

export default SLAProgressBar;
