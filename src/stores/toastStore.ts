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
    console.log('🧪 setState: Updating state with:', newState);
    console.log('🧪 setState: Current listeners count:', globalState.listeners.size);
    Object.assign(globalState, newState);
    globalState.listeners.forEach((listener, index) => {
      try {
        console.log('🧪 setState: Calling listener', index);
        listener();
      } catch (e) {
        console.warn('Toast listener error:', e);
      }
    });
    console.log('🧪 setState: Completed');
  },

  subscribe(listener: () => void) {
    console.log('🧪 subscribe: Adding listener, total listeners will be:', globalState.listeners.size + 1);
    globalState.listeners.add(listener);
    return () => {
      console.log('🧪 unsubscribe: Removing listener, total listeners will be:', globalState.listeners.size - 1);
      globalState.listeners.delete(listener);
    };
  },

  addToast(toast: Omit<ToastData, 'id'>) {
    console.log('🧪 addToast called with:', toast);
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newToast: ToastData = {
      id,
      duration: 4000, // Default duration
      ...toast,
    };

    console.log('🧪 Created new toast:', newToast);

    // For better UX, limit the number of toasts visible at once
    // Keep only the most recent toasts (max 2 at a time)
    const currentToasts = globalState.toasts;
    let updatedToasts = [...currentToasts, newToast];

    // If we have more than 2 toasts, remove the oldest ones
    if (updatedToasts.length > 2) {
      updatedToasts = updatedToasts.slice(-2);
    }

    console.log('🧪 About to setState with toasts:', updatedToasts);

    this.setState({
      toasts: updatedToasts,
    });

    console.log('🧪 setState completed, globalState.toasts:', globalState.toasts);

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
    console.log('🧪 clearAllToasts called, immediate:', immediate, 'current toasts:', globalState.toasts.length);
    if (immediate) {
      // Immediate clear for showSingleToast
      console.log('🧪 clearAllToasts: Immediate clear');
      this.setState({ toasts: [] });
      return;
    }

    const toastsToRemove = [...globalState.toasts];
    console.log('🧪 clearAllToasts: Clearing', toastsToRemove.length, 'toasts with animation');

    // Trigger fast close animation for all existing toasts
    toastsToRemove.forEach((toast) => {
      const closeEvent = new CustomEvent(`close-toast-${toast.id}`);
      window.dispatchEvent(closeEvent);
    });

    // Clear the state after animation time
    setTimeout(() => {
      console.log('🧪 clearAllToasts: Delayed clear executing');
      this.setState({ toasts: [] });
    }, 200); // Give time for animations to complete
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
    console.log('🧪 showSingleToast called with:', toast);
    // Clear all existing toasts immediately for single toast
    this.clearAllToasts(true);
    // Add the new toast immediately
    this.addToast(toast);
    console.log('🧪 showSingleToast completed, current toasts:', globalState.toasts);
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
    setState: () => { },
    subscribe: () => () => { },
    addToast: () => { },
    removeToast: () => { },
    clearAllToasts: () => { },
    clearToastsByType: () => { },
    replaceToastByType: () => { },
    showSingleToast: () => { },
    hasShownToast: () => false,
    markToastAsShown: () => { },
  } as any;
}

// React hook to use the store
export const useToastStore = (): ToastStore => {
  const [state, setState] = useState(() => toastStoreInstance.getState());

  useEffect(() => {
    console.log('🧪 useToastStore: Setting up subscription');
    const unsubscribe = toastStoreInstance.subscribe(() => {
      const newState = toastStoreInstance.getState();
      console.log('🧪 useToastStore: State changed, new state:', newState);
      setState(newState);
    });

    return unsubscribe;
  }, []);

  console.log('🧪 useToastStore: Current state in hook:', state);

  return {
    ...state,
    addToast: toastStoreInstance.addToast.bind(toastStoreInstance),
    removeToast: toastStoreInstance.removeToast.bind(toastStoreInstance),
    clearAllToasts: toastStoreInstance.clearAllToasts.bind(toastStoreInstance),
    clearToastsByType: toastStoreInstance.clearToastsByType.bind(toastStoreInstance),
    replaceToastByType: toastStoreInstance.replaceToastByType.bind(toastStoreInstance),
    showSingleToast: toastStoreInstance.showSingleToast.bind(toastStoreInstance),
    hasShownToast: toastStoreInstance.hasShownToast.bind(toastStoreInstance),
    markToastAsShown: toastStoreInstance.markToastAsShown.bind(toastStoreInstance),
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
    console.log('🧪 toast.clearAll() called');
    setTimeout(() => {
      try {
        console.log('🧪 toast.clearAll() executing clearAllToasts');
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