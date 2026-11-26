import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Modern Minimalist Card Component with Light & Dark Mode support
 */
export const Card = ({ children, className, hoverEffect = false, glass = false, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200 relative overflow-hidden',
        glass ? 'glass-panel' : 'bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800 shadow-premium',
        hoverEffect && 'hover:shadow-premium-hover hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, action, ...props }) => (
  <div
    className={cn(
      'px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4',
      className
    )}
    {...props}
  >
    <div className="space-y-1">{children}</div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardTitle = ({ children, className, as: Component = 'h3', ...props }) => (
  <Component
    className={cn('text-base font-bold text-slate-900 dark:text-white tracking-tight', className)}
    {...props}
  >
    {children}
  </Component>
);

export const CardDescription = ({ children, className, ...props }) => (
  <p className={cn('text-xs text-slate-500 dark:text-slate-400 leading-relaxed', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={cn('p-6 text-slate-700 dark:text-slate-300', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div
    className={cn(
      'px-6 py-4 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
