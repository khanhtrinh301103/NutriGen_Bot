import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getRecipeDetails } from '../../api/getRecipe';
import { CheckCircleIcon, ArrowLeftIcon, ClockIcon, BeakerIcon, FireIcon } from '@heroicons/react/24/outline';
import Header from '../components/common/header';
import Footer from '../components/common/footer';

interface Ingredient {
  id: number;
  name: string;
  amount: {
    value: number;
    unit: string;
  };
  image: string;
}

interface Instruction {
  number: number;
  step: string;
  ingredients: Array<any>;
}

interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  preparationMinutes: number;
  cookingMinutes: number;
  cuisines: string[];
  diets: string[];
  dishTypes: string[];
  calories: string;
  carbs: string;
  fat: string;
  protein: string;
  nutrients: Array<any>;
  ingredients: Ingredient[];
  instructions: Instruction[];
}

const RecipeDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState<boolean>(true);
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      console.log("🔍 [UI] Fetching details for recipe ID:", id);
      
      try {
        const recipeData = await getRecipeDetails(id);
        console.log("✅ [UI] Successfully loaded recipe details:", recipeData.title);
        setRecipe(recipeData);
        setError(null);
      } catch (err) {
        console.error("❌ [UI] Error loading recipe details:", err);
        setError("Failed to load recipe details. Please try again later.");
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  // Simple handler for navigating back to recipes page
  const handleBackToRecipes = () => {
    console.log("🔙 [UI] Navigating back to recipes page");
    router.push('/recipes');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
            <div className="text-gray-500">Loading recipe details...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !recipe) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center p-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl text-red-600 mb-4">Error</h2>
            <p className="mb-6">{error || "Recipe not found"}</p>
            <button 
              onClick={() => router.push('/recipes')}
              className="bg-[#4b7e53] text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Back to Recipes
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Recipe Header with image - removed the Back button from top */}
        <div className="relative h-[40vh] md:h-[50vh] bg-gray-900">
          <div className="absolute inset-0">
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="w-full h-full object-cover opacity-80"
              onError={(e) => {
                console.error("❌ [UI] Error loading recipe image, trying fallback");
                if (!recipe.image.startsWith('http')) {
                  e.currentTarget.src = `https://spoonacular.com/recipeImages/${recipe.id}-556x370.${recipe.imageType}`;
                } else {
                  e.currentTarget.src = "https://via.placeholder.com/400x300?text=Recipe+Image";
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{recipe.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {recipe.cuisines && recipe.cuisines.map((cuisine, index) => (
                <span key={`cuisine-${index}`} className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  {cuisine}
                </span>
              ))}
              {recipe.diets && recipe.diets.map((diet, index) => (
                <span key={`diet-${index}`} className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                  {diet}
                </span>
              ))}
              {recipe.dishTypes && recipe.dishTypes.map((type, index) => (
                <span key={`type-${index}`} className="bg-purple-500 text-white text-xs px-2 py-1 rounded">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recipe Information */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Recipe Information</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-[#4b7e53] mb-2" />
                <span className="text-sm text-gray-500">Preparation</span>
                <span className="font-medium">{recipe.preparationMinutes} min</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-[#4b7e53] mb-2" />
                <span className="text-sm text-gray-500">Cooking</span>
                <span className="font-medium">{recipe.cookingMinutes} min</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <BeakerIcon className="h-6 w-6 text-[#4b7e53] mb-2" />
                <span className="text-sm text-gray-500">Servings</span>
                <span className="font-medium">{recipe.servings}</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <FireIcon className="h-6 w-6 text-[#4b7e53] mb-2" />
                <span className="text-sm text-gray-500">Calories</span>
                <span className="font-medium">{recipe.calories}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Protein</h3>
                <p className="text-lg font-semibold">{recipe.protein}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Carbs</h3>
                <p className="text-lg font-semibold">{recipe.carbs}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Fat</h3>
                <p className="text-lg font-semibold">{recipe.fat}</p>
              </div>
            </div>
          </div>
          
          {/* Ingredients and Instructions in 2 columns on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ingredients */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
              <p className="text-sm text-gray-500 mb-4">Check off ingredients as you gather them:</p>
              
              <ul className="space-y-3">
                {recipe.ingredients && recipe.ingredients.map((ingredient) => {
                  // Generate a unique key using both the ingredient id and name for better uniqueness
                  const ingredientKey = `${ingredient.id}-${ingredient.name.replace(/\s+/g, '-')}`;
                  
                  return (
                    <li 
                      key={ingredientKey}
                      className={`flex items-start p-3 rounded-lg transition-colors ${
                        checkedIngredients[ingredientKey] ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div 
                        className="flex-shrink-0 cursor-pointer"
                        onClick={() => {
                          console.log(`✓ [UI] Toggling ingredient: ${ingredientKey}`);
                          setCheckedIngredients(prev => ({
                            ...prev,
                            [ingredientKey]: !prev[ingredientKey]
                          }));
                        }}
                      >
                        {checkedIngredients[ingredientKey] ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        ) : (
                          <div className="h-6 w-6 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                      <div className="ml-3 flex-grow">
                        <div className="flex items-center">
                          <img 
                            src={ingredient.image} 
                            alt={ingredient.name}
                            className="h-8 w-8 object-cover rounded-full mr-2"
                            onError={(e) => {
                              console.error(`❌ [UI] Error loading ingredient image for ${ingredient.name}`);
                              e.currentTarget.src = "https://via.placeholder.com/100?text=Ingredient";
                            }}
                          />
                          <span className={`font-medium ${checkedIngredients[ingredientKey] ? 'line-through text-gray-400' : ''}`}>
                            {ingredient.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 block mt-1">
                          {ingredient.amount.value} {ingredient.amount.unit}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              
              {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                <p className="text-gray-500 italic">No ingredient information available for this recipe.</p>
              )}
            </div>
            
            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              
              <ol className="space-y-6">
                {recipe.instructions && recipe.instructions.map((instruction) => (
                  <li key={instruction.number} className="relative pl-8">
                    <div className="absolute left-0 top-0 flex items-center justify-center h-6 w-6 rounded-full bg-[#4b7e53] text-white text-sm">
                      {instruction.number}
                    </div>
                    <p className="text-gray-700">{instruction.step}</p>
                  </li>
                ))}
              </ol>
              
              {(!recipe.instructions || recipe.instructions.length === 0) && (
                <p className="text-gray-500 italic">No instructions available for this recipe.</p>
              )}
            </div>
          </div>
          
          {/* Single "Back to Recipes" button at the bottom */}
          <div className="flex justify-center mt-8 mb-6">
            <button 
              onClick={handleBackToRecipes}
              className="bg-[#4b7e53] text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md flex items-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Recipes
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RecipeDetailPage;