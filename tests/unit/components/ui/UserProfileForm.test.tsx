import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserProfileForm } from '../../../../src/components/ui/UserProfileForm';

// Mock the stores
vi.mock('../../../../src/stores/userStore', () => ({
  useUserStore: () => ({
    user: null,
    setUser: vi.fn()
  })
}));

vi.mock('../../../../src/stores/settingsStore', () => ({
  useSettingsStore: () => ({
    language: 'en'
  })
}));

// Mock the translation hook
vi.mock('../../../../src/utils/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key
  })
}));

describe('UserProfileForm', () => {
  const mockOnClose = vi.fn();

  it('renders modal with fixed height container', () => {
    render(<UserProfileForm onClose={mockOnClose} />);
    
    // Check that the modal container exists
    const modal = document.querySelector('.user-profile-modal');
    expect(modal).toBeInTheDocument();
    
    // Check that the container has the expected structure
    const container = document.querySelector('.user-profile-container');
    expect(container).toBeInTheDocument();
  });

  it('has proper CSS classes for fixed height layout', () => {
    render(<UserProfileForm onClose={mockOnClose} />);
    
    const container = document.querySelector('.user-profile-container');
    expect(container).toHaveClass('user-profile-container');
    
    const content = document.querySelector('.user-profile-content');
    expect(content).toBeInTheDocument();
    
    const form = document.querySelector('.user-profile-form');
    expect(form).toBeInTheDocument();
  });

  it('renders all required form sections', () => {
    render(<UserProfileForm onClose={mockOnClose} />);
    
    // Check for basic info section
    expect(screen.getByText(/profile.personalInfo/i)).toBeInTheDocument();
    
    // Check for preferences section
    expect(screen.getByText(/profile.learningPreferences/i)).toBeInTheDocument();
    
    // Check for action buttons
    expect(screen.getByText(/common.cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/profile.saveProfile/i)).toBeInTheDocument();
  });

  it('implements two-column grid layout for responsive design', () => {
    render(<UserProfileForm onClose={mockOnClose} />);
    
    // Check that the profile-content-grid class exists
    const gridContainer = document.querySelector('.profile-content-grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('profile-content-grid');
    
    // Check that both sections are within the grid
    const basicSection = gridContainer?.querySelector('.profile-section--basic');
    const preferencesSection = gridContainer?.querySelector('.profile-section--preferences');
    
    expect(basicSection).toBeInTheDocument();
    expect(preferencesSection).toBeInTheDocument();
    
    // Verify that categories and notifications are outside the grid (full-width)
    const fullWidthSection = document.querySelector('.user-profile-form > .profile-section--preferences');
    expect(fullWidthSection).toBeInTheDocument();
  });

  it('uses compact labels to prevent text wrapping issues', () => {
    render(<UserProfileForm onClose={mockOnClose} />);
    
    // Check that compact label classes are applied
    const compactLabels = document.querySelectorAll('.profile-field-label--compact');
    expect(compactLabels.length).toBeGreaterThan(0);
    
    // Check that field items have proper structure
    const fieldItems = document.querySelectorAll('.profile-field-item');
    expect(fieldItems.length).toBe(2); // Language and Daily Goal fields
    
    // Verify grid structure
    const fieldGrid = document.querySelector('.profile-field-grid');
    expect(fieldGrid).toBeInTheDocument();
  });

  it('has responsive CSS classes for different screen sizes', () => {
    render(<UserProfileForm onClose={mockOnClose} />);
    
    // Check that the main grid container has responsive classes
    const gridContainer = document.querySelector('.profile-content-grid');
    expect(gridContainer).toBeInTheDocument();
    
    // Check that field grid exists for responsive behavior
    const fieldGrid = document.querySelector('.profile-field-grid');
    expect(fieldGrid).toBeInTheDocument();
    
    // Check that categories grid has responsive structure
    const categoriesGrid = document.querySelector('.profile-categories-grid');
    expect(categoriesGrid).toBeInTheDocument();
    
    // Check that actions section exists for responsive button layout
    const actions = document.querySelector('.profile-actions');
    expect(actions).toBeInTheDocument();
    
    // Verify that all responsive containers are properly structured
    expect(gridContainer).toHaveClass('profile-content-grid');
    expect(fieldGrid).toHaveClass('profile-field-grid');
    expect(categoriesGrid).toHaveClass('profile-categories-grid');
    expect(actions).toHaveClass('profile-actions');
  });
});