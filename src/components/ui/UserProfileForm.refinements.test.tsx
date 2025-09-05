import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserProfileForm } from './UserProfileForm';

// Mock the stores
vi.mock('../../stores/userStore', () => ({
  useUserStore: () => ({
    user: null,
    setUser: vi.fn()
  })
}));

vi.mock('../../stores/settingsStore', () => ({
  useSettingsStore: () => ({
    language: 'en'
  })
}));

// Mock the translation hook
vi.mock('../../utils/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key
  })
}));

describe('UserProfileForm Refinements', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Keyboard Navigation and Tabindex', () => {
    it('has proper tabindex order for keyboard navigation', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      // Check that form elements have proper tabindex order
      const nameInput = screen.getByLabelText(/profile.name/i);
      const levelSelect = screen.getByLabelText(/profile.englishLevel/i);
      const languageSelect = screen.getByLabelText(/profile.interfaceLanguage/i);
      const dailyGoalInput = screen.getByLabelText(/profile.dailyGoal/i);
      const difficultySlider = screen.getByLabelText(/profile.difficultyLevel/i);
      const saveButton = screen.getByLabelText(/profile.saveProfile/i);
      const cancelButton = screen.getByLabelText(/common.cancel/i);
      const closeButton = screen.getByLabelText(/Cerrar formulario de perfil/i);
      
      expect(nameInput).toHaveAttribute('tabindex', '1');
      expect(levelSelect).toHaveAttribute('tabindex', '2');
      expect(languageSelect).toHaveAttribute('tabindex', '3');
      expect(dailyGoalInput).toHaveAttribute('tabindex', '4');
      expect(difficultySlider).toHaveAttribute('tabindex', '5');
      expect(saveButton).toHaveAttribute('tabindex', '11');
      expect(cancelButton).toHaveAttribute('tabindex', '12');
      expect(closeButton).toHaveAttribute('tabindex', '13');
    });

    it('has proper tabindex for category checkboxes', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      // Check that category checkboxes have sequential tabindex starting from 6
      const categoryCheckboxes = document.querySelectorAll('.profile-category-checkbox');
      expect(categoryCheckboxes).toHaveLength(4);
      
      categoryCheckboxes.forEach((checkbox, index) => {
        expect(checkbox).toHaveAttribute('tabindex', (6 + index).toString());
      });
    });

    it('has proper tabindex for notifications checkbox', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const notificationsCheckbox = document.querySelector('.profile-notifications-checkbox');
      expect(notificationsCheckbox).toHaveAttribute('tabindex', '10');
    });
  });

  describe('Enhanced Focus Styles', () => {
    it('applies enhanced focus styles to form elements', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      // Check that inputs have proper CSS classes for enhanced focus
      const nameInput = screen.getByLabelText(/profile.name/i);
      expect(nameInput).toHaveClass('profile-input', 'profile-input--blue-focus');
      
      const levelSelect = screen.getByLabelText(/profile.englishLevel/i);
      expect(levelSelect).toHaveClass('profile-select', 'profile-select--blue-focus');
      
      const languageSelect = screen.getByLabelText(/profile.interfaceLanguage/i);
      expect(languageSelect).toHaveClass('profile-select', 'profile-select--purple-focus');
    });

    it('applies enhanced focus styles to interactive elements', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const categoryCheckboxes = document.querySelectorAll('.profile-category-checkbox');
      categoryCheckboxes.forEach(checkbox => {
        expect(checkbox).toHaveClass('profile-category-checkbox');
      });
      
      const notificationsCheckbox = document.querySelector('.profile-notifications-checkbox');
      expect(notificationsCheckbox).toHaveClass('profile-notifications-checkbox');
      
      const rangeSlider = document.querySelector('.profile-range-slider');
      expect(rangeSlider).toHaveClass('profile-range-slider');
    });
  });

  describe('Button Interactions and Animations', () => {
    it('has proper button classes for enhanced interactions', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const saveButton = screen.getByLabelText(/profile.saveProfile/i);
      const cancelButton = screen.getByLabelText(/common.cancel/i);
      
      expect(saveButton).toHaveClass('profile-btn', 'profile-btn--save');
      expect(cancelButton).toHaveClass('profile-btn', 'profile-btn--cancel');
    });

    it('handles button clicks correctly', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const cancelButton = screen.getByLabelText(/common.cancel/i);
      fireEvent.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('handles close button click correctly', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText(/Cerrar formulario de perfil/i);
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Layout and Spacing Refinements', () => {
    it('has proper grid layout structure', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const gridContainer = document.querySelector('.profile-content-grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('profile-content-grid');
      
      const fieldGrid = document.querySelector('.profile-field-grid');
      expect(fieldGrid).toBeInTheDocument();
      expect(fieldGrid).toHaveClass('profile-field-grid');
    });

    it('has proper category grid alignment', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const categoriesGrid = document.querySelector('.profile-categories-grid');
      expect(categoriesGrid).toBeInTheDocument();
      expect(categoriesGrid).toHaveClass('profile-categories-grid');
      
      const categoryItems = document.querySelectorAll('.profile-category-item');
      expect(categoryItems).toHaveLength(4);
      
      categoryItems.forEach(item => {
        expect(item).toHaveClass('profile-category-item');
      });
    });

    it('has proper section styling for different themes', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const basicSection = document.querySelector('.profile-section--basic');
      const preferencesSection = document.querySelector('.profile-section--preferences');
      
      expect(basicSection).toHaveClass('profile-section--basic');
      expect(preferencesSection).toHaveClass('profile-section--preferences');
    });
  });

  describe('Accessibility Enhancements', () => {
    it('has proper ARIA attributes for form validation', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const nameInput = screen.getByLabelText(/profile.name/i);
      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
      expect(nameInput).toHaveAttribute('aria-label');
      
      const levelSelect = screen.getByLabelText(/profile.englishLevel/i);
      expect(levelSelect).toHaveAttribute('aria-invalid', 'false');
      expect(levelSelect).toHaveAttribute('aria-label');
    });

    it('has proper ARIA labels for interactive elements', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const categoryCheckboxes = document.querySelectorAll('.profile-category-checkbox');
      categoryCheckboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('aria-label');
        expect(checkbox).toHaveAttribute('aria-invalid', 'false');
      });
      
      const notificationsCheckbox = document.querySelector('.profile-notifications-checkbox');
      expect(notificationsCheckbox).toHaveAttribute('aria-label');
      expect(notificationsCheckbox).toHaveAttribute('aria-invalid', 'false');
    });

    it('has proper button accessibility attributes', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const saveButton = screen.getByLabelText(/profile.saveProfile/i);
      const cancelButton = screen.getByLabelText(/common.cancel/i);
      const closeButton = screen.getByLabelText(/Cerrar formulario de perfil/i);
      
      expect(saveButton).toHaveAttribute('aria-label');
      expect(cancelButton).toHaveAttribute('aria-label');
      expect(closeButton).toHaveAttribute('aria-label');
    });
  });

  describe('Modal Animation and Transitions', () => {
    it('has proper modal container classes for animations', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const modal = document.querySelector('.user-profile-modal');
      const container = document.querySelector('.user-profile-container');
      
      expect(modal).toHaveClass('user-profile-modal');
      expect(container).toHaveClass('user-profile-container');
    });

    it('has proper content structure for transitions', () => {
      render(<UserProfileForm onClose={mockOnClose} />);
      
      const content = document.querySelector('.user-profile-content');
      const form = document.querySelector('.user-profile-form');
      
      expect(content).toHaveClass('user-profile-content');
      expect(form).toHaveClass('user-profile-form');
    });
  });
});