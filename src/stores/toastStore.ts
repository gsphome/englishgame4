import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastStore {
  toasts: ToastData[];
  shownToasts: Set<string>; // Track which toasts have been shown
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  clearToastsByType: (type: ToastType) => void;
  replaceToastByType: (toast: Omit<ToastData, 'id'>) => void;
  hasShownToast: (key: string) => boolean;
  markToastAsShown: (key: string) => void;
}

export const useToastStore = create<ToastStore>()(
  (set, get) => ({
    toasts: [],
    shownToasts: new Set<string>(),

  addToast: (toastData) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const toast: ToastData = {
      id,
      duration: 4000, // Default 4 seconds
      ...toastData,
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remove if duration is set
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    const state = get();
    
    // Trigger fast close animation for all toasts
    state.toasts.forEach((toast) => {
      const closeEvent = new CustomEvent(`close-toast-${toast.id}`);
      window.dispatchEvent(closeEvent);
    });
    
    // Remove after animation
    setTimeout(() => {
      set({ toasts: [] });
    }, 150);
  },

  clearToastsByType: (type) => {
    const state = get();
    const toastsToRemove = state.toasts.filter((toast) => toast.type === type);
    
    // Trigger fast close animation for each toast
    toastsToRemove.forEach((toast) => {
      const closeEvent = new CustomEvent(`close-toast-${toast.id}`);
      window.dispatchEvent(closeEvent);
    });
    
    // Remove after animation
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.type !== type),
      }));
    }, 150);
  },

  replaceToastByType: (toastData) => {
    const { clearToastsByType, addToast } = get();
    clearToastsByType(toastData.type);
    
    // Small delay to ensure smooth transition
    setTimeout(() => {
      addToast(toastData);
    }, 100);
  },

  hasShownToast: (key) => {
    return get().shownToasts.has(key);
  },

  markToastAsShown: (key) => {
    set((state) => {
      const newSet = new Set(state.shownToasts);
      newSet.add(key);
      return { shownToasts: newSet };
    });
  },
  })
);

// Lazy-loaded toast functions to avoid initialization issues
export const toast = {
  success: (title: string, message?: string, options?: Partial<ToastData>) => {
    try {
      useToastStore.getState().addToast({
        type: 'success',
        title,
        message,
        ...options,
      });
    } catch (error) {
      console.warn('Toast store not ready:', error);
    }
  },

  error: (title: string, message?: string, options?: Partial<ToastData>) => {
    try {
      useToastStore.getState().addToast({
        type: 'error',
        title,
        message,
        duration: 6000, // Errors stay longer
        ...options,
      });
    } catch (error) {
      console.warn('Toast store not ready:', error);
    }
  },

  warning: (title: string, message?: string, options?: Partial<ToastData>) => {
    try {
      useToastStore.getState().addToast({
        type: 'warning',
        title,
        message,
        ...options,
      });
    } catch (error) {
      console.warn('Toast store not ready:', error);
    }
  },

  info: (title: string, message?: string, options?: Partial<ToastData>) => {
    try {
      useToastStore.getState().addToast({
        type: 'info',
        title,
        message,
        ...options,
      });
    } catch (error) {
      console.warn('Toast store not ready:', error);
    }
  },

  // Special toast for learning achievements
  achievement: (title: string, message?: string, points?: number) => {
    try {
      useToastStore.getState().addToast({
        type: 'success',
        title: `🎉 ${title}`,
        message: points ? `${message} (+${points} points)` : message,
        duration: 5000,
      });
    } catch (error) {
      console.warn('Toast store not ready:', error);
    }
  },

  // Toast with custom action
  withAction: (
    type: ToastType,
    title: string,
    message: string,
    actionLabel: string,
    actionCallback: () => void
  ) => {
    try {
      useToastStore.getState().addToast({
        type,
        title,
        message,
        duration: 0, // Don't auto-dismiss when there's an action
        action: {
          label: actionLabel,
          onClick: actionCallback,
        },
      });
    } catch (error) {
      console.warn('Toast store not ready:', error);
    }
  },

  // Show toast only once per session
  once: (key: string, type: ToastType, title: string, message?: string, options?: Partial<ToastData>) => {
    try {
      const store = useToastStore.getState();
      if (!store.hasShownToast(key)) {
        store.markToastAsShown(key);
        store.addToast({
          type,
          title,
          message,
          ...options,
        });
      }
    } catch (error) {
      console.warn('Toast store not ready:', error);
    }
  },

  // Replace existing toasts of the same type
  replace: (type: ToastType, title: string, message?: string, options?: Partial<ToastData>) => {
    try {
      useToastStore.getState().replaceToastByType({
        type,
        title,
        message,
        ...options,
      });
    } catch (error) {
      console.warn('Toast store not ready:', error);
    }
  },

  // Clear all toasts of a specific type
  clearType: (type: ToastType) => {
    try {
      useToastStore.getState().clearToastsByType(type);
    } catch (error) {
      console.warn('Toast store not ready:', error);
    }
  },

  // Clear all toasts immediately (for view transitions)
  clearAll: () => {
    try {
      useToastStore.getState().clearAllToasts();
    } catch (error) {
      console.warn('Toast store not ready:', error);
    }
  },

  // Clear all game-related toasts
  clearGameToasts: () => {
    try {
      const store = useToastStore.getState();
      store.clearToastsByType('success');
      store.clearToastsByType('error');
      store.clearToastsByType('warning');
    } catch (error) {
      console.warn('Toast store not ready:', error);
    }
  },
};