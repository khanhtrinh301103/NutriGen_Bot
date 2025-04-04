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
  const [searchAnimation, setSearchAnimation] = useState(false);
  const cardsPerPage = 12; // Show 12 cards per page
  
  // Effect to handle animations when results change
  useEffect(() => {
    if (isSearching) {
      console.log("🔄 [UI] Search completed with", results.length, "results");
      setIsLoading(false);
      setSearchAnimation(false);
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
    
    setIsSearching(true);
    setResults([]);
    
    sendSearchRequest(searchTerm, filters.cuisine, (newResults) => {
      console.log(`✅ [UI] Search complete. Found ${newResults.length} recipes.`);
      setResults(newResults);
      setIsSearching(false);
    });
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
      <main className="w-full mx-auto py-12 bg-[#f8f3e7]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-[#4b7e53]">Find Your Recipe</h1>

          {/* Enhanced search bar with shadow and better spacing */}
          <div className="mb-10 px-4 sm:px-6 md:max-w-2xl md:mx-auto">
            <div className={`relative transform transition-all duration-300 ${searchAnimation ? 'scale-105' : 'scale-100'}`}>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Search for recipes..."
                className={`w-full p-4 pr-12 rounded-xl border-none shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4b7e53] transition-all duration-300 ${
                  searchAnimation ? 'ring-2 ring-[#4b7e53] shadow-xl' : ''
                }`}
                disabled={isLoading}
              />
              <button
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-[#4b7e53] hover:text-green-800 transition-all duration-300 ${
                  isLoading ? 'animate-spin' : ''
                }`}
                onClick={handleSearchClick}
                disabled={isLoading}
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Improved layout with better spacing */}
          <div className="flex flex-col md:flex-row px-4 sm:px-6 gap-8">
            {/* Filter sidebar with refined positioning */}
            <div className="w-full md:w-72 shrink-0">
              <div className={`md:sticky md:top-[100px] bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 ${
                searchAnimation ? 'opacity-50' : 'opacity-100'
              }`}>
                <Filter onChange={handleFilterChange} />
              </div>
            </div>

            {/* Results area with better spacing and transitions */}
            <div className="flex-1 min-h-[500px]">
              {results.length > 0 ? (
                <div className="transition-all duration-300">
                  <div className="text-sm text-gray-600 mb-6 bg-white px-4 py-3 rounded-lg shadow-sm">
                    Found <span className="font-semibold text-[#4b7e53]">{results.length}</span> {results.length === 1 ? 'recipe' : 'recipes'}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentRecipes.map((recipe, idx) => (
                      <RecipeCard 
                        key={`${indexOfFirstRecipe + idx}-${recipe.title}`} 
                        {...recipe} 
                      />
                    ))}
                  </div>
                  
                  {/* Enhanced pagination */}
                  {results.length > cardsPerPage && (
                    <div className="flex justify-center mt-12 mb-6">
                      <nav className="flex items-center gap-1 bg-white rounded-lg shadow-md p-1">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-md ${
                            currentPage === 1 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'text-[#4b7e53] hover:bg-[#edf5ef] transition-colors duration-200'
                          }`}
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                              currentPage === i + 1
                                ? 'bg-[#4b7e53] text-white'
                                : 'text-gray-600 hover:bg-[#edf5ef]'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-md ${
                            currentPage === totalPages 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'text-[#4b7e53] hover:bg-[#edf5ef] transition-colors duration-200'
                          }`}
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-xl shadow-lg p-8">
                  <div className="mb-6">
                    <MagnifyingGlassIcon className="h-16 w-16 text-[#4b7e53] opacity-20" />
                  </div>
                  <h3 className="text-xl font-medium text-[#4b7e53] mb-3">
                    {isSearching ? "No Recipes Found" : "Ready to Cook?"}
                  </h3>
                  <p className="text-gray-500 text-center max-w-md leading-relaxed">
                    {isSearching
                      ? "Try adjusting your search or filters to find more recipes."
                      : "Use the search bar above and cuisine filters to discover delicious recipes tailored to your taste!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RecipesPage;