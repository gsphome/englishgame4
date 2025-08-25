import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/ui/Header';
import { MainMenu } from './components/ui/MainMenu';
import { Dashboard } from './components/ui/Dashboard';
import { FlashcardComponent } from './components/learning/FlashcardComponent';
import { QuizComponent } from './components/learning/QuizComponent';
import { CompletionComponent } from './components/learning/CompletionComponent';
import { SortingComponent } from './components/learning/SortingComponent';
import { MatchingComponent } from './components/learning/MatchingComponent';
import { useAppStore } from './stores/appStore';
import { useModuleData } from './hooks/useModuleData';

const DEFAULT_MODULE_ID = 'flashcard-ielts-general';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

const AppContent: React.FC = () => {
  const { currentView, currentModule } = useAppStore();
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Always call useModuleData to avoid hooks rule violation
  const moduleId = currentModule?.id || DEFAULT_MODULE_ID;
  
  console.log('App.tsx - currentView:', currentView);
  console.log('App.tsx - currentModule:', currentModule);
  console.log('App.tsx - moduleId:', moduleId);
    
  const { data: moduleData, isLoading, error } = useModuleData(moduleId);
  
  console.log('App.tsx - moduleData:', moduleData);
  
  // Only use data when we actually need a module
  const needsModuleData = ['flashcard', 'quiz', 'completion', 'sorting', 'matching'].includes(currentView);
  const shouldShowLoading = needsModuleData && isLoading;
  const shouldShowError = needsModuleData && error;
  


  if (shouldShowLoading) {
    return (
      <div className="loading">
        <div>
          <div className="loading__spinner"></div>
          <p className="loading__text">Loading...</p>
        </div>
      </div>
    );
  }

  if (shouldShowError) {
    return (
      <div className="error">
        <div>
          <p className="error__message">Error loading module: {moduleId}</p>
          <p className="error__details">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn--primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-container">
      <Header 
        onMenuToggle={() => setShowDashboard(!showDashboard)}
        onDashboardToggle={() => setShowDashboard(!showDashboard)}
      />
      
      <main className="layout-main">
        {showDashboard ? (
          <Dashboard />
        ) : (
          <>
            {currentView === 'menu' && <MainMenu />}
            {currentView === 'flashcard' && moduleData && <FlashcardComponent module={moduleData} />}
            {currentView === 'quiz' && moduleData && <QuizComponent module={moduleData} />}
            {currentView === 'completion' && moduleData && <CompletionComponent module={moduleData} />}
            {currentView === 'sorting' && moduleData && <SortingComponent module={moduleData} />}
            {currentView === 'matching' && moduleData && <MatchingComponent module={moduleData} />}
          </>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;