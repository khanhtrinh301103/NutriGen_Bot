import React, { useState } from "react";
import Header from "./components/common/header";
import Footer from "./components/common/footer";
import Filter from "../pages/recipe/Filter";
import { sendSearchRequest } from "../api/getRecipe";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import RecipeCard from "../pages/recipe/RecipeCard";

const RecipesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ cuisine: "" });
  const [results, setResults] = useState([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    console.log("📝 [UI] Người dùng đang nhập từ khóa:", e.target.value);
  };

  const handleFilterChange = (updatedFilters: any) => {
    setFilters(updatedFilters);
    console.log("🧩 [UI] Bộ lọc được cập nhật:", updatedFilters);
  };

  const handleSearchClick = () => {
    console.log("🔎 [UI] Click nút tìm kiếm với keyword:", searchTerm, "và filter:", filters);
    sendSearchRequest(searchTerm, filters.cuisine, setResults);
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-[#4b7e53]">Find Your Recipe</h1>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
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

        {/* Responsive layout with filter and result */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter: full width on mobile, left side on desktop */}
          <div className="w-full lg:w-1/4">
            <Filter onChange={handleFilterChange} />
          </div>

          {/* Results */}
          <div className="w-full lg:w-3/4 min-h-[400px]">
            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.map((recipe, idx) => (
                  <RecipeCard key={idx} {...recipe} />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic mt-8">
                {searchTerm || filters.cuisine
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
