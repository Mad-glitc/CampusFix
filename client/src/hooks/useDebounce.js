import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce values (e.g. search input).
 * Demonstrates:
 * - Unit III: Custom Hooks, useState, useEffect with timer cleanup
 * - Prevents excessive API requests during keystrokes
 *
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default: 400ms)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Effect cleanup (Unit III): Cancels timer if value or delay changes before timeout fires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
