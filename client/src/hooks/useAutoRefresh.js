import { useEffect, useRef } from 'react';

/**
 * Custom hook to periodically execute a refresh callback.
 * Demonstrates:
 * - Unit III: Custom hooks, useRef, useEffect cleanup with clearInterval
 * - Provides background real-time synchronization feel without WebSocket complexity
 *
 * @param {Function} callback - Function to trigger periodically
 * @param {number} intervalMs - Polling interval in ms (default: 15000ms = 15s)
 * @param {boolean} enabled - Whether polling is active
 */
export function useAutoRefresh(callback, intervalMs = 15000, enabled = true) {
  const savedCallback = useRef(callback);

  // Remember latest callback without resetting the interval timer
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    const id = setInterval(tick, intervalMs);

    // Effect cleanup (Unit III): Clears interval when unmounting or when disabled
    return () => {
      clearInterval(id);
    };
  }, [intervalMs, enabled]);
}

export default useAutoRefresh;
