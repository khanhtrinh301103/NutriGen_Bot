// frontend/src/pages/components/profile/SavedRecipes.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSavedRecipes, removeRecipe } from '../../../api/profile';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { ClockIcon, UserIcon, FireIcon } from '@heroicons/react/24/outline';

interface SavedRecipesProps {
  user: any;
}

const SavedRecipes: React.FC<SavedRecipesProps> = ({ user }) => {
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Fetch saved recipes when component mounts
  useEffect(() => {
    if (user) {
      fetchSavedRecipes();
    }
  }, [user]);

  // Function to fetch saved recipes
  const fetchSavedRecipes = async () => {
    try {
      setLoading(true);
      console.log('📋 [UI] Fetching saved recipes for user:', user.uid);
      const savedRecipes = await getSavedRecipes();
      console.log('✅ [UI] Successfully loaded saved recipes:', savedRecipes.length);
      setRecipes(savedRecipes);
    } catch (error) {
      console.error('❌ [UI] Error fetching saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to remove a saved recipe
  const handleRemoveRecipe = async (recipeId: number | string) => {
    try {
      // Convert to number if it's a string
      const numericId = typeof recipeId === 'string' ? parseInt(recipeId, 10) : recipeId;
      
      setRemovingId(numericId);
      console.log('🗑️ [UI] Removing recipe:', numericId);
      await removeRecipe(numericId);
      console.log('✅ [UI] Recipe removed successfully');
      // Refresh the list after removing
      fetchSavedRecipes();
    } catch (error) {
      console.error('❌ [UI] Error removing recipe:', error);
    } finally {
      setRemovingId(null);
    }
  };

  // Function to navigate to recipe details
  const handleViewRecipe = (recipeId: number | string) => {
    console.log('🔍 [UI] Navigating to recipe details:', recipeId);
    router.push(`/recipe/${recipeId}`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  // If no saved recipes
  if (recipes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-16 bg-gray-50 rounded-xl shadow-sm">
          <HeartIconSolid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No saved recipes</h3>
          <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
            You haven't saved any recipes yet. Start exploring recipes and save your favorites!
          </p>
          <div className="mt-6">
            <button 
              onClick={() => router.push('/recipes')}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Find Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Display saved recipes in a grid of cards
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Your Saved Recipes</h2>
          <span className="bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div 
              key={recipe.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300"
            >
              <div 
                className="h-44 bg-gray-200 relative cursor-pointer"
                onClick={() => handleViewRecipe(recipe.id)}
              >
                {recipe.image ? (
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <h3 
                  className="text-lg font-semibold text-gray-800 mb-2 hover:text-emerald-600 transition-colors cursor-pointer line-clamp-2"
                  onClick={() => handleViewRecipe(recipe.id)}
                >
                  {recipe.title}
                </h3>
                
                <div className="flex items-center text-gray-500 text-sm mb-3 space-x-4">
                  {recipe.readyInMinutes && (
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{recipe.readyInMinutes} min</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span>{recipe.servings} servings</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.calories && (
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center">
                      <FireIcon className="h-3 w-3 mr-1" />
                      {Math.round(typeof recipe.calories === 'string' ? 
                        parseFloat(recipe.calories.replace(/[^0-9.]/g, '')) : recipe.calories)} kcal
                    </span>
                  )}
                  {recipe.protein && parseFloat(String(recipe.protein)) > 0 && (
                    <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                      {Math.round(typeof recipe.protein === 'string' ? 
                        parseFloat(recipe.protein.replace(/[^0-9.]/g, '')) : recipe.protein)}g protein
                    </span>
                  )}
                  {/* Loại bỏ hiển thị carbs */}
                  {recipe.fat && parseFloat(String(recipe.fat)) > 0 && (
                    <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-full">
                      {Math.round(typeof recipe.fat === 'string' ? 
                        parseFloat(recipe.fat.replace(/[^0-9.]/g, '')) : recipe.fat)}g fat
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => handleViewRecipe(recipe.id)}
                    className="text-sm px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    View Recipe
                  </button>
                  <button
                    onClick={() => handleRemoveRecipe(recipe.id)}
                    disabled={removingId === recipe.id}
                    className={`ml-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                      removingId === recipe.id 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    {removingId === recipe.id ? (
                      <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    ) : (
                      "Remove"
                    )}
                  </button>
                </div>
                
                {recipe.savedAt && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Saved on {new Date(recipe.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedRecipes;