import { useState } from "react";
import { getRecipe } from "../api/getRecipe";

export default function Home() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const data = await getRecipe(query);
    setRecipes(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-extrabold text-blue-600 drop-shadow-md">
        🍽️ NutriGen Bot - Recipe Finder
      </h1>

      {/* Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Enter ingredient (e.g., pasta)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-3 border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-all duration-300"
        />
        <button
          onClick={handleSearch}
          className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          🔍 Search
        </button>
      </div>

      {/* Recipe Results */}
      {recipes.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white shadow-xl rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">{recipe.title}</h3>
                <p className="text-gray-600 mt-1">🍽️ Delicious & Easy Recipe</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
