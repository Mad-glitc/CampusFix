import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind class names cleanly, resolving conflicts (Unit I: ES modules & rest parameters)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
