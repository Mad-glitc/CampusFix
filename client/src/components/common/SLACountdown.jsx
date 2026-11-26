import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * SLA Target Countdown Badge
 * Visual indicator: Green (On track), Amber (Approaching deadline <2h), Red (Overdue)
 */
export const SLACountdown = ({
  deadline,
  status = 'submitted',
  isPaused = false,
  className,
  showIcon = true,
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  if (!deadline) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium text-slate-400', className)}>
        {showIcon && <Clock className="w-3.5 h-3.5" />}
        <span>Standard SLA (24h)</span>
      </span>
    );
  }

  if (status === 'resolved') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40', className)}>
        {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
        <span>Resolved</span>
      </span>
    );
  }

  if (isPaused) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700', className)}>
        <span>SLA Paused</span>
      </span>
    );
  }

  const deadlineMs = new Date(deadline).getTime();
  const diffMs = deadlineMs - now;
  const isOverdue = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

  let timeString = '';
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    timeString = `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    timeString = `${hours}h ${minutes}m`;
  } else {
    timeString = `${minutes}m`;
  }

  if (isOverdue) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-2xs animate-pulse',
          className
        )}
      >
        {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
        <span>Overdue by {timeString}</span>
      </span>
    );
  }

  // Approaching deadline: less than 2 hours remaining
  const isApproaching = diffMs < 2 * 60 * 60 * 1000;

  if (isApproaching) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 shadow-2xs',
          className
        )}
      >
        {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
        <span>Due in {timeString}</span>
      </span>
    );
  }

  // On track
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40',
        className
      )}
    >
      {showIcon && <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
      <span>{timeString} remaining</span>
    </span>
  );
};

export default SLACountdown;
