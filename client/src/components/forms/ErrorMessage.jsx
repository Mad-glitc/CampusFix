import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Reusable inline validation error component.
 * Demonstrates Unit IV Client-side validation dynamic error feedback.
 */
export const ErrorMessage = ({ error, className }) => {
  if (!error) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 mt-1.5 text-xs text-rose-600 font-medium animate-in fade-in slide-in-from-top-1 duration-150',
        className
      )}
      role="alert"
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{typeof error === 'string' ? error : error?.message}</span>
    </div>
  );
};

export default ErrorMessage;
