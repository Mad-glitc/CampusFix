import React from 'react';
import { AlertCircle, ShieldAlert, Clock, Bell, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Audit Escalation History Timeline Component
 */
export const EscalationTimeline = ({ escalationHistory = [], escalationLevel = 0, className }) => {
  if (!escalationHistory || escalationHistory.length === 0) {
    return (
      <div className={cn('p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2', className)}>
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>No SLA breaches or escalations logged. Target on schedule.</span>
      </div>
    );
  }

  const getLevelBadge = (level) => {
    switch (level) {
      case 3:
        return {
          title: 'Critical Escalation Level 3',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
          icon: ShieldAlert,
        };
      case 2:
        return {
          title: 'Administrative Escalation Level 2',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
          icon: AlertCircle,
        };
      case 1:
      default:
        return {
          title: 'Technician Dispatch Alert Level 1',
          badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
          icon: Bell,
        };
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          SLA Escalation History ({escalationHistory.length})
        </h4>
        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 font-mono">
          Current Level: {escalationLevel}
        </span>
      </div>

      <div className="space-y-2.5">
        {escalationHistory.map((esc, idx) => {
          const config = getLevelBadge(esc.level);
          const Icon = config.icon;

          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border flex items-center gap-1', config.badgeClass)}>
                  <Icon className="w-3 h-3" />
                  {config.title}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(esc.escalatedAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {esc.reason}
              </p>

              {esc.notifiedRoles && esc.notifiedRoles.length > 0 && (
                <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                  <span>Notified:</span>
                  <div className="flex items-center gap-1">
                    {esc.notifiedRoles.map((role) => (
                      <span
                        key={role}
                        className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EscalationTimeline;
