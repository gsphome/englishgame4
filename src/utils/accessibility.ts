/**
 * Accessibility utilities for better user experience
 */

/**
 * Announces a message to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Manages focus for better keyboard navigation
 */
export class FocusManager {
  private static focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  /**
   * Gets all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  /**
   * Traps focus within a container (useful for modals)
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Restores focus to a previously focused element
   */
  static restoreFocus(element: HTMLElement | null) {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }
}

/**
 * Checks if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Checks if user prefers high contrast
 */
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Gets appropriate ARIA label for score display
 */
export const getScoreAriaLabel = (correct: number, incorrect: number, accuracy: number): string => {
  const total = correct + incorrect;
  if (total === 0) {
    return 'No questions answered yet';
  }
  
  return `${correct} correct answers, ${incorrect} incorrect answers out of ${total} total. ${accuracy.toFixed(0)} percent accuracy.`;
};

/**
 * Gets appropriate ARIA label for progress
 */
export const getProgressAriaLabel = (current: number, total: number, percentage?: number): string => {
  if (percentage !== undefined) {
    return `Progress: ${current} of ${total} completed, ${percentage}% complete`;
  }
  return `Progress: ${current} of ${total} completed`;
};

/**
 * Debounced announce function to prevent spam
 */
let announceTimeout: NodeJS.Timeout;
export const debouncedAnnounce = (message: string, delay: number = 500) => {
  clearTimeout(announceTimeout);
  announceTimeout = setTimeout(() => {
    announceToScreenReader(message);
  }, delay);
};