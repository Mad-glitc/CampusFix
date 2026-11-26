import { create } from 'zustand';

/**
 * Toast Notification Store using Zustand.
 * Demonstrates Unit VI: Global UI State & dynamic micro-interactions.
 */
export const useToastStore = create((set) => ({
  toasts: [],

  /**
   * Add a toast notification
   * @param {Object} toast - { id, type: 'success'|'error'|'info'|'warning', title, message, duration }
   */
  addToast: ({ type = 'info', title, message, duration = 4000 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { id, type, title, message };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  success: (message, title = 'Success') =>
    useToastStore.getState().addToast({ type: 'success', title, message }),
  error: (message, title = 'Error') =>
    useToastStore.getState().addToast({ type: 'error', title, message }),
  info: (message, title = 'Notice') =>
    useToastStore.getState().addToast({ type: 'info', title, message }),
  warning: (message, title = 'Warning') =>
    useToastStore.getState().addToast({ type: 'warning', title, message }),
};

export default useToastStore;
