import React from 'react';
import { Sparkles, Scan, Cpu } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * AI Computer Vision Neural Scanning Loader Component
 */
export const ImageAnalysisLoader = ({ message = 'Analyzing photo with AI computer vision...', className }) => {
  return (
    <div className={cn('p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 text-center space-y-3 animate-in fade-in duration-150', className)}>
      <div className="relative w-12 h-12 mx-auto">
        <div className="absolute inset-0 rounded-2xl bg-indigo-600/20 dark:bg-indigo-500/20 animate-ping" />
        <div className="relative w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
          <Scan className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Neural Defect Classifier</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {message}
        </p>
      </div>

      {/* Progress Bar Pulse */}
      <div className="w-48 mx-auto h-1 rounded-full bg-indigo-100 dark:bg-indigo-950 overflow-hidden">
        <div className="w-full h-full bg-indigo-600 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default ImageAnalysisLoader;
