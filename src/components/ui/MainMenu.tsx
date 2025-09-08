import React, { useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { ModuleCard } from './ModuleCard';
import { ModuleGridSkeleton } from './LoadingSkeleton';
import { useAllModules } from '../../hooks/useModuleData';
import { useSearch } from '../../hooks/useSearch';
import { useAppStore } from '../../stores/appStore';
import { toast } from '../../stores/toastStore';

export const MainMenu: React.FC = () => {
  const { data: modules = [], isLoading, error } = useAllModules();
  const { query, setQuery, results } = useSearch(modules);
  const { setCurrentModule, setCurrentView } = useAppStore();

  // Show welcome toast when modules are loaded (only once per session)
  useEffect(() => {
    if (modules.length > 0 && !isLoading) {
      toast.welcomeOnce(modules.length);
    }
  }, [modules.length, isLoading]);

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast.error('Error de conexión', 'No se pudieron cargar los módulos. Verifica tu conexión.', {
        action: {
          label: 'Reintentar',
          onClick: () => window.location.reload()
        }
      });
    }
  }, [error]);

  const handleModuleClick = (module: any) => {
    // Save scroll position before changing view
    const gridElement = document.querySelector('.main-menu__grid');
    if (gridElement) {
      sessionStorage.setItem('menuGridScrollPosition', gridElement.scrollTop.toString());
    }
    
    // Show toast when starting a module
    const modeLabels: Record<string, string> = {
      flashcard: 'Flashcards',
      quiz: 'Quiz',
      completion: 'Completar oraciones',
      sorting: 'Ejercicio de clasificación',
      matching: 'Ejercicio de emparejamiento'
    };
    
    toast.info('Iniciando módulo', `${module.name} - ${modeLabels[module.learningMode] || 'Ejercicio'}`, { duration: 1500 });
    
    setCurrentModule(module);
    setCurrentView(module.learningMode);
  };

  if (isLoading) {
    return (
      <div className="main-menu">
        <div className="main-menu__search">
          <SearchBar 
            query=""
            onQueryChange={() => {}}
            placeholder="Search modules, categories, or topics..."
            disabled={true}
          />
        </div>
        <ModuleGridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-menu">
        <div className="main-menu__error" role="alert">
          <p className="main-menu__error-text">Error loading modules</p>
          <p className="main-menu__error-text">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="main-menu__error-btn"
            aria-label="Retry loading modules"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-menu">
      <div className="main-menu__search">
        <SearchBar 
          query={query}
          onQueryChange={setQuery}
          placeholder="Search modules, categories, or topics..."
        />
      </div>

      {results.length === 0 && query ? (
        <div className="main-menu__no-results" role="status" aria-live="polite">
          <p className="main-menu__no-results-text">
            No modules found for "<strong>{query}</strong>"
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Try adjusting your search terms or browse all available modules.
          </p>
        </div>
      ) : (
        <div className="main-menu__grid">
          <div 
            className="main-menu__grid-container"
            role="grid"
            aria-label={`${results.length} learning modules available`}
          >
            {results.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                onClick={() => handleModuleClick(module)}
                tabIndex={0}
                role="gridcell"
                aria-posinset={index + 1}
                aria-setsize={results.length}
              />
            ))}
          </div>
        </div>
      )}

      {query && results.length > 0 && (
        <div 
          className="main-menu__results-count"
          role="status"
          aria-live="polite"
        >
          Showing <strong>{results.length}</strong> of <strong>{modules.length}</strong> modules
        </div>
      )}
    </div>
  );
};