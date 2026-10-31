/**
 * Safe LocalStorage Utility Wrapper
 * Prevents SecurityError & unhandled exceptions in restricted browsing environments
 * (e.g. Safari Private Browsing, strict iframes, cross-origin deployment, GitHub Pages).
 */

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[SafeStorage] Could not read '${key}' from localStorage:`, e);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Could not write '${key}' to localStorage:`, e);
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Could not remove '${key}' from localStorage:`, e);
    }
  },
};
