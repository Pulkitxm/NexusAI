"use client";

import { memo } from "react";

import type { SearchSuggestion } from "../../types/model-selector";

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSuggestionClick: (query: string) => void;
  currentQuery: string;
}

export const SearchSuggestions = memo<SearchSuggestionsProps>(({ suggestions, onSuggestionClick, currentQuery }) => {
  if (currentQuery.trim()) return null;

  return (
    <div className="border-b border-gray-100 p-4 dark:border-gray-800">
      <div className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">Quick searches</div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => {
          const SuggestionIcon = suggestion.icon;
          return (
            <button
              key={suggestion.query}
              onClick={() => onSuggestionClick(suggestion.query)}
              className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 transition-all duration-200 hover:scale-105 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <SuggestionIcon className="h-3.5 w-3.5" />
              {suggestion.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

SearchSuggestions.displayName = "SearchSuggestions";
