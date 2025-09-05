import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserProfileForm } from './UserProfileForm';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';

// Mock the stores
vi.mock('../../stores/userStore');
vi.mock('../../stores/settingsStore');

// Mock translation function
vi.mock('../../utils/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key
  })
}));

const mockUseUserStore = vi.mocked(useUserStore);
const mockUseSettingsStore = vi.mocked(useSettingsStore);

describe('UserProfileForm Error Handling', () => {
  const mockOnClose = vi.fn();
  const mockSetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseUserStore.mockReturnValue({
      user: null,
      setUser: mockSetUser,
    } as any);

    mockUseSettingsStore.mockReturnValue({
      language: 'en',
    } as any);
  });

  it('should display compact error indicators for invalid fields', async () => {
    render(<UserProfileForm onClose={mockOnClose} />);

    // Try to submit form without filling required fields
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check for compact error indicators (exclamation marks)
      const errorIndicators = screen.getAllByText('!');
      expect(errorIndicators.length).toBeGreaterThan(0);
    });
  });

  it('should show error tooltips on hover for compact indicators', async () => {
    render(<UserProfileForm onClose={mockOnClose} />);

    // Submit form to trigger validation errors
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorIndicator = screen.getAllByText('!')[0];
      expect(errorIndicator).toBeInTheDocument();
      
      // Check that tooltip container exists
      const tooltip = errorIndicator.querySelector('.profile-error-tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('should apply error styling to input fields with validation errors', async () => {
    render(<UserProfileForm onClose={mockOnClose} />);

    // Clear the name field and submit to trigger validation
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput).toHaveClass('profile-input--error');
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('should show inline error messages for critical fields', async () => {
    render(<UserProfileForm onClose={mockOnClose} />);

    // Submit form to trigger validation
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check for inline error messages
      const inlineErrors = document.querySelectorAll('.profile-error--inline');
      expect(inlineErrors.length).toBeGreaterThan(0);
    });
  });

  it('should not break layout when errors are displayed', async () => {
    render(<UserProfileForm onClose={mockOnClose} />);

    // Get initial container height
    const container = document.querySelector('.user-profile-container');
    const initialHeight = container?.getBoundingClientRect().height;

    // Submit form to trigger errors
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Verify container height hasn't significantly changed
      const newHeight = container?.getBoundingClientRect().height;
      if (initialHeight && newHeight) {
        // Allow for small variations but ensure no major layout shift
        expect(Math.abs(newHeight - initialHeight)).toBeLessThan(50);
      }
    });
  });

  it('should provide proper accessibility attributes for error states', async () => {
    render(<UserProfileForm onClose={mockOnClose} />);

    // Submit form to trigger validation
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      
      // Check accessibility attributes
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(nameInput).toHaveAttribute('aria-describedby');
      
      // Check for live region for screen readers
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  it('should clear error states when fields become valid', async () => {
    render(<UserProfileForm onClose={mockOnClose} />);

    // Submit form to trigger validation
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveClass('profile-input--error');
    });

    // Fix the validation error
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Valid Name' } });

    await waitFor(() => {
      expect(nameInput).not.toHaveClass('profile-input--error');
      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
    });
  });

  it('should handle category validation errors without breaking grid layout', async () => {
    render(<UserProfileForm onClose={mockOnClose} />);

    // Submit form without selecting categories
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check that categories section has error styling
      const categoriesContainer = document.querySelector('.profile-categories-container');
      const parentContainer = categoriesContainer?.closest('.profile-field-container--error');
      expect(parentContainer).toBeInTheDocument();
      
      // Verify grid layout is maintained (check for the CSS class name)
      const gridContainer = document.querySelector('.profile-categories-grid');
      expect(gridContainer).toHaveClass('profile-categories-grid');
      
      // Verify error indicator is present
      const errorIndicator = parentContainer?.querySelector('.profile-error--compact');
      expect(errorIndicator).toBeInTheDocument();
    });
  });
});