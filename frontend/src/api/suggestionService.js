// frontend/src/api/suggestionService.js
import ingredientSuggestions from '../utils/ingredientSuggestions';

/**
 * Get search suggestions based on user input
 * @param {string} searchTerm - The current search input
 * @param {number} maxResults - Maximum number of suggestions to return
 * @returns {string[]} - Array of search suggestions
 */
export const getSearchSuggestions = (searchTerm, maxResults = 5) => {
  // Return empty array if search term is empty or too short
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }
  
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  console.log(`🔍 [Suggestions] Finding matches for: "${normalizedSearchTerm}"`);
  
  // Filter suggestions that include the search term
  const matchingSuggestions = ingredientSuggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(normalizedSearchTerm)
  );
  
  // Sort suggestions: exact matches first, then starting with the term, then rest
  const sortedSuggestions = matchingSuggestions.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    // Exact match goes first
    if (aLower === normalizedSearchTerm) return -1;
    if (bLower === normalizedSearchTerm) return 1;
    
    // Then terms starting with the search term
    const aStartsWith = aLower.startsWith(normalizedSearchTerm);
    const bStartsWith = bLower.startsWith(normalizedSearchTerm);
    
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    // Then alphabetical order
    return aLower.localeCompare(bLower);
  });
  
  // Limit results
  const limitedResults = sortedSuggestions.slice(0, maxResults);
  console.log(`✅ [Suggestions] Found ${limitedResults.length} suggestions`);
  
  return limitedResults;
};

/**
 * Highlight the matching part of the suggestion
 * @param {string} suggestion - The full suggestion
 * @param {string} searchTerm - The search term to highlight
 * @returns {object} - Object with parts of the suggestion to render
 */
export const highlightMatch = (suggestion, searchTerm) => {
  if (!searchTerm) return { before: suggestion, match: '', after: '' };
  
  const normalizedSuggestion = suggestion.toLowerCase();
  const normalizedSearchTerm = searchTerm.toLowerCase();
  
  const startIndex = normalizedSuggestion.indexOf(normalizedSearchTerm);
  
  if (startIndex === -1) return { before: suggestion, match: '', after: '' };
  
  const endIndex = startIndex + normalizedSearchTerm.length;
  
  return {
    before: suggestion.substring(0, startIndex),
    match: suggestion.substring(startIndex, endIndex),
    after: suggestion.substring(endIndex)
  };
};