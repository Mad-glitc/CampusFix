import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import ErrorMessage from './ErrorMessage';

/**
 * Reusable Textarea component demonstrating Unit IV Controlled Component & Derived State (Character count).
 */
export const Textarea = forwardRef(
  (
    {
      label,
      name,
      value = '',
      onChange,
      onBlur,
      placeholder,
      rows = 4,
      maxLength,
      error,
      helperText,
      disabled = false,
      required = false,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const textareaId = name || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    const currentLength = value?.length || 0;

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              {label}
              {required && <span className="text-rose-500 ml-1">*</span>}
            </label>
          )}

          {maxLength && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={maxLength}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={cn(
            'block w-full rounded-lg border text-sm transition-colors duration-150',
            'p-3 focus:outline-none focus:ring-2 focus:ring-offset-0',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed bg-white dark:bg-slate-900/80 resize-y',
            error
              ? 'border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-100 dark:focus:ring-indigo-950/50',
            className
          )}
          {...props}
        />

        {error && <ErrorMessage error={error} />}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
