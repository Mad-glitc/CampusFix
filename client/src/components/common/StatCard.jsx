import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

/**
 * Hyper-Animatic Futuristic HUD Metric Card
 * Features spring hover dynamics, neon edge glow, and light sweep animation.
 */
export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'indigo',
  isLoading = false,
  className,
}) => {
  const variantStyles = {
    indigo: {
      iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.25)]',
      glow: 'hover:border-indigo-500/60 hover:shadow-glow-indigo',
      accentGlow: 'bg-indigo-500/20',
      beam: 'from-indigo-500 via-indigo-400 to-transparent',
      pill: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    },
    blue: {
      iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
      glow: 'hover:border-cyan-500/60 hover:shadow-glow-cyan',
      accentGlow: 'bg-cyan-500/20',
      beam: 'from-cyan-500 via-cyan-400 to-transparent',
      pill: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      glow: 'hover:border-emerald-500/60 hover:shadow-glow-emerald',
      accentGlow: 'bg-emerald-500/20',
      beam: 'from-emerald-500 via-emerald-400 to-transparent',
      pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    amber: {
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      glow: 'hover:border-amber-500/60 hover:shadow-glow-amber',
      accentGlow: 'bg-amber-500/20',
      beam: 'from-amber-500 via-amber-400 to-transparent',
      pill: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    purple: {
      iconBg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
      glow: 'hover:border-purple-500/60 hover:shadow-glow-purple',
      accentGlow: 'bg-purple-500/20',
      beam: 'from-purple-500 via-purple-400 to-transparent',
      pill: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    rose: {
      iconBg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
      glow: 'hover:border-rose-500/60 hover:shadow-glow-rose',
      accentGlow: 'bg-rose-500/20',
      beam: 'from-rose-500 via-rose-400 to-transparent',
      pill: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.indigo;

  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-premium animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-2.5 w-32 bg-slate-100 dark:bg-slate-800/60 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'group relative p-5 rounded-2xl bg-white/85 dark:bg-[#111827]/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 shadow-premium transition-all duration-300 cursor-default overflow-hidden',
        currentVariant.glow,
        className
      )}
    >
      {/* Top Futuristic Laser Beam Accent */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity bg-gradient-to-r',
          currentVariant.beam
        )}
      />

      {/* Ambient background corner glow */}
      <div
        className={cn(
          'absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none',
          currentVariant.accentGlow
        )}
      />

      {/* Shimmer sweep effect across card */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none overflow-hidden">
        <div className="w-full h-full shimmer-line -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-indigo-500 transition-colors" />
            <span className="text-[11px] font-extrabold text-slate-600 dark:text-white uppercase tracking-wider font-mono">
              {title}
            </span>
          </div>

          {Icon && (
            <motion.div
              whileHover={{ rotate: 8, scale: 1.15 }}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-md',
                currentVariant.iconBg
              )}
            >
              <Icon className="w-4 h-4" />
            </motion.div>
          )}
        </div>

        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
            {value}
          </span>

          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border shadow-2xs font-mono',
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : trend.isNeutral
                  ? 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : trend.isNeutral ? (
                <Minus className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trend.value}</span>
            </span>
          )}
        </div>

        {description && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-white font-bold line-clamp-1">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
