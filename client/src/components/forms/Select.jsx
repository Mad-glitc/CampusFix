import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import ErrorMessage from './ErrorMessage';

/**
 * Reusable Select Dropdown component demonstrating Unit I & Unit IV form patterns.
 */
export const Select = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      options = [],
      placeholder = 'Select an option',
      error,
      disabled = false,
      required = false,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const selectId = name || `select-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-xs">
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              'block w-full rounded-lg border text-sm transition-colors duration-150',
              'py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed bg-white dark:bg-slate-900/80',
              error
                ? 'border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 focus:border-rose-500 focus:ring-rose-200'
                : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-100 dark:focus:ring-indigo-950/50',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const lbl = typeof opt === 'string' ? opt : opt.label;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })}
          </select>
        </div>

        {error && <ErrorMessage error={error} />}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
