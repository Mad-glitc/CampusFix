import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import ErrorMessage from './ErrorMessage';

/**
 * Reusable Form Input component demonstrating:
 * - Unit I: Arrow functions, forwardRef, destructuring, spread operator
 * - Unit IV: Controlled components, accessible label binding, dynamic error feedback
 */
export const Input = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      disabled = false,
      required = false,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const inputId = name || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-xs">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <LeftIcon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'block w-full rounded-lg border text-sm transition-colors duration-150',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed',
              LeftIcon ? 'pl-9' : 'pl-3.5',
              RightIcon ? 'pr-9' : 'pr-3.5',
              'py-2',
              error
                ? 'border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950/40 bg-rose-50/20 dark:bg-rose-950/10'
                : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 bg-white dark:bg-slate-900/80',
              className
            )}
            {...props}
          />

          {RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <RightIcon className="w-4 h-4" />
            </div>
          )}
        </div>

        {error && <ErrorMessage error={error} />}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
