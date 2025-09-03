import React, { useId } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  query, 
  onQueryChange, 
  placeholder = "Search modules...",
  disabled = false
}) => {
  const searchId = useId();
  const clearButtonId = useId();

  return (
    <div className="search" role="search">
      <label htmlFor={searchId} className="sr-only">
        Search learning modules
      </label>
      <div className="search__icon" aria-hidden="true">
        <Search className="search__icon-svg" />
      </div>
      <input
        id={searchId}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="search__input"
        placeholder={placeholder}
        disabled={disabled}
        aria-describedby={query ? clearButtonId : undefined}
        aria-label="Search learning modules by name, category, or topic"
      />
      {query && !disabled && (
        <button
          id={clearButtonId}
          onClick={() => onQueryChange('')}
          className="search__clear"
          aria-label={`Clear search query: ${query}`}
          type="button"
        >
          <X className="search__clear-icon" />
        </button>
      )}
    </div>
  );
};