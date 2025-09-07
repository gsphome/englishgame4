import React, { Suspense, lazy } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useModuleData } from '../../hooks/useModuleData';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { MainMenu } from '../ui/MainMenu';
import type { LearningModule } from '../../types';

// Lazy load learning components with better error handling
const FlashcardComponent = lazy(() => 
  import('../learning/FlashcardComponent').then(module => ({
    default: module.default
  })).catch(() => ({
    default: () => <div className="error">Failed to load Flashcard component</div>
  }))
);

const QuizComponent = lazy(() => 
  import('../learning/QuizComponent').then(module => ({
    default: module.default
  })).catch(() => ({
    default: () => <div className="error">Failed to load Quiz component</div>
  }))
);

const CompletionComponent = lazy(() => 
  import('../learning/CompletionComponent').then(module => ({
    default: module.default
  })).catch(() => ({
    default: () => <div className="error">Failed to load Completion component</div>
  }))
);

const SortingComponent = lazy(() => 
  import('../learning/SortingComponent').then(module => ({
    default: module.default
  })).catch(() => ({
    default: () => <div className="error">Failed to load Sorting component</div>
  }))
);

const MatchingComponent = lazy(() => 
  import('../learning/MatchingComponent').then(module => ({
    default: module.default
  })).catch(() => ({
    default: () => <div className="error">Failed to load Matching component</div>
  }))
);

// Enhanced loading component
const ComponentLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSkeleton />
  </div>
);

// Error component for module loading failures
const ModuleError: React.FC<{ error: Error; moduleId: string; onRetry: () => void }> = ({ 
  error, 
  moduleId, 
  onRetry 
}) => (
  <div className="max-w-2xl mx-auto p-6 text-center">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Failed to load module: {moduleId}
      </h3>
      <p className="text-red-600 mb-4">{error.message}</p>
      <div className="space-x-4">
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  </div>
);

interface LearningComponentWrapperProps {
  moduleId: string;
  children: (module: LearningModule) => React.ReactNode;
}

// Wrapper component to handle module data loading
const LearningComponentWrapper: React.FC<LearningComponentWrapperProps> = ({ 
  moduleId, 
  children 
}) => {
  const { data: moduleData, isLoading, error, refetch } = useModuleData(moduleId);

  if (isLoading) {
    return <ComponentLoader />;
  }

  if (error) {
    return (
      <ModuleError 
        error={error as Error} 
        moduleId={moduleId} 
        onRetry={() => refetch()} 
      />
    );
  }

  if (!moduleData) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-600">No module data available</p>
      </div>
    );
  }

  return <>{children(moduleData)}</>;
};

export const AppRouter: React.FC = () => {
  const { currentView, currentModule } = useAppStore();
  console.log('AppRouter rendered:', { currentView, currentModule });

  // Return menu for menu view
  if (currentView === 'menu') {
    console.log('Rendering MainMenu');
    return <MainMenu />;
  }

  // For learning modes, we need a module
  const moduleId = currentModule?.id;
  if (!moduleId) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-600 mb-4">No module selected</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  return (
    <Suspense fallback={<ComponentLoader />}>
      <LearningComponentWrapper moduleId={moduleId}>
        {(module) => {
          switch (currentView) {
            case 'flashcard':
              return <FlashcardComponent module={module} />;
            case 'quiz':
              return <QuizComponent module={module} />;
            case 'completion':
              return <CompletionComponent module={module} />;
            case 'sorting':
              return <SortingComponent module={module} />;
            case 'matching':
              return <MatchingComponent module={module} />;
            default:
              return (
                <div className="max-w-2xl mx-auto p-6 text-center">
                  <p className="text-gray-600">Unknown view: {currentView}</p>
                </div>
              );
          }
        }}
      </LearningComponentWrapper>
    </Suspense>
  );
};