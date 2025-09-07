import React, { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppRouter } from './components/layout/AppRouter';
import { MemoizedHeader, MemoizedDashboard, MemoizedToastContainer } from './components/ui/MemoizedComponents';
import { useAppStore } from './stores/appStore';
import { useMaxLimits } from './hooks/useMaxLimits';
import { toast } from './stores/toastStore';
import { toast } from './stores/toastStore';

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const { currentView } = useAppStore();
  const [showDashboard, setShowDashboard] = useState(false);

  // Calculate max limits based on available data
  useMaxLimits();

  // Memoized callbacks to prevent unnecessary re-renders
  const handleMenuToggle = useCallback(() => {
    setShowDashboard(prev => !prev);
  }, []);

  const handleDashboardToggle = useCallback(() => {
    setShowDashboard(prev => !prev);
  }, []);

  const handleDashboardClose = useCallback(() => {
    setShowDashboard(false);
  }, []);

  // Handle view changes and cleanup
  useEffect(() => {
    const prevView = sessionStorage.getItem('prevView') || 'menu';
    sessionStorage.setItem('prevView', currentView);

    // Clear toasts when changing views (immediate, no delays)
    if (currentView !== prevView) {
      const learningModes = ['flashcard', 'quiz', 'completion', 'sorting', 'matching'];
      
      if (learningModes.includes(prevView) || learningModes.includes(currentView)) {
        toast.clearOnNavigation();
      }
    }

    // Restore scroll position when returning to menu
    if (currentView === 'menu' && prevView !== 'menu') {
      const savedScroll = sessionStorage.getItem('menuGridScrollPosition');
      if (savedScroll) {
        const scrollPos = parseInt(savedScroll, 10);
        requestAnimationFrame(() => {
          const gridElement = document.querySelector('.menu__grid');
          if (gridElement) {
            gridElement.scrollTop = scrollPos;
          }
        });
      }
    }
  }, [currentView]);

  return (
    <ErrorBoundary>
      <div className="layout-container">
        <MemoizedHeader
          onMenuToggle={handleMenuToggle}
          onDashboardToggle={handleDashboardToggle}
        />

        <main className="layout-main">
          {showDashboard ? (
            <MemoizedDashboard onClose={handleDashboardClose} />
          ) : (
            <AppRouter />
          )}
        </main>

        <MemoizedToastContainer />
      </div>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;