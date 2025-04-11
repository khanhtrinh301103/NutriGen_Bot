// frontend/src/api/searchHistoryService.js
import { db, auth } from "./firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

// Maximum number of search history items to store
const MAX_SEARCH_HISTORY_ITEMS = 10;

// Get search history for the current user
export const getSearchHistory = async () => {
  try {
    // Make sure user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("User not authenticated, cannot get search history");
      return [];
    }
    
    const userId = currentUser.uid;
    console.log(`Getting search history for user: ${userId}`);
    
    const historyRef = doc(db, "search_history", userId);
    const docSnap = await getDoc(historyRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`Found ${data.searches?.length || 0} search history items`);
      return data.searches || [];
    } else {
      console.log("No search history found, initializing empty history");
      // Initialize empty search history
      await setDoc(historyRef, { searches: [] });
      return [];
    }
  } catch (error) {
    console.error("Error fetching search history:", error);
    return [];
  }
};

// Add a new search to history
export const addSearchToHistory = async (searchTerm, searchFilters = {}) => {
  try {
    // Skip if search term is empty
    if (!searchTerm || searchTerm.trim() === '') {
      console.log("Empty search term, not adding to history");
      return false;
    }
    
    // Make sure user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("User not authenticated, cannot add to search history");
      return false;
    }
    
    const userId = currentUser.uid;
    const historyRef = doc(db, "search_history", userId);
    const docSnap = await getDoc(historyRef);
    
    // Create search item object with timestamp
    const searchItem = {
      id: Date.now().toString(), // Unique ID for the search
      term: searchTerm,
      filters: searchFilters,
      timestamp: new Date().toISOString()
    };
    
    console.log(`Adding search to history: "${searchTerm}"`);
    
    if (docSnap.exists()) {
      // Get existing searches
      const data = docSnap.data();
      let searches = data.searches || [];
      
      // Remove any existing identical search terms first to avoid duplicates
      searches = searches.filter(item => item.term.toLowerCase() !== searchTerm.toLowerCase());
      
      // Add new search to the beginning of the array
      searches.unshift(searchItem);
      
      // Limit to maximum number of items
      if (searches.length > MAX_SEARCH_HISTORY_ITEMS) {
        searches = searches.slice(0, MAX_SEARCH_HISTORY_ITEMS);
        console.log(`Limited search history to ${MAX_SEARCH_HISTORY_ITEMS} items`);
      }
      
      // Update the document
      await updateDoc(historyRef, { searches });
      
    } else {
      // Create new document with this search as first item
      await setDoc(historyRef, { 
        searches: [searchItem] 
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error adding search to history:", error);
    return false;
  }
};

// Remove a search item from history
export const removeSearchFromHistory = async (searchId) => {
  try {
    // Make sure user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("User not authenticated, cannot remove from search history");
      return false;
    }
    
    const userId = currentUser.uid;
    const historyRef = doc(db, "search_history", userId);
    const docSnap = await getDoc(historyRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      let searches = data.searches || [];
      
      // Find the search item to remove
      const itemToRemove = searches.find(item => item.id === searchId);
      
      if (itemToRemove) {
        console.log(`Removing search item: "${itemToRemove.term}" (ID: ${searchId})`);
        
        // Filter out the item to remove
        const updatedSearches = searches.filter(item => item.id !== searchId);
        
        // Update the document
        await updateDoc(historyRef, { searches: updatedSearches });
        return true;
      } else {
        console.log(`Search item with ID ${searchId} not found`);
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error removing search from history:", error);
    return false;
  }
};

// Clear all search history
export const clearSearchHistory = async () => {
  try {
    // Make sure user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("User not authenticated, cannot clear search history");
      return false;
    }
    
    const userId = currentUser.uid;
    const historyRef = doc(db, "search_history", userId);
    
    console.log("Clearing all search history");
    await setDoc(historyRef, { searches: [] });
    
    return true;
  } catch (error) {
    console.error("Error clearing search history:", error);
    return false;
  }
};