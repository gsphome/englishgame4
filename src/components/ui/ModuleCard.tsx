import React from 'react';
import type { LearningModule } from '../../types';

interface ModuleCardProps {
  module: LearningModule;
  onClick: () => void;
}

const getIcon = (learningMode: string): string => {
  const icons: Record<string, string> = {
    flashcard: '🎴',
    quiz: '❓',
    completion: '✍️',
    sorting: '📊',
    matching: '🔗'
  };
  return icons[learningMode] || '📚';
};

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const difficultyLevel = module.level?.[0]?.toUpperCase() || 'B1';
  
  return (
    <button 
      className={`module-card module-card--${module.learningMode}`}
      onClick={onClick}
    >
      <div className="module-card__icon">
        {getIcon(module.learningMode)}
      </div>
      <h3 className="module-card__title">
        {module.name}
      </h3>
      <div className="module-card__meta">
        {difficultyLevel}
      </div>
    </button>
  );
};