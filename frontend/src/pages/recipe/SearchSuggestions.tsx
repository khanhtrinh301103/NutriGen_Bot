// frontend/src/pages/recipe/SearchSuggestions.tsx
import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { highlightMatch } from '../../api/suggestionService';

interface SearchSuggestionsProps {
  suggestions: string[];
  searchTerm: string;
  onSelectSuggestion: (suggestion: string) => void;
  isVisible: boolean;
}

const SearchSuggestions = ({ 
  suggestions, 
  searchTerm, 
  onSelectSuggestion,
  isVisible
}: SearchSuggestionsProps) => {
  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="absolute z-10 bg-white rounded-lg shadow-lg border border-gray-200 w-full mt-1 max-h-80 overflow-y-auto">
      <ul className="divide-y divide-gray-100">
        {suggestions.map((suggestion, index) => {
          const { before, match, after } = highlightMatch(suggestion, searchTerm);
          
          return (
            <li 
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span>
                  {before}<span className="font-semibold">{match}</span>{after}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SearchSuggestions;