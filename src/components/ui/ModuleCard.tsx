import React from 'react';
import { CreditCard, HelpCircle, PenTool, BarChart3, Link } from 'lucide-react';
import type { LearningModule } from '../../types';

interface ModuleCardProps {
  module: LearningModule;
  onClick: () => void;
}

const getIcon = (learningMode: string) => {
  const iconProps = { size: 20, strokeWidth: 2 };
  
  const icons: Record<string, JSX.Element> = {
    flashcard: <CreditCard {...iconProps} />,
    quiz: <HelpCircle {...iconProps} />,
    completion: <PenTool {...iconProps} />,
    sorting: <BarChart3 {...iconProps} />,
    matching: <Link {...iconProps} />
  };
  return icons[learningMode] || <CreditCard {...iconProps} />;
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