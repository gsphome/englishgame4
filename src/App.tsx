import React, { useState, useEffect, Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/ui/Header';
import { MainMenu } from './components/ui/MainMenu';
import { Dashboard } from './components/ui/Dashboard';
import { ToastContainer } from './components/ui/ToastContainer';
import { useAppStore } from './stores/appStore';
import { useModuleData } from './hooks/useModuleData';
import { useMaxLimits } from './hooks/useMaxLimits';
import { toast } from './stores/toastStore';

// Lazy load learning components
const FlashcardComponent = lazy(() => import('./components/learning/FlashcardComponent'));
const QuizComponent = lazy(() => import('./components/learning/QuizComponent'));
const CompletionComponent = lazy(() => import('./components/learning/CompletionComponent'));
const SortingComponent = lazy(() => import('./components/learning/SortingComponent'));
const MatchingComponent = lazy(() => import('./components/learning/MatchingComponent'));

const DEFAULT_MODULE_ID = 'flashcard-ielts-general';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

// Loading component for Suspense
const ComponentLoader: React.FC = () => (
  <div className="loading">
    <div>
      <div className="loading__spinner"></div>
      <p className="loading__text">Loading component...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { currentView, currentModule } = useAppStore();
  const [showDashboard, setShowDashboard] = useState(false);

  // Calculate max limits based on available data
  useMaxLimits();

  // Restore scroll position when returning to menu and clean up toasts
  useEffect(() => {
    const prevView = sessionStorage.getItem('prevView') || 'menu';
    sessionStorage.setItem('prevView', currentView);

    // Clear game-related toasts immediately when changing views
    if (currentView !== prevView) {
      const learningModes = ['flashcard', 'quiz', 'completion', 'sorting', 'matching'];
      
      // Clear ALL toasts from learning modes when exiting them
      if (learningModes.includes(prevView)) {
        // Small delay to ensure store is initialized
        setTimeout(() => {
          toast.clearGameToasts();
        }, 10);
      }
      
      // Also clear when entering a learning mode (clean slate)
      if (learningModes.includes(currentView)) {
        setTimeout(() => {
          toast.clearGameToasts();
        }, 10);
      }
      
      // Special case: when going to menu from any learning mode
      if (currentView === 'menu' && learningModes.includes(prevView)) {
        // Extra cleanup to ensure no lingering toasts
        setTimeout(() => {
          toast.clearGameToasts();
        }, 50);
      }
    }

    if (currentView === 'menu' && prevView !== 'menu') {
      const savedScroll = sessionStorage.getItem('menuGridScrollPosition');
      if (savedScroll) {
        const scrollPos = parseInt(savedScroll, 10);
        const waitForGrid = () => {
          const gridElement = document.querySelector('.menu__grid');
          if (gridElement) {
            gridElement.scrollTop = scrollPos;
          } else {
            setTimeout(waitForGrid, 50);
          }
        };
        setTimeout(waitForGrid, 0);
      }
    }
  }, [currentView]);

  // Always call useModuleData to avoid hooks rule violation
  const moduleId = currentModule?.id || DEFAULT_MODULE_ID;

  const { data: moduleData, isLoading, error } = useModuleData(moduleId);

  // Use fetched moduleData (which has the actual data) if available, otherwise use currentModule
  const actualModuleData = moduleData || currentModule;

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
          <Dashboard onClose={() => setShowDashboard(false)} />
        ) : (
          <>
            {currentView === 'menu' && <MainMenu />}
            <Suspense fallback={<ComponentLoader />}>
              {currentView === 'flashcard' && actualModuleData && <FlashcardComponent module={actualModuleData} />}
              {currentView === 'quiz' && actualModuleData && <QuizComponent module={actualModuleData} />}
              {currentView === 'completion' && actualModuleData && <CompletionComponent module={actualModuleData} />}
              {currentView === 'sorting' && actualModuleData && <SortingComponent module={actualModuleData} />}
              {currentView === 'matching' && actualModuleData && <MatchingComponent module={actualModuleData} />}
            </Suspense>
          </>
        )}
      </main>

      {/* Toast Notifications */}
      <ToastContainer />
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