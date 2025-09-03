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
  hasShownToast: (key: string) => boolean;
  markToastAsShown: (key: string) => void;
}

// Simple vanilla store implementation to avoid Zustand initialization issues on GitHub Pages
class SimpleToastStore {
  private state: {
    toasts: ToastData[];
    shownToasts: Set<string>;
  } = {
    toasts: [],
    shownToasts: new Set<string>(),
  };

  private listeners: Set<() => void> = new Set();

  getState() {
    return this.state;
  }

  setState(newState: Partial<typeof this.state>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newToast: ToastData = {
      id,
      duration: 4000, // Default duration
      ...toast,
    };

    this.setState({
      toasts: [...this.state.toasts, newToast],
    });

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, newToast.duration);
    }
  };

  removeToast = (id: string) => {
    this.setState({
      toasts: this.state.toasts.filter((toast) => toast.id !== id),
    });
  };

  clearAllToasts = () => {
    this.setState({ toasts: [] });
  };

  clearToastsByType = (type: ToastType) => {
    const toastsToRemove = this.state.toasts.filter((toast) => toast.type === type);
    
    this.setState({
      toasts: this.state.toasts.filter((toast) => toast.type !== type),
    });

    // Trigger fast close animation for existing toasts of this type
    toastsToRemove.forEach((toast) => {
      const closeEvent = new CustomEvent(`close-toast-${toast.id}`);
      window.dispatchEvent(closeEvent);
    });
  };

  replaceToastByType = (toast: Omit<ToastData, 'id'>) => {
    // Remove existing toasts of the same type
    this.clearToastsByType(toast.type);
    // Add the new toast
    setTimeout(() => {
      this.addToast(toast);
    }, 100); // Small delay to ensure cleanup is complete
  };

  hasShownToast = (key: string) => {
    return this.state.shownToasts.has(key);
  };

  markToastAsShown = (key: string) => {
    const newSet = new Set(this.state.shownToasts);
    newSet.add(key);
    this.setState({ shownToasts: newSet });
  };
}

// Create store instance
const toastStoreInstance = new SimpleToastStore();

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
  }
};

// Backward compatibility
export const toast = showToast;