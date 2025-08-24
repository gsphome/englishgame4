import React from 'react';
import { BookOpen, Target, PenTool, ArrowUpDown, Link } from 'lucide-react';
import type { LearningModule } from '../types';

interface ModuleCardProps {
  module: LearningModule;
  onClick: () => void;
}

const getIcon = (mode: string) => {
  const icons = {
    flashcard: BookOpen,
    quiz: Target,
    completion: PenTool,
    sorting: ArrowUpDown,
    matching: Link
  };
  return icons[mode as keyof typeof icons] || BookOpen;
};

const getColor = (mode: string) => {
  const colors = {
    flashcard: 'bg-blue-600',
    quiz: 'bg-green-600',
    completion: 'bg-purple-600',
    sorting: 'bg-orange-600',
    matching: 'bg-pink-600'
  };
  return colors[mode as keyof typeof colors] || 'bg-gray-600';
};

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const Icon = getIcon(module.learningMode);
  const colorClass = getColor(module.learningMode);

  return (
    <button
      onClick={onClick}
      className={`${colorClass} text-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left w-full`}
    >
      <div className="flex items-start justify-between mb-4">
        <Icon className="h-8 w-8" />
        <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
          {module.level}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
        {module.name}
      </h3>
      
      {module.description && (
        <p className="text-sm opacity-90 mb-3 line-clamp-2">
          {module.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs opacity-75">
        <span>{module.category}</span>
        <span>{module.estimatedTime}min</span>
      </div>
    </button>
  );
};