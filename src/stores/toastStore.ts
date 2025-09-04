import React from 'react';

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

// Ultra-simple global state to avoid initialization issues
const globalState = {
  toasts: [] as ToastData[],
  shownToasts: new Set<string>(),
  listeners: new Set<() => void>(),
};

// Simple store implementation
const toastStore = {

  getState() {
    return globalState;
  },

  setState(newState: Partial<typeof globalState>) {
    Object.assign(globalState, newState);
    globalState.listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.warn('Toast listener error:', e);
      }
    });
  },

  subscribe(listener: () => void) {
    globalState.listeners.add(listener);
    return () => globalState.listeners.delete(listener);
  },

  addToast(toast: Omit<ToastData, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newToast: ToastData = {
      id,
      duration: 4000, // Default duration
      ...toast,
    };

    // For better UX, limit the number of toasts visible at once
    // Keep only the most recent toasts (max 2 at a time)
    const currentToasts = globalState.toasts;
    let updatedToasts = [...currentToasts, newToast];
    
    // If we have more than 2 toasts, remove the oldest ones
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

  clearAllToasts() {
    this.setState({ toasts: [] });
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
    // Remove existing toasts of the same type
    this.clearToastsByType(toast.type);
    // Add the new toast
    setTimeout(() => {
      this.addToast(toast);
    }, 100); // Small delay to ensure cleanup is complete
  },

  // New method: Show only one toast at a time (clear all others)
  showSingleToast(toast: Omit<ToastData, 'id'>) {
    // Clear all existing toasts first
    this.clearAllToasts();
    // Add the new toast after a small delay
    setTimeout(() => {
      this.addToast(toast);
    }, 150); // Small delay to ensure cleanup animation completes
  },

  hasShownToast(key: string) {
    return globalState.shownToasts.has(key);
  },

  markToastAsShown(key: string) {
    globalState.shownToasts.add(key);
    // No need to trigger setState for this
  }
};

// Create store instance with safe initialization
let toastStoreInstance: typeof toastStore;

try {
  toastStoreInstance = toastStore;
} catch (error) {
  console.warn('Toast store initialization failed, creating fallback:', error);
  // Fallback implementation
  toastStoreInstance = {
    getState: () => ({ toasts: [], shownToasts: new Set() }),
    setState: () => {},
    subscribe: () => () => {},
    addToast: () => {},
    removeToast: () => {},
    clearAllToasts: () => {},
    clearToastsByType: () => {},
    replaceToastByType: () => {},
    showSingleToast: () => {},
    hasShownToast: () => false,
    markToastAsShown: () => {},
  } as any;
}

// React hook to use the store
export const useToastStore = (): ToastStore => {
  const [state, setState] = React.useState(toastStoreInstance.getState());

  React.useEffect(() => {
    const unsubscribe = toastStoreInstance.subscribe(() => {
      setState(toastStoreInstance.getState());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...state,
    addToast: toastStoreInstance.addToast,
    removeToast: toastStoreInstance.removeToast,
    clearAllToasts: toastStoreInstance.clearAllToasts,
    clearToastsByType: toastStoreInstance.clearToastsByType,
    replaceToastByType: toastStoreInstance.replaceToastByType,
    showSingleToast: toastStoreInstance.showSingleToast,
    hasShownToast: toastStoreInstance.hasShownToast,
    markToastAsShown: toastStoreInstance.markToastAsShown,
  };
};

// Simple toast functions without object wrapper to avoid initialization issues
export const showToast = {
  success(title: string, message?: string, options?: Partial<ToastData>) {
    setTimeout(() => {
      try {
        toastStoreInstance.addToast({ type: 'success', title, message, ...options });
      } catch (e) { console.warn('Toast not ready:', e); }
    }, 0);
  },
  
  error(title: string, message?: string, options?: Partial<ToastData>) {
    setTimeout(() => {
      try {
        toastStoreInstance.addToast({ type: 'error', title, message, duration: 6000, ...options });
      } catch (e) { console.warn('Toast not ready:', e); }
    }, 0);
  },
  
  warning(title: string, message?: string, options?: Partial<ToastData>) {
    setTimeout(() => {
      try {
        toastStoreInstance.addToast({ type: 'warning', title, message, ...options });
      } catch (e) { console.warn('Toast not ready:', e); }
    }, 0);
  },
  
  info(title: string, message?: string, options?: Partial<ToastData>) {
    setTimeout(() => {
      try {
        toastStoreInstance.addToast({ type: 'info', title, message, ...options });
      } catch (e) { console.warn('Toast not ready:', e); }
    }, 0);
  },

  achievement(title: string, message?: string, points?: number) {
    setTimeout(() => {
      try {
        toastStoreInstance.addToast({
          type: 'success',
          title: `🎉 ${title}`,
          message: points ? `${message} (+${points} points)` : message,
          duration: 5000,
        });
      } catch (e) { console.warn('Toast not ready:', e); }
    }, 0);
  },

  once(key: string, type: ToastType, title: string, message?: string, options?: Partial<ToastData>) {
    setTimeout(() => {
      try {
        if (!toastStoreInstance.hasShownToast(key)) {
          toastStoreInstance.markToastAsShown(key);
          toastStoreInstance.addToast({ type, title, message, ...options });
        }
      } catch (e) { console.warn('Toast not ready:', e); }
    }, 0);
  },

  replace(type: ToastType, title: string, message?: string, options?: Partial<ToastData>) {
    setTimeout(() => {
      try {
        toastStoreInstance.replaceToastByType({ type, title, message, ...options });
      } catch (e) { console.warn('Toast not ready:', e); }
    }, 0);
  },

  clearType(type: ToastType) {
    setTimeout(() => {
      try {
        toastStoreInstance.clearToastsByType(type);
      } catch (e) { console.warn('Toast not ready:', e); }
    }, 0);
  },
  
  clearAll() {
    setTimeout(() => {
      try {
        toastStoreInstance.clearAllToasts();
      } catch (e) { console.warn('Toast not ready:', e); }
    }, 0);
  },
  
  clearGameToasts() {
    setTimeout(() => {
      try {
        toastStoreInstance.clearToastsByType('success');
        toastStoreInstance.clearToastsByType('error');
        toastStoreInstance.clearToastsByType('warning');
      } catch (e) { console.warn('Toast not ready:', e); }
    }, 0);
  },

  // New functions for single toast display (better UX)
  single: {
    success(title: string, message?: string, options?: Partial<ToastData>) {
      setTimeout(() => {
        try {
          toastStoreInstance.showSingleToast({ type: 'success', title, message, ...options });
        } catch (e) { console.warn('Toast not ready:', e); }
      }, 0);
    },
    
    error(title: string, message?: string, options?: Partial<ToastData>) {
      setTimeout(() => {
        try {
          toastStoreInstance.showSingleToast({ type: 'error', title, message, duration: 6000, ...options });
        } catch (e) { console.warn('Toast not ready:', e); }
      }, 0);
    },
    
    warning(title: string, message?: string, options?: Partial<ToastData>) {
      setTimeout(() => {
        try {
          toastStoreInstance.showSingleToast({ type: 'warning', title, message, ...options });
        } catch (e) { console.warn('Toast not ready:', e); }
      }, 0);
    },
    
    info(title: string, message?: string, options?: Partial<ToastData>) {
      setTimeout(() => {
        try {
          toastStoreInstance.showSingleToast({ type: 'info', title, message, ...options });
        } catch (e) { console.warn('Toast not ready:', e); }
      }, 0);
    }
  }
};

// Backward compatibility
export const toast = showToast;