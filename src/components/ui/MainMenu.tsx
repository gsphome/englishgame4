import React from 'react';
import { SearchBar } from './SearchBar';
import { ModuleCard } from './ModuleCard';
import { useAllModules } from '../../hooks/useModuleData';
import { useSearch } from '../../hooks/useSearch';
import { useAppStore } from '../../stores/appStore';

export const MainMenu: React.FC = () => {
  const { data: modules = [], isLoading, error } = useAllModules();
  const { query, setQuery, results } = useSearch(modules);
  const { setCurrentModule, setCurrentView } = useAppStore();

  const handleModuleClick = (module: any) => {
    // Save scroll position before changing view
    const gridElement = document.querySelector('.menu__grid');
    if (gridElement) {
      sessionStorage.setItem('menuGridScrollPosition', gridElement.scrollTop.toString());
    }
    
    setCurrentModule(module);
    setCurrentView(module.learningMode);
  };

  if (isLoading) {
    return (
      <div className="menu">
        <div className="loading">
          <div>
            <div className="loading__spinner"></div>
            <p className="loading__text">Loading modules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu">
        <div className="error">
          <p className="error__message">Error loading modules</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn--primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu">
      <div className="menu__search">
        <SearchBar 
          query={query}
          onQueryChange={setQuery}
          placeholder="Search modules, categories, or topics..."
        />
      </div>

      {results.length === 0 && query ? (
        <div className="menu__no-results">
          <p className="menu__no-results-text">No modules found for "{query}"</p>
        </div>
      ) : (
        <div className="menu__grid">
          <div className="menu__grid-container">
            {results.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onClick={() => handleModuleClick(module)}
              />
            ))}
          </div>
        </div>
      )}

      {query && results.length > 0 && (
        <div className="menu__results-count">
          Showing {results.length} of {modules.length} modules
        </div>
      )}
    </div>
  );
};