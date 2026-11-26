import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Standard Loading Spinner and Full-Page Skeleton Loader
 * Demonstrates Unit II Conditional Rendering & Unit V Loading States
 */
export const Spinner = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <Loader2
      className={cn('animate-spin text-indigo-600', sizes[size] || sizes.md, className)}
    />
  );
};

export const LoadingScreen = ({ message = 'Loading CampusFix...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-3">
    <Spinner size="lg" />
    <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>
  </div>
);

export default Spinner;
