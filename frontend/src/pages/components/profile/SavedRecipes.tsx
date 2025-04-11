// frontend/src/pages/components/profile/SavedRecipes.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSavedRecipes, removeRecipe } from '../../../api/profile';
import { HeartIcon as HeartIconSolid, TrashIcon } from '@heroicons/react/24/solid';
import RecipeCard from '../../components/profile/RecipeCard';

interface SavedRecipesProps {
  user: any;
}

const SavedRecipes: React.FC<SavedRecipesProps> = ({ user }) => {
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [removingAll, setRemovingAll] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSavedRecipes();
    }
  }, [user]);

  const fetchSavedRecipes = async () => {
    try {
      setLoading(true);
      const savedRecipes = await getSavedRecipes();
      setRecipes(savedRecipes);
    } catch (error) {
      console.error('❌ Error fetching saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRecipe = async (recipeId: number | string) => {
    try {
      const numericId = typeof recipeId === 'string' ? parseInt(recipeId, 10) : recipeId;
      setRemovingId(numericId);
      await removeRecipe(numericId);
      fetchSavedRecipes();
    } catch (error) {
      console.error('❌ Error removing recipe:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleRemoveAllRecipes = async () => {
    try {
      setRemovingAll(true);
      const ids = recipes.map(r => r.id);
      await Promise.all(ids.map(id => removeRecipe(id)));
      fetchSavedRecipes();
    } catch (error) {
      console.error('❌ Error removing all recipes:', error);
    } finally {
      setRemovingAll(false);
    }
  };

  const handleViewRecipe = (recipeId: number | string) => {
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
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 hover:scale-105 transition-all shadow-sm hover:shadow-md"
            >
              Find Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Your Saved Recipes</h2>
          <div className="flex items-center gap-4">
            <span className="bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full">
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
            </span>
            <button
              onClick={handleRemoveAllRecipes}
              disabled={removingAll}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border border-red-500 text-red-600 hover:bg-red-50 hover:scale-105 transition-all duration-300 ${
                removingAll ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <TrashIcon className="h-4 w-4" /> Remove All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              removingId={removingId}
              onView={handleViewRecipe}
              onRemove={handleRemoveRecipe}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedRecipes;
