import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ModuleCard } from '../../../../src/components/ui/ModuleCard';
import type { LearningModule } from '../../../../src/types';

const mockModule: LearningModule = {
  id: 'test-module',
  name: 'Test Module',
  learningMode: 'flashcard',
  level: ['b1'],
  category: 'Vocabulary',
  description: 'Test description',
  data: []
};

describe('ModuleCard', () => {
  it('renders module information correctly', () => {
    const mockOnClick = vi.fn();
    
    render(
      <ModuleCard 
        module={mockModule} 
        onClick={mockOnClick}
      />
    );
    
    // Check that the module name is rendered
    expect(screen.getByText('Test Module')).toBeInTheDocument();
    
    // Check that the difficulty level is rendered
    expect(screen.getByText('B1')).toBeInTheDocument();
    
    // Check that the button has the correct CSS classes for contrast
    const button = screen.getByRole('button');
    expect(button).toHaveClass('module-card');
    expect(button).toHaveClass('module-card--flashcard');
  });

  it('applies correct accessibility attributes', () => {
    const mockOnClick = vi.fn();
    
    render(
      <ModuleCard 
        module={mockModule} 
        onClick={mockOnClick}
        tabIndex={0}
        role="button"
        aria-posinset={1}
        aria-setsize={5}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-posinset', '1');
    expect(button).toHaveAttribute('aria-setsize', '5');
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  it('handles different learning modes correctly', () => {
    const mockOnClick = vi.fn();
    const quizModule = { ...mockModule, learningMode: 'quiz' as const };
    
    render(
      <ModuleCard 
        module={quizModule} 
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('module-card--quiz');
  });
});