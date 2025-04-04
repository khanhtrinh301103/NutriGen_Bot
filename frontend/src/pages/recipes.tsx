import React, { useState, useEffect } from "react";
import Header from "./components/common/header";
import Footer from "./components/common/footer";
import Filter from "../pages/recipe/Filter";
import { sendSearchRequest } from "../api/getRecipe";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import RecipeCard from "../pages/recipe/RecipeCard";

interface Filters {
  cuisine: string;
}

const RecipesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ cuisine: "" });
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 12; // Show 12 cards per page
  
  // Effect to handle animations when results change
  useEffect(() => {
    if (isSearching) {
      console.log("🔄 [UI] Search completed with", results.length, "results");
      setIsLoading(false);
      // Reset to page 1 when new search results come in
      setCurrentPage(1);
    }
  }, [results, isSearching]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    console.log("📝 [UI] User typing search keyword:", e.target.value);
  };

  const handleFilterChange = (updatedFilters: Filters) => {
    setFilters(updatedFilters);
    console.log("🧩 [UI] Filters updated:", updatedFilters);
  };

  const performSearch = () => {
    if (!searchTerm.trim() && !filters.cuisine) {
      console.log("⚠️ [UI] Search cancelled: No search criteria provided");
      return;
    }
    
    console.log("🔎 [UI] Performing search with keyword:", searchTerm, "and filter:", filters);
    
    // Set loading state and trigger fade-out effect
    setIsLoading(true);
    setIsSearching(true);
    
    // Clear previous results for better animation effect
    setResults([]);
    
    // Small delay to show loading effect
    setTimeout(() => {
      sendSearchRequest(searchTerm, filters.cuisine, (newResults) => {
        console.log(`✅ [UI] Search complete. Found ${newResults.length} recipes.`);
        setResults(newResults);
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

  return (
    <>
      <Header />
      <main className="w-full mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#4b7e53]">Find Your Recipe</h1>

        {/* Centered search bar at the top - responsive padding */}
        <div className="mb-6 md:mb-8 px-2 sm:px-4 md:max-w-xl md:mx-auto">
          <div className="relative">
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
        </div>

        {/* Responsive layout that adapts to all screen sizes */}
        <div className="flex flex-col md:flex-row">
          {/* Filter sidebar - Sticky on desktop, full width on mobile */}
          <div className="w-full md:w-64 shrink-0 mb-6 md:mb-0">
            <div className="md:sticky md:top-[calc(50vh-250px)] bg-white shadow-md rounded-lg transition-all duration-300">
              <Filter onChange={handleFilterChange} />
            </div>
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
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                  {currentRecipes.map((recipe, idx) => (
                    <RecipeCard 
                      key={`${indexOfFirstRecipe + idx}-${recipe.title}`} 
                      {...recipe} 
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
              <div className="text-gray-500 italic mt-8">
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
  );
};

export default RecipesPage;