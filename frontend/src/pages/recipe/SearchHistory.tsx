// frontend/src/pages/recipe/SearchHistory.tsx
import React, { useState, useEffect } from 'react';
import { ClockIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getSearchHistory, removeSearchFromHistory, clearSearchHistory } from '../../api/searchHistoryService';

interface SearchHistoryItem {
  id: string;
  term: string;
  filters: object;
  timestamp: string;
}

interface SearchHistoryProps {
  onSelectHistory: (term: string, filters: any) => void;
  isVisible: boolean;
}

const SearchHistory = ({ onSelectHistory, isVisible }: SearchHistoryProps) => {
  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Only load history when the component becomes visible
    if (isVisible) {
      loadSearchHistory();
    }
  }, [isVisible]);

  const loadSearchHistory = async () => {
    setIsLoading(true);
    try {
      console.log("📜 [UI] Loading search history");
      const history = await getSearchHistory();
      setHistoryItems(history);
    } catch (error) {
      console.error("❌ [UI] Error loading search history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // Prevent triggering the parent click
    try {
      console.log(`🗑️ [UI] Removing search history item ${itemId}`);
      await removeSearchFromHistory(itemId);
      // Update the UI immediately
      setHistoryItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("❌ [UI] Error removing search history item:", error);
    }
  };

  const handleClearHistory = async () => {
    try {
      console.log("🧹 [UI] Clearing all search history");
      await clearSearchHistory();
      setHistoryItems([]);
    } catch (error) {
      console.error("❌ [UI] Error clearing search history:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      return 'Unknown date';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute z-10 bg-white rounded-lg shadow-lg border border-gray-200 w-full mt-1 max-h-80 overflow-y-auto">
      <div className="sticky top-0 bg-white p-2 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-gray-600 text-sm font-medium flex items-center">
          <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
          Recent Searches
        </h3>
        {historyItems.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center"
          >
            <TrashIcon className="h-3 w-3 mr-1" />
            Clear All
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-pulse">Loading history...</div>
        </div>
      ) : historyItems.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {historyItems.map((item) => (
            <li 
              key={item.id}
              onClick={() => onSelectHistory(item.term, item.filters)}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center group"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-800">{item.term}</div>
                <div className="text-xs text-gray-500">{formatDate(item.timestamp)}</div>
              </div>
              <button 
                onClick={(e) => handleRemoveItem(e, item.id)}
                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove from history"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-center text-gray-500">
          No search history found
        </div>
      )}
    </div>
  );
};

export default SearchHistory;