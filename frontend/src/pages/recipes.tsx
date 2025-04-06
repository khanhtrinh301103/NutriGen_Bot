import React, { useState, useEffect } from "react";
import Header from "./components/common/header";
import Footer from "./components/common/footer";
import Filter from "../pages/recipe/Filter";
import { sendSearchRequest } from "../api/getRecipe";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import RecipeCard from "../pages/recipe/RecipeCard";
import ProtectedRoute from "../api/ProtectedRoute";
import ProfileRouteGuard from "./components/common/ProfileRouteGuard";

// Define a Recipe interface to ensure type safety
interface Recipe {
  id: number;
  title: string;
  image: string;
  calories: number;
  protein?: number;
  fat?: number;
}

// Define interface for search state
interface SearchState {
  searchTerm: string;
  cuisine: string;
  results: Recipe[];
  currentPage: number;
  nutritionMode: boolean; // Add nutritionMode to search state
}

const RecipesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ cuisine: "" });
  const [results, setResults] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchRestored, setSearchRestored] = useState(false); // Track if search was restored
  const [nutritionMode, setNutritionMode] = useState(false); // State for nutrition mode toggle
  const cardsPerPage = 12; // Show 12 cards per page
  
  // Load saved search state when component mounts
  useEffect(() => {
    console.log("🔍 [UI] Checking for saved search state");
    
    const savedSearchState = localStorage.getItem('recipeSearchState');
    if (savedSearchState) {
      try {
        const parsedState = JSON.parse(savedSearchState);
        console.log("✅ [UI] Found saved search state:", parsedState);
        
        // Restore saved state
        setSearchTerm(parsedState.searchTerm || "");
        setFilters({ cuisine: parsedState.cuisine || "" });
        
        // Restore nutrition mode if it exists in saved state
        if (parsedState.nutritionMode !== undefined) {
          setNutritionMode(parsedState.nutritionMode);
          console.log("📊 [UI] Nutrition mode restored:", parsedState.nutritionMode);
        }
        
        // Only set results if there are any
        if (parsedState.results && parsedState.results.length > 0) {
          setResults(parsedState.results);
          setCurrentPage(parsedState.currentPage || 1);
          setSearchRestored(true);
          console.log("✅ [UI] Successfully restored search results");
        }
      } catch (error) {
        console.error("❌ [UI] Error parsing saved search state:", error);
        localStorage.removeItem('recipeSearchState');
      }
    } else {
      console.log("ℹ️ [UI] No saved search state found");
    }
  }, []);
  
  // Effect to handle animations when results change
  useEffect(() => {
    if (isSearching) {
      console.log("🔄 [UI] Search completed with", results.length, "results");
      setIsLoading(false);
      // Reset to page 1 when new search results come in
      setCurrentPage(1);
    }
  }, [results, isSearching]);

  // Save search state whenever it changes
  useEffect(() => {
    // Only save if we have actual search results to prevent overwriting with empty state
    if (results.length > 0) {
      const searchState: SearchState = {
        searchTerm,
        cuisine: filters.cuisine,
        results,
        currentPage,
        nutritionMode // Include nutrition mode in saved state
      };
      
      console.log("💾 [UI] Saving search state to localStorage");
      localStorage.setItem('recipeSearchState', JSON.stringify(searchState));
    }
  }, [searchTerm, filters.cuisine, results, currentPage, nutritionMode]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    console.log("📝 [UI] User typing search keyword:", e.target.value);
  };

  const handleFilterChange = (updatedFilters: any) => {
    setFilters(updatedFilters);
    console.log("🧩 [UI] Filters updated:", updatedFilters);
  };

  const toggleNutritionMode = () => {
    const newMode = !nutritionMode;
    setNutritionMode(newMode);
    console.log("📊 [UI] Nutrition mode toggled:", newMode);
  };

  const performSearch = () => {
    if (!searchTerm.trim() && !filters.cuisine) {
      console.log("⚠️ [UI] Search cancelled: No search criteria provided");
      return;
    }
    
    console.log("🔎 [UI] Performing search with keyword:", searchTerm, "and filter:", filters);
    console.log("📊 [UI] Nutrition mode active:", nutritionMode);
    
    // Set loading state and trigger fade-out effect
    setIsLoading(true);
    setIsSearching(true);
    
    // Clear previous results for better animation effect
    setResults([]);
    
    // Small delay to show loading effect
    setTimeout(() => {
      sendSearchRequest(searchTerm, filters.cuisine, (newResults) => {
        console.log(`✅ [UI] Search complete. Found ${newResults.length} recipes.`);
        
        // Log first recipe to check if it has ID
        if (newResults.length > 0) {
          console.log("🔢 [UI] First recipe ID check:", newResults[0].id);
        }
        
        setResults(newResults);
        // Mark that this is a new search, not a restored one
        setSearchRestored(false);
      });
    }, 500);
  };

  const handleSearchClick = () => {
    performSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log("⌨️ [UI] Enter key pressed for search");
      performSearch();
    }
  };
  
  // Get current page recipes
  const indexOfLastRecipe = currentPage * cardsPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - cardsPerPage;
  const currentRecipes = results.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(results.length / cardsPerPage);
  
  // Function to change page
  const paginate = (pageNumber: number) => {
    console.log("📄 [UI] Changed to page:", pageNumber);
    setCurrentPage(pageNumber);
    // Scroll to top of results
    window.scrollTo({
      top: (document.querySelector('.results-container') as HTMLElement)?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  // Function to clear previous search
  const clearPreviousSearch = () => {
    console.log("🧹 [UI] Clearing previous search");
    localStorage.removeItem('recipeSearchState');
    setSearchTerm("");
    setFilters({ cuisine: "" });
    setResults([]);
    setCurrentPage(1);
    setSearchRestored(false);
  };

  return (
    <ProtectedRoute>
      <ProfileRouteGuard>
        <>
          <Header />
          <main className="w-full mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-[#4b7e53]">Find Your Recipe</h1>

            {/* Search bar container with nutrition mode toggle */}
            <div className="mb-6 md:mb-8 px-2 sm:px-4 md:max-w-2xl md:mx-auto">
              {/* Search bar row with toggle */}
              <div className="flex items-center justify-between gap-2">
                {/* Search input with icon */}
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for recipes..."
                    className="w-full p-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4b7e53]"
                  />
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b7e53] hover:text-green-800"
                    onClick={handleSearchClick}
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Nutrition Mode Toggle Button */}
                <div className="flex items-center shrink-0">
                  <span className="text-sm mr-2 text-gray-600 hidden sm:inline">Nutrition Mode</span>
                  <button
                    onClick={toggleNutritionMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4b7e53] focus:ring-offset-2 ${
                      nutritionMode ? 'bg-[#4b7e53]' : 'bg-gray-200'
                    }`}
                    aria-label="Toggle Nutrition Mode"
                  >
                    <span className="sr-only">Toggle Nutrition Mode</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        nutritionMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {/* Mobile text label for nutrition mode (only shows on small screens) */}
              <div className="flex sm:hidden justify-end mt-1">
                <span className="text-xs text-gray-600">Nutrition Mode</span>
              </div>
            </div>

            {/* Search restored notification */}
            {searchRestored && results.length > 0 && (
              <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded mx-2 sm:mx-4 md:max-w-3xl md:mx-auto text-sm flex justify-between items-center">
                <span>Showing your previous search results.</span>
                <button 
                  onClick={clearPreviousSearch}
                  className="text-blue-600 hover:text-blue-800 underline text-xs font-medium"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Nutrition Mode active indicator */}
            {nutritionMode && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded mx-2 sm:mx-4 md:max-w-3xl md:mx-auto text-sm">
                <span>Nutrition Mode is active. Recipes will display detailed nutritional information.</span>
              </div>
            )}

            {/* Responsive layout that adapts to all screen sizes */}
            <div className="flex flex-col md:flex-row">
              {/* Filter sidebar - full width on mobile, fixed width on larger screens */}
              <div className="w-full md:w-64 shrink-0 mb-6 md:mb-0">
                <Filter 
                  onChange={handleFilterChange} 
                  initialCuisine={filters.cuisine} // Pass the initial cuisine value
                />
              </div>

              {/* Results area taking all available space */}
              <div className="w-full min-h-[400px] results-container px-2 sm:px-4 md:px-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4b7e53]"></div>
                  </div>
                ) : results.length > 0 ? (
                  <>
                    <div className="text-sm text-gray-500 mb-4">
                      {results.length} {results.length === 1 ? 'recipe' : 'recipes'} found
                      {filters.cuisine && ` for "${filters.cuisine}" cuisine`}
                      {searchTerm && ` matching "${searchTerm}"`}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                      {currentRecipes.map((recipe, idx) => (
                        <RecipeCard 
                          key={`${recipe.id || idx}`}
                          id={recipe.id} // Explicitly passing id prop
                          image={recipe.image}
                          title={recipe.title}
                          calories={recipe.calories}
                          protein={recipe.protein}
                          fat={recipe.fat}
                        />
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {results.length > cardsPerPage && (
                      <div className="flex justify-center mt-8">
                        <nav className="flex items-center">
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-l-md ${
                              currentPage === 1 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                : 'bg-[#4b7e53] text-white hover:bg-green-700'
                            } transition`}
                          >
                            <ChevronLeftIcon className="h-5 w-5" />
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => paginate(i + 1)}
                              className={`px-4 py-2 ${
                                currentPage === i + 1
                                  ? 'bg-[#4b7e53] text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              } transition`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-r-md ${
                              currentPage === totalPages 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                : 'bg-[#4b7e53] text-white hover:bg-green-700'
                            } transition`}
                          >
                            <ChevronRightIcon className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-500 italic mt-8 text-center">
                    {isSearching
                      ? "No recipes found. Try a different keyword or cuisine."
                      : "Search results will appear here based on keyword & filters..."}
                  </div>
                )}
              </div>
            </div>
          </main>
          <Footer />
        </>
      </ProfileRouteGuard>
    </ProtectedRoute>
  );
};

export default RecipesPage;