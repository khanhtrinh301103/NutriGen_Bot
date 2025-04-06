// frontend/src/pages/components/profile/SavedRecipes.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSavedRecipes, removeRecipe } from '../../../api/profile';

interface SavedRecipesProps {
  user: any;
}

const SavedRecipes: React.FC<SavedRecipesProps> = ({ user }) => {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.log('Fetching saved recipes for user:', user.uid);
      const savedRecipes = await getSavedRecipes();
      setRecipes(savedRecipes);
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to remove a saved recipe
  const handleRemoveRecipe = async (recipeId) => {
    try {
      console.log('Removing recipe:', recipeId);
      await removeRecipe(recipeId);
      // Refresh the list after removing
      fetchSavedRecipes();
    } catch (error) {
      console.error('Error removing recipe:', error);
    }
  };

  // Function to navigate to recipe details
  const handleViewRecipe = (recipeId) => {
    router.push(`/recipe/${recipeId}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  // If no saved recipes
  if (recipes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No saved recipes</h3>
          <p className="mt-2 text-sm text-gray-500">
            You have not saved any recipes yet. Start exploring recipes and save your favorites!
          </p>
          <div className="mt-6">
            <button 
              onClick={() => router.push('/recipes')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Find Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Display saved recipes
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Your Saved Recipes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex">
                {recipe.image ? (
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="w-24 h-24 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{recipe.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {recipe.readyInMinutes || '30'} min
                    </span>
                    <span className="mx-2">•</span>
                    <span>{recipe.servings || '4'} servings</span>
                  </div>
                  <div className="flex items-center mt-3">
                    <button
                      onClick={() => handleViewRecipe(recipe.id)}
                      className="text-sm px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
                    >
                      View Recipe
                    </button>
                    <button
                      onClick={() => handleRemoveRecipe(recipe.id)}
                      className="ml-2 text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedRecipes;