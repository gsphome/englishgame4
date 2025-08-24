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
    setCurrentModule(module);
    setCurrentView(module.learningMode);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading modules</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          English Learning App
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Choose a learning module to get started
        </p>
        
        <div className="max-w-md mx-auto mb-8">
          <SearchBar 
            query={query}
            onQueryChange={setQuery}
            placeholder="Search modules, categories, or topics..."
          />
        </div>
      </div>

      {results.length === 0 && query ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No modules found for "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onClick={() => handleModuleClick(module)}
            />
          ))}
        </div>
      )}

      {query && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {results.length} of {modules.length} modules
        </div>
      )}
    </div>
  );
};