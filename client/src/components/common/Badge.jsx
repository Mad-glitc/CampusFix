import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Modern Minimalist Badge Component with Light & Dark Mode support
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  withDot = false,
  withPing = false,
  className,
}) => {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700',
    primary: 'bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/50',
    info: 'bg-sky-50/90 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/50',
    success: 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50',
    warning: 'bg-amber-50/90 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50',
    danger: 'bg-rose-50/90 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/50',
    purple: 'bg-purple-50/90 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/50',
  };

  const dotColors = {
    default: 'bg-slate-400 dark:bg-slate-500',
    primary: 'bg-indigo-500',
    info: 'bg-sky-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    purple: 'bg-purple-500',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 tracking-tight',
    md: 'text-xs px-2.5 py-0.5 tracking-tight',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border transition-all duration-150',
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
    >
      {withDot && (
        <span className="relative flex h-2 w-2 mr-1.5 shrink-0">
          {withPing && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant] || dotColors.default
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              dotColors[variant] || dotColors.default
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, className }) => {
  const config = {
    submitted: { label: 'Submitted', variant: 'info', withPing: false },
    assigned: { label: 'Assigned', variant: 'purple', withPing: false },
    in_progress: { label: 'In Progress', variant: 'warning', withPing: true },
    resolved: { label: 'Resolved', variant: 'success', withPing: false },
    rejected: { label: 'Rejected', variant: 'danger', withPing: false },
  };

  const item = config[status] || { label: status, variant: 'default', withPing: false };

  return (
    <Badge
      variant={item.variant}
      withDot
      withPing={item.withPing}
      className={cn('font-medium', className)}
    >
      {item.label}
    </Badge>
  );
};

export const PriorityBadge = ({ priority, className }) => {
  const config = {
    low: { label: 'Low', variant: 'default' },
    medium: { label: 'Medium', variant: 'info' },
    high: { label: 'High', variant: 'warning' },
    urgent: { label: 'Urgent', variant: 'danger' },
  };

  const item = config[priority] || { label: priority, variant: 'default' };

  return (
    <Badge variant={item.variant} className={cn('capitalize font-medium', className)}>
      {item.label}
    </Badge>
  );
};

export default Badge;
