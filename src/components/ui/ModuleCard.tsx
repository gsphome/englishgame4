import React from 'react';
import { CreditCard, HelpCircle, PenTool, BarChart3, Link } from 'lucide-react';
import type { LearningModule } from '../../types';

interface ModuleCardProps {
  module: LearningModule;
  onClick: (module: LearningModule) => void;
  tabIndex?: number;
  role?: string;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
}

const getIcon = (learningMode: string) => {
  const iconProps = { size: 20, strokeWidth: 2 };
  
  const icons: Record<string, React.ReactElement> = {
    flashcard: <CreditCard {...iconProps} />,
    quiz: <HelpCircle {...iconProps} />,
    completion: <PenTool {...iconProps} />,
    sorting: <BarChart3 {...iconProps} />,
    matching: <Link {...iconProps} />
  };
  return icons[learningMode] || <CreditCard {...iconProps} />;
};

const getLearningModeLabel = (learningMode: string): string => {
  const labels: Record<string, string> = {
    flashcard: 'Flashcards',
    quiz: 'Quiz',
    completion: 'Fill in the blanks',
    sorting: 'Sorting exercise',
    matching: 'Matching exercise'
  };
  return labels[learningMode] || 'Learning exercise';
};

export const ModuleCard: React.FC<ModuleCardProps> = ({ 
  module, 
  onClick, 
  tabIndex,
  role,
  'aria-posinset': ariaPosinset,
  'aria-setsize': ariaSetsize
}) => {
  const difficultyLevel = module.level && Array.isArray(module.level) && module.level.length > 0 
    ? module.level.map((l: string) => l.toUpperCase()).join('/') 
    : 'B1';
  
  const learningModeLabel = getLearningModeLabel(module.learningMode);
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(module);
    }
  };
  
  return (
    <button 
      className={`module-card module-card--${module.learningMode}`}
      onClick={() => onClick(module)}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      role={role}
      aria-posinset={ariaPosinset}
      aria-setsize={ariaSetsize}
      aria-label={`${module.name} - ${learningModeLabel} - Difficulty level ${difficultyLevel}`}
      title={`Start ${learningModeLabel.toLowerCase()}: ${module.name} (Level: ${difficultyLevel})`}
    >
      <div className="module-card__icon" aria-hidden="true">
        {getIcon(module.learningMode)}
      </div>
      <h3 className="module-card__title">
        {module.name}
      </h3>
      <div 
        className="module-card__meta" 
        aria-label={`Difficulty level: ${difficultyLevel}`}
      >
        {difficultyLevel}
      </div>
    </button>
  );
};