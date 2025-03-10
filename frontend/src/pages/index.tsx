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
    <div className="text-center mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">NutriGen Bot - Recipe Finder</h1>
      
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Enter ingredient (e.g., pasta)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
        />
        <button 
          onClick={handleSearch} 
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-r-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition duration-300 flex items-center justify-center"
        >
          <span>Search</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div 
              key={recipe.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
            >
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-800">{recipe.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}