import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  query, 
  onQueryChange, 
  placeholder = "Search modules..." 
}) => {
  return (
    <div className="search">
      <div className="search__icon">
        <Search className="search__icon-svg" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="search__input"
        placeholder={placeholder}
      />
      {query && (
        <button
          onClick={() => onQueryChange('')}
          className="search__clear"
        >
          <X className="search__clear-icon" />
        </button>
      )}
    </div>
  );
};