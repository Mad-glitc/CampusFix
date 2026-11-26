import { create } from 'zustand';

/**
 * Global Authentication Store using Zustand.
 * Demonstrates:
 * - Unit VI: Modern lightweight global state management
 * - Persistence pattern with localStorage
 * - Clean action dispatchers without boilerplate
 */
export const useAuthStore = create((set) => {
  // Safe extraction of initial persisted state
  const storedUser = localStorage.getItem('cf_user');
  const storedToken = localStorage.getItem('cf_token');

  let initialUser = null;
  if (storedUser) {
    try {
      initialUser = JSON.parse(storedUser);
    } catch {
      localStorage.removeItem('cf_user');
    }
  }

  return {
    user: initialUser,
    token: storedToken || null,
    isAuthenticated: !!storedToken,

    // Login action
    login: (userData, token) => {
      localStorage.setItem('cf_user', JSON.stringify(userData));
      localStorage.setItem('cf_token', token);
      set({ user: userData, token, isAuthenticated: true });
    },

    // Logout action
    logout: () => {
      localStorage.removeItem('cf_user');
      localStorage.removeItem('cf_token');
      set({ user: null, token: null, isAuthenticated: false });
    },

    // Update user action
    updateUser: (updatedFields) => {
      set((state) => {
        const nextUser = { ...state.user, ...updatedFields };
        localStorage.setItem('cf_user', JSON.stringify(nextUser));
        return { user: nextUser };
      });
    },
  };
});

export default useAuthStore;
