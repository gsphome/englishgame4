import { useState, useEffect } from 'react';

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
  shownToasts: Set<string>;
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  clearToastsByType: (type: ToastType) => void;
  replaceToastByType: (toast: Omit<ToastData, 'id'>) => void;
  showSingleToast: (toast: Omit<ToastData, 'id'>) => void;
  hasShownToast: (key: string) => boolean;
  markToastAsShown: (key: string) => void;
}

// Global state
const globalState = {
  toasts: [] as ToastData[],
  shownToasts: new Set<string>(),
  listeners: new Set<() => void>(),
};

// Reset function for tests
export const resetToastStore = () => {
  globalState.toasts = [];
  globalState.shownToasts.clear();
};

// Store implementation
const toastStore = {
  getState() {
    return globalState;
  },

  setState(newState: Partial<typeof globalState>) {
    Object.assign(globalState, newState);
    globalState.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.warn('Toast listener error:', e);
      }
    });
  },

  subscribe(listener: () => void) {
    globalState.listeners.add(listener);
    return () => {
      globalState.listeners.delete(listener);
    };
  },

  addToast(toast: Omit<ToastData, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newToast: ToastData = {
      id,
      duration: 4000,
      ...toast,
    };

    const currentToasts = globalState.toasts;
    let updatedToasts = [...currentToasts, newToast];

    if (updatedToasts.length > 2) {
      updatedToasts = updatedToasts.slice(-2);
    }

    this.setState({
      toasts: updatedToasts,
    });

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, newToast.duration);
    }
  },

  removeToast(id: string) {
    this.setState({
      toasts: globalState.toasts.filter((toast) => toast.id !== id),
    });
  },

  clearAllToasts(immediate = false) {
    if (immediate) {
      this.setState({ toasts: [] });
      return;
    }

    const toastsToRemove = [...globalState.toasts];

    // Trigger fast close animation for all existing toasts
    toastsToRemove.forEach((toast) => {
      const closeEvent = new CustomEvent(`close-toast-${toast.id}`);
      window.dispatchEvent(closeEvent);
    });

    // Clear the state after animation time
    setTimeout(() => {
      this.setState({ toasts: [] });
    }, 200);
  },

  clearToastsByType(type: ToastType) {
    const toastsToRemove = globalState.toasts.filter((toast) => toast.type === type);

    this.setState({
      toasts: globalState.toasts.filter((toast) => toast.type !== type),
    });

    // Trigger fast close animation for existing toasts of this type
    toastsToRemove.forEach((toast) => {
      const closeEvent = new CustomEvent(`close-toast-${toast.id}`);
      window.dispatchEvent(closeEvent);
    });
  },

  replaceToastByType(toast: Omit<ToastData, 'id'>) {
    this.clearToastsByType(toast.type);
    setTimeout(() => {
      this.addToast(toast);
    }, 100);
  },

  showSingleToast(toast: Omit<ToastData, 'id'>) {
    this.clearAllToasts(true);
    this.addToast(toast);
  },

  hasShownToast(key: string) {
    return globalState.shownToasts.has(key);
  },

  markToastAsShown(key: string) {
    globalState.shownToasts.add(key);
  }
};

// React hook
export const useToastStore = (): ToastStore => {
  const [state, setState] = useState(() => toastStore.getState());

  useEffect(() => {
    const unsubscribe = toastStore.subscribe(() => {
      const newState = toastStore.getState();
      setState(newState);
    });

    return unsubscribe;
  }, []);

  return {
    ...state,
    addToast: toastStore.addToast.bind(toastStore),
    removeToast: toastStore.removeToast.bind(toastStore),
    clearAllToasts: toastStore.clearAllToasts.bind(toastStore),
    clearToastsByType: toastStore.clearToastsByType.bind(toastStore),
    replaceToastByType: toastStore.replaceToastByType.bind(toastStore),
    showSingleToast: toastStore.showSingleToast.bind(toastStore),
    hasShownToast: toastStore.hasShownToast.bind(toastStore),
    markToastAsShown: toastStore.markToastAsShown.bind(toastStore),
  };
};

// Toast utility functions
export const toast = {
  success(title: string, message?: string, options?: Partial<ToastData>) {
    const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
    setTimeout(() => {
      try {
        toastStore.addToast({ type: 'success', title, message, ...options });
      } catch (e) { console.warn('Toast not ready:', e); }
    }, delay);
  },

  error(title: string, message?: string, options?: Partial<ToastData>) {
    const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
    setTimeout(() => {
      try {
        toastStore.addToast({ type: 'error', title, message, duration: 6000, ...options });
      } catch (e) { console.warn('Toast not ready:', e); }
    }, delay);
  },

  warning(title: string, message?: string, options?: Partial<ToastData>) {
    const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
    setTimeout(() => {
      try {
        toastStore.addToast({ type: 'warning', title, message, ...options });
      } catch (e) { console.warn('Toast not ready:', e); }
    }, delay);
  },

  info(title: string, message?: string, options?: Partial<ToastData>) {
    const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
    setTimeout(() => {
      try {
        toastStore.addToast({ type: 'info', title, message, ...options });
      } catch (e) { console.warn('Toast not ready:', e); }
    }, delay);
  },

  achievement(title: string, message?: string, points?: number) {
    const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
    setTimeout(() => {
      try {
        toastStore.addToast({
          type: 'success',
          title: `🎉 ${title}`,
          message: points ? `${message} (+${points} points)` : message,
          duration: 5000,
        });
      } catch (e) { console.warn('Toast not ready:', e); }
    }, delay);
  },

  once(key: string, type: ToastType, title: string, message?: string, options?: Partial<ToastData>) {
    const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
    setTimeout(() => {
      try {
        if (!toastStore.hasShownToast(key)) {
          toastStore.markToastAsShown(key);
          toastStore.addToast({ type, title, message, ...options });
        }
      } catch (e) { console.warn('Toast not ready:', e); }
    }, delay);
  },

  replace(type: ToastType, title: string, message?: string, options?: Partial<ToastData>) {
    const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
    setTimeout(() => {
      try {
        toastStore.replaceToastByType({ type, title, message, ...options });
      } catch (e) { console.warn('Toast not ready:', e); }
    }, delay);
  },

  clearType(type: ToastType) {
    const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
    setTimeout(() => {
      try {
        toastStore.clearToastsByType(type);
      } catch (e) { console.warn('Toast not ready:', e); }
    }, delay);
  },

  clearAll() {
    const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
    setTimeout(() => {
      try {
        toastStore.clearAllToasts();
      } catch (e) { console.warn('Toast not ready:', e); }
    }, delay);
  },

  clearGameToasts() {
    const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
    setTimeout(() => {
      try {
        toastStore.clearToastsByType('success');
        toastStore.clearToastsByType('error');
        toastStore.clearToastsByType('warning');
      } catch (e) { console.warn('Toast not ready:', e); }
    }, delay);
  },

  // Single toast functions
  single: {
    success(title: string, message?: string, options?: Partial<ToastData>) {
      const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
      setTimeout(() => {
        try {
          toastStore.showSingleToast({ type: 'success', title, message, ...options });
        } catch (e) { console.warn('Toast not ready:', e); }
      }, delay);
    },

    error(title: string, message?: string, options?: Partial<ToastData>) {
      const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
      setTimeout(() => {
        try {
          toastStore.showSingleToast({ type: 'error', title, message, duration: 6000, ...options });
        } catch (e) { console.warn('Toast not ready:', e); }
      }, delay);
    },

    warning(title: string, message?: string, options?: Partial<ToastData>) {
      const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
      setTimeout(() => {
        try {
          toastStore.showSingleToast({ type: 'warning', title, message, ...options });
        } catch (e) { console.warn('Toast not ready:', e); }
      }, delay);
    },

    info(title: string, message?: string, options?: Partial<ToastData>) {
      const delay = process.env.NODE_ENV === 'test' ? 0 : 0;
      setTimeout(() => {
        try {
          toastStore.showSingleToast({ type: 'info', title, message, ...options });
        } catch (e) { console.warn('Toast not ready:', e); }
      }, delay);
    }
  }
};