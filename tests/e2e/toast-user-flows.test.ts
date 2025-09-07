/**
 * E2E tests for Toast user flows
 * Tests complete user workflows with toast notifications
 */

import { test, expect } from '@playwright/test';

test.describe('Toast User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should show welcome toast on first visit', async ({ page }) => {
    // Clear localStorage to simulate first visit
    await page.evaluate(() => localStorage.clear());
    
    // Reload page to trigger welcome toast
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should show welcome toast
    const welcomeToast = page.locator('.toast-card--success');
    await expect(welcomeToast).toBeVisible();
    await expect(welcomeToast.locator('.toast-card__title')).toContainText('Bienvenido');
    await expect(welcomeToast.locator('.toast-card__message')).toContainText('módulos disponibles');
  });

  test('should not show welcome toast on subsequent visits', async ({ page }) => {
    // First visit - should show welcome toast
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    let welcomeToast = page.locator('.toast-card--success');
    await expect(welcomeToast).toBeVisible();
    
    // Wait for toast to disappear
    await expect(welcomeToast).not.toBeVisible({ timeout: 10000 });
    
    // Second visit - should not show welcome toast
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait a bit to ensure no toast appears
    await page.waitForTimeout(2000);
    welcomeToast = page.locator('.toast-card--success');
    await expect(welcomeToast).not.toBeVisible();
  });

  test('should show module start toast when clicking a module', async ({ page }) => {
    // Wait for modules to load
    await page.waitForSelector('.module-card', { timeout: 10000 });
    
    // Click on first module
    const firstModule = page.locator('.module-card').first();
    await firstModule.click();
    
    // Should show "Iniciando módulo" toast
    const moduleToast = page.locator('.toast-card--info');
    await expect(moduleToast).toBeVisible();
    await expect(moduleToast.locator('.toast-card__title')).toContainText('Iniciando módulo');
  });

  test('should show error toast when there are connection issues', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', route => route.abort());
    
    // Reload page to trigger error
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should show error toast
    const errorToast = page.locator('.toast-card--error');
    await expect(errorToast).toBeVisible();
    await expect(errorToast.locator('.toast-card__title')).toContainText('Error de conexión');
    
    // Should have retry button
    const retryButton = errorToast.locator('.toast-card__action');
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toContainText('Reintentar');
  });

  test('should maintain single toast constraint', async ({ page }) => {
    // Trigger multiple toasts rapidly via console
    await page.evaluate(() => {
      // @ts-ignore
      window.testToasts = async () => {
        const { toast } = await import('./src/stores/toastStore.js');
        toast.success('Toast 1');
        toast.error('Toast 2');
        toast.warning('Toast 3');
        toast.info('Toast 4');
      };
    });
    
    await page.evaluate(() => {
      // @ts-ignore
      window.testToasts();
    });
    
    // Should only have one toast visible
    const toastCards = page.locator('.toast-card');
    await expect(toastCards).toHaveCount(1);
    
    // Should be the last toast (info)
    await expect(toastCards.first()).toHaveClass(/toast-card--info/);
  });

  test('should auto-dismiss toasts after duration', async ({ page }) => {
    // Show a toast with short duration via console
    await page.evaluate(() => {
      window.testShortToast = async () => {
        const { toast } = await import('./src/stores/toastStore.js');
        toast.success('Short Toast', 'Will disappear soon', { duration: 1000 });
      };
    });
    
    await page.evaluate(() => {
      // @ts-ignore
      window.testShortToast();
    });
    
    // Should be visible initially
    const shortToast = page.locator('.toast-card--success');
    await expect(shortToast).toBeVisible();
    
    // Should disappear after duration
    await expect(shortToast).not.toBeVisible({ timeout: 2000 });
  });

  test('should allow manual dismissal of toasts', async ({ page }) => {
    // Show a persistent toast
    await page.evaluate(() => {
      window.testPersistentToast = async () => {
        const { toast } = await import('./src/stores/toastStore.js');
        toast.info('Persistent Toast', 'Click X to close', { duration: 0 });
      };
    });
    
    await page.evaluate(() => {
      // @ts-ignore
      window.testPersistentToast();
    });
    
    const persistentToast = page.locator('.toast-card--info');
    await expect(persistentToast).toBeVisible();
    
    // Click close button
    const closeButton = persistentToast.locator('.toast-card__close');
    await closeButton.click();
    
    // Should disappear
    await expect(persistentToast).not.toBeVisible();
  });

  test('should clear toasts when navigating between views', async ({ page }) => {
    // Show a toast
    await page.evaluate(() => {
      window.testNavigationToast = async () => {
        const { toast } = await import('./src/stores/toastStore.js');
        toast.warning('Navigation Test', 'Should clear on navigation', { duration: 0 });
      };
    });
    
    await page.evaluate(() => {
      // @ts-ignore
      window.testNavigationToast();
    });
    
    const navigationToast = page.locator('.toast-card--warning');
    await expect(navigationToast).toBeVisible();
    
    // Navigate to a module (if available)
    const moduleCard = page.locator('.module-card').first();
    if (await moduleCard.isVisible()) {
      await moduleCard.click();
      
      // Toast should be cleared
      await expect(navigationToast).not.toBeVisible();
    }
  });

  test('should work correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Clear localStorage and reload to trigger welcome toast
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should show welcome toast
    const welcomeToast = page.locator('.toast-card--success');
    await expect(welcomeToast).toBeVisible();
    
    // Should be positioned correctly for mobile (centered)
    const container = page.locator('.toast-container');
    await expect(container).toHaveCSS('justify-content', 'center');
    
    // Close button should be touch-friendly
    const closeButton = welcomeToast.locator('.toast-card__close');
    const boundingBox = await closeButton.boundingBox();
    expect(boundingBox?.width).toBeGreaterThanOrEqual(44);
    expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('should work correctly on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Show a toast
    await page.evaluate(() => {
      window.testDesktopToast = async () => {
        const { toast } = await import('./src/stores/toastStore.js');
        toast.info('Desktop Test', 'Testing desktop layout');
      };
    });
    
    await page.evaluate(() => {
      // @ts-ignore
      window.testDesktopToast();
    });
    
    const desktopToast = page.locator('.toast-card--info');
    await expect(desktopToast).toBeVisible();
    
    // Should be positioned to top-right on desktop
    const container = page.locator('.toast-container');
    await expect(container).toHaveCSS('right', '16px');
  });

  test('should handle rapid user interactions gracefully', async ({ page }) => {
    // Rapidly trigger multiple actions that show toasts
    await page.evaluate(() => {
      window.testRapidActions = async () => {
        const { toast } = await import('./src/stores/toastStore.js');
        
        // Simulate rapid user actions
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            toast.success(`Rapid Toast ${i}`, `Message ${i}`);
          }, i * 50);
        }
      };
    });
    
    await page.evaluate(() => {
      // @ts-ignore
      window.testRapidActions();
    });
    
    // Should handle gracefully - only one toast visible
    await page.waitForTimeout(1000);
    const toastCards = page.locator('.toast-card');
    await expect(toastCards).toHaveCount(1);
  });

  test('should maintain accessibility across user flows', async ({ page }) => {
    // Show a toast
    await page.evaluate(() => {
      window.testA11yToast = async () => {
        const { toast } = await import('./src/stores/toastStore.js');
        toast.success('Accessibility Test', 'Testing ARIA attributes');
      };
    });
    
    await page.evaluate(() => {
      // @ts-ignore
      window.testA11yToast();
    });
    
    const a11yToast = page.locator('.toast-card--success');
    await expect(a11yToast).toBeVisible();
    
    // Should have proper ARIA attributes
    await expect(a11yToast).toHaveAttribute('role', 'alert');
    await expect(a11yToast).toHaveAttribute('aria-live', 'polite');
    await expect(a11yToast).toHaveAttribute('aria-atomic', 'true');
    
    // Close button should be accessible
    const closeButton = a11yToast.locator('.toast-card__close');
    await expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
    
    // Should be keyboard accessible
    await closeButton.focus();
    await expect(closeButton).toBeFocused();
  });
});