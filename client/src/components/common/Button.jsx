import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

/**
 * Hyper-Animatic Futuristic Button Component
 * Supports micro-interaction spring animations with framer-motion, glowing neon borders, and futuristic variants.
 */
export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  onClick,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden';

  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-600/30 hover:shadow-glow-indigo focus:ring-indigo-500 border border-indigo-400/30',
    secondary:
      'bg-slate-100 hover:bg-slate-200/90 text-slate-700 focus:ring-slate-400 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700/90 dark:focus:ring-slate-600 border border-slate-200 dark:border-slate-700/80',
    outline:
      'border border-slate-300/90 text-slate-700 hover:bg-slate-50 focus:ring-indigo-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/90 dark:focus:ring-indigo-400 hover:border-indigo-400',
    danger:
      'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-600/30 hover:shadow-glow-rose focus:ring-rose-500 border border-rose-400/30',
    ghost:
      'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100 dark:focus:ring-slate-600',
    success:
      'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-md shadow-emerald-600/30 hover:shadow-glow-emerald focus:ring-emerald-500 border border-emerald-400/30',
    neon:
      'bg-slate-900 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:bg-slate-800',
    cyber:
      'bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-indigo-200 border border-indigo-500/50 shadow-hud-neon hover:shadow-glow-indigo',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 tracking-tight',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 tracking-tight',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.025, y: -1 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
      )}
      <span className="relative z-10">{children}</span>
      {!isLoading && RightIcon && (
        <RightIcon className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      )}
    </motion.button>
  );
};

export default Button;
