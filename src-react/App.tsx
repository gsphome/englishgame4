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
  
  // Load module data when needed
  const { data: moduleData, isLoading, error } = useModuleData(
    currentModule?.id || 'flashcard-ielts-general'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading module</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuToggle={() => setShowDashboard(!showDashboard)}
        onDashboardToggle={() => setShowDashboard(!showDashboard)}
      />
      
      <main className="container mx-auto px-4 py-8">
        {showDashboard ? (
          <Dashboard />
        ) : currentView === 'menu' ? (
          <MainMenu />
        ) : null}
        
        {currentView === 'flashcard' && (currentModule || moduleData) && (
          <FlashcardComponent module={currentModule || moduleData!} />
        )}
        
        {currentView === 'quiz' && (currentModule || moduleData) && (
          <QuizComponent module={currentModule || moduleData!} />
        )}
        
        {currentView === 'completion' && (currentModule || moduleData) && (
          <CompletionComponent module={currentModule || moduleData!} />
        )}
        
        {currentView === 'sorting' && (currentModule || moduleData) && (
          <SortingComponent module={currentModule || moduleData!} />
        )}
        
        {currentView === 'matching' && (currentModule || moduleData) && (
          <MatchingComponent module={currentModule || moduleData!} />
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