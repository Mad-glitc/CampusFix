import React from 'react';
import { Sparkles, Check, ArrowRight, Zap, ShieldAlert, Tag, Wrench } from 'lucide-react';
import Button from './Button';
import { PriorityBadge } from './Badge';
import { cn } from '../../utils/cn';

/**
 * AI Defect Classification Results Panel
 * Renders detected issue, category recommendation, and recommended actions
 */
export const AIClassificationPanel = ({
  analysis,
  onApplyRecommendations,
  className,
}) => {
  if (!analysis || !analysis.detectedIssue) return null;

  return (
    <div className={cn('p-5 rounded-2xl border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-slate-900 dark:via-[#111827] dark:to-indigo-950/30 shadow-premium space-y-4 animate-in fade-in duration-200', className)}>
      <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              AI Defect Detection
            </h4>
            <span className="text-[10px] text-slate-400">Computer Vision Inference</span>
          </div>
        </div>

        <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
          {analysis.confidence || 92}% Confidence
        </span>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-slate-500 dark:text-slate-400">Detected Failure:</div>
        <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
          {analysis.detectedIssue}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Suggested Category:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{analysis.suggestedCategory}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Suggested Priority:</span>
          <div className="pt-0.5">
            <PriorityBadge priority={analysis.suggestedPriority || 'medium'} />
          </div>
        </div>
      </div>

      {analysis.recommendedActions && analysis.recommendedActions.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Recommended Diagnostic Actions:
          </span>
          <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
            {analysis.recommendedActions.map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ul>
        </div>
      )}

      {onApplyRecommendations && (
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => onApplyRecommendations(analysis)}
          rightIcon={ArrowRight}
          className="w-full text-xs font-bold py-2 shadow-xs"
        >
          Apply AI Category & Priority Suggestions
        </Button>
      )}
    </div>
  );
};

export default AIClassificationPanel;
