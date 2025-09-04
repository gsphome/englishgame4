/**
 * Enhanced Accessibility utilities with WCAG 2.1 AA compliance
 */

import { logDebug } from './logger';

// ARIA live region types
export type AriaLiveType = 'polite' | 'assertive' | 'off';

// Focus management
export interface FocusOptions {
  preventScroll?: boolean;
  restoreFocus?: boolean;
}

// Color contrast ratios for WCAG compliance
export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const;

/**
 * Accessibility Manager Class
 */
class AccessibilityManager {
  private focusStack: HTMLElement[] = [];
  private liveRegion: HTMLElement | null = null;
  private reducedMotion = false;

  constructor() {
    this.init();
  }

  /**
   * Initialize accessibility features
   */
  private init(): void {
    this.setupLiveRegion();
    this.detectReducedMotion();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
  }

  /**
   * Create ARIA live region for announcements
   */
  private setupLiveRegion(): void {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('class', 'sr-only');
    this.liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    document.body.appendChild(this.liveRegion);
  }

  /**
   * Detect user's motion preferences
   */
  private detectReducedMotion(): void {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = mediaQuery.matches;
    
    mediaQuery.addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      logDebug('Reduced motion preference changed', { reducedMotion: this.reducedMotion }, 'A11y');
    });
  }

  /**
   * Setup keyboard navigation helpers
   */
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (e) => {
      // Skip to main content (Alt + S)
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        this.skipToMainContent();
      }
      
      // Focus visible elements only
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }
    });
  }

  /**
   * Setup focus management
   */
  private setupFocusManagement(): void {
    // Track focus changes
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target && this.isVisible(target)) {
        logDebug('Focus moved to', { element: target.tagName, id: target.id, className: target.className }, 'A11y');
      }
    });
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: AriaLiveType = 'polite'): void {
    if (!this.liveRegion || !message.trim()) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);

    logDebug('Screen reader announcement', { message, priority }, 'A11y');
  }

  /**
   * Focus element with options
   */
  focus(element: HTMLElement | string, options: FocusOptions = {}): boolean {
    const target = typeof element === 'string' ? document.querySelector(element) as HTMLElement : element;
    
    if (!target || !this.isVisible(target) || !this.isFocusable(target)) {
      logDebug('Cannot focus element', { element: target?.tagName, visible: this.isVisible(target) }, 'A11y');
      return false;
    }

    // Store current focus for restoration
    if (options.restoreFocus && document.activeElement instanceof HTMLElement) {
      this.focusStack.push(document.activeElement);
    }

    target.focus({ preventScroll: options.preventScroll });
    return true;
  }

  /**
   * Restore previous focus
   */
  restoreFocus(): boolean {
    const previousElement = this.focusStack.pop();
    if (previousElement && this.isVisible(previousElement)) {
      previousElement.focus();
      return true;
    }
    return false;
  }

  /**
   * Trap focus within container
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Skip to main content
   */
  private skipToMainContent(): void {
    const main = document.querySelector('main, [role="main"], #main') as HTMLElement;
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      this.announce('Skipped to main content');
    }
  }

  /**
   * Handle tab navigation
   */
  private handleTabNavigation(e: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements(document.body);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex === -1) return;

    const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
    const nextElement = focusableElements[nextIndex];

    if (nextElement && !this.isVisible(nextElement)) {
      e.preventDefault();
      // Find next visible element
      const visibleElements = focusableElements.filter(el => this.isVisible(el));
      const visibleIndex = visibleElements.findIndex(el => el === document.activeElement);
      const nextVisibleIndex = e.shiftKey ? visibleIndex - 1 : visibleIndex + 1;
      const nextVisibleElement = visibleElements[nextVisibleIndex];
      
      if (nextVisibleElement) {
        nextVisibleElement.focus();
      }
    }
  }

  /**
   * Get all focusable elements within container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    return elements.filter(el => this.isVisible(el) && this.isFocusable(el));
  }

  /**
   * Check if element is visible
   */
  isVisible(element: HTMLElement): boolean {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  }

  /**
   * Check if element is focusable
   */
  isFocusable(element: HTMLElement): boolean {
    if (!element) return false;
    
    const tabIndex = element.getAttribute('tabindex');
    if (tabIndex === '-1') return false;
    
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
      return false;
    }
    
    return true;
  }

  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    return this.reducedMotion;
  }

  /**
   * Calculate color contrast ratio
   */
  getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
      // Simple RGB extraction (works for hex colors)
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check WCAG compliance
   */
  isWCAGCompliant(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA', isLargeText = false): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    const requiredRatio = level === 'AA' 
      ? (isLargeText ? CONTRAST_RATIOS.AA_LARGE : CONTRAST_RATIOS.AA_NORMAL)
      : (isLargeText ? CONTRAST_RATIOS.AAA_LARGE : CONTRAST_RATIOS.AAA_NORMAL);
    
    return ratio >= requiredRatio;
  }

  /**
   * Add ARIA attributes to element
   */
  setAriaAttributes(element: HTMLElement, attributes: Record<string, string>): void {
    Object.entries(attributes).forEach(([key, value]) => {
      const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
      element.setAttribute(ariaKey, value);
    });
  }

  /**
   * Create accessible button
   */
  createAccessibleButton(text: string, onClick: () => void, options: {
    ariaLabel?: string;
    ariaDescribedBy?: string;
    className?: string;
  } = {}): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    
    if (options.className) {
      button.className = options.className;
    }
    
    if (options.ariaLabel) {
      button.setAttribute('aria-label', options.ariaLabel);
    }
    
    if (options.ariaDescribedBy) {
      button.setAttribute('aria-describedby', options.ariaDescribedBy);
    }
    
    return button;
  }
}

// Export singleton instance - lazy initialization to avoid module loading issues
let _a11y: AccessibilityManager | null = null;
const getA11y = () => {
  if (!_a11y) {
    _a11y = new AccessibilityManager();
  }
  return _a11y;
};

export const a11y = {
  announce: (message: string, priority?: AriaLiveType) => getA11y().announce(message, priority),
  focus: (element: HTMLElement | string, options?: FocusOptions) => getA11y().focus(element, options),
  trapFocus: (container: HTMLElement) => getA11y().trapFocus(container),
  restoreFocus: () => getA11y().restoreFocus(),
  prefersReducedMotion: () => getA11y().prefersReducedMotion(),
  isWCAGCompliant: (color1: string, color2: string, level?: 'AA' | 'AAA', isLargeText?: boolean) => 
    getA11y().isWCAGCompliant(color1, color2, level, isLargeText),
  getFocusableElements: (container: HTMLElement) => getA11y().getFocusableElements(container),
  createAccessibleButton: (text: string, onClick: () => void, options?: any) => 
    getA11y().createAccessibleButton(text, onClick, options),
  getContrastRatio: (color1: string, color2: string) => getA11y().getContrastRatio(color1, color2),
  setAriaAttributes: (element: HTMLElement, attributes: Record<string, string>) => 
    getA11y().setAriaAttributes(element, attributes)
};

// Convenience functions
export const announce = (message: string, priority?: AriaLiveType) => a11y.announce(message, priority);
export const focus = (element: HTMLElement | string, options?: FocusOptions) => a11y.focus(element, options);
export const trapFocus = (container: HTMLElement) => a11y.trapFocus(container);
export const restoreFocus = () => a11y.restoreFocus();
export const prefersReducedMotion = () => a11y.prefersReducedMotion();
export const isWCAGCompliant = (color1: string, color2: string, level?: 'AA' | 'AAA', isLargeText?: boolean) => 
  a11y.isWCAGCompliant(color1, color2, level, isLargeText);