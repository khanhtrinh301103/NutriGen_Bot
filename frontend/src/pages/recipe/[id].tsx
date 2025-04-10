import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getRecipeDetails } from '../../api/getRecipe';
import { saveRecipe, removeRecipe, getSavedRecipes } from '../../api/profile';
import { 
  CheckCircleIcon, 
  ArrowLeftIcon, 
  ClockIcon, 
  BeakerIcon, 
  FireIcon,
  UserIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
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
  const [servingMultiplier, setServingMultiplier] = useState<number>(1);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Animation effect when component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch recipe details
// Trong useEffect của [id].tsx, thay thế đoạn code fetch recipe details:

useEffect(() => {
  const fetchRecipeDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    
    // Xử lý id có thể là string hoặc string[]
    const recipeId = Array.isArray(id) ? id[0] : id;
    console.log("🔍 [UI] Fetching details for recipe ID:", recipeId);
    
    try {
      const recipeData = await getRecipeDetails(recipeId);
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

// Check if recipe is in favorites
useEffect(() => {
  const checkFavoriteStatus = async () => {
    if (!id) return;
    
    try {
      // Xử lý id có thể là string hoặc string[]
      const recipeId = Array.isArray(id) ? id[0] : id;
      
      // Chuyển đổi sang số nếu có thể
      const numericId = typeof recipeId === 'string' ? parseInt(recipeId, 10) : recipeId;
      
      const savedRecipes = await getSavedRecipes();
      const isInFavorites = savedRecipes.some((recipe) => {
        const savedId = typeof recipe.id === 'string' ? parseInt(recipe.id, 10) : recipe.id;
        return savedId === numericId;
      });
      
      console.log(`📊 [UI] Recipe ${numericId} favorite status:`, isInFavorites);
      setIsFavorite(isInFavorites);
    } catch (error) {
      console.error("❌ [UI] Error checking favorite status:", error);
    }
  };
  
  checkFavoriteStatus();
}, [id]);

  // Simple handler for navigating back to recipes page
  const handleBackToRecipes = () => {
    console.log("🔙 [UI] Navigating back to recipes page");
    router.push('/recipes');
  };

  // Handler for increasing/decreasing servings
  const adjustServings = (delta: number) => {
    const newMultiplier = Math.max(0.5, servingMultiplier + delta);
    console.log(`🍽️ [UI] Adjusting servings multiplier to: ${newMultiplier}x`);
    setServingMultiplier(newMultiplier);
  };

  // Calculate adjusted amounts based on servingMultiplier
  const calculateAmount = (value: number): number => {
    return parseFloat((value * servingMultiplier).toFixed(1));
  };

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!recipe) return;
    
    try {
      setFavoriteLoading(true);
      
      // Convert string values to numbers for consistency
      const prepareNutritionData = (value) => {
        if (typeof value === 'string') {
          // Remove any non-numeric characters (like 'g' or 'kcal')
          const numericValue = value.replace(/[^0-9.]/g, '');
          return parseFloat(numericValue) || 0;
        }
        return value || 0;
      };
      
      if (isFavorite) {
        // Remove from favorites
        console.log(`❤️ [UI] Removing recipe ${recipe.id} from favorites`);
        await removeRecipe(recipe.id);
      } else {
        // Add to favorites
        console.log(`❤️ [UI] Adding recipe ${recipe.id} to favorites`);
        const recipeData = {
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          calories: prepareNutritionData(recipe.calories),
          protein: prepareNutritionData(recipe.protein),
          fat: prepareNutritionData(recipe.fat),
          carbs: prepareNutritionData(recipe.carbs),
          readyInMinutes: recipe.readyInMinutes || 30,
          servings: recipe.servings || 4,
        };
        console.log("📦 [UI] Saving recipe data:", recipeData);
        await saveRecipe(recipeData);
      }
      
      // Toggle state after successful API call
      setIsFavorite(!isFavorite);
      console.log(`❤️ [UI] Recipe ${recipe.title} ${!isFavorite ? 'added to' : 'removed from'} favorites`);
    } catch (error) {
      console.error("❌ [UI] Error toggling favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Render loading skeleton
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              {/* Hero section skeleton */}
              <div className="h-60 md:h-80 bg-gray-300 rounded-lg mb-8"></div>
              
              {/* Title skeleton */}
              <div className="h-10 bg-gray-300 rounded w-3/4 mb-6"></div>
              
              {/* Info boxes skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
                ))}
              </div>
              
              {/* Content skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-300 rounded-lg"></div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Render error state
  if (error || !recipe) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-gray-50">
          <div className="text-center max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
            <p className="mb-6 text-gray-600">{error || "Recipe not found or unavailable"}</p>
            <button 
              onClick={() => router.push('/recipes')}
              className="bg-[#4b7e53] text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              Back to Recipes
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Calculate classes for fade-in animation
  const fadeInClass = isMounted 
    ? "opacity-100 translate-y-0" 
    : "opacity-0 translate-y-4";

  return (
    <>
      <Header />
      <div className={`min-h-screen bg-gray-50 transition-all duration-500 ease-in-out ${fadeInClass}`}>
        {/* Hero section with image and gradient overlay */}
        <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] bg-gray-900">
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
                  e.currentTarget.src = "https://via.placeholder.com/800x600?text=Recipe+Image";
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
          
          {/* Recipe title and tags */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container mx-auto">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-sm">{recipe.title}</h1>
              
              {/* Tags section - cuisines, diets, dishTypes */}
              <div className="flex flex-wrap gap-2 mt-3">
                {recipe.cuisines && recipe.cuisines.map((cuisine, index) => (
                  cuisine !== "None" && (
                    <span key={`cuisine-${index}`} className="bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full">
                      {cuisine}
                    </span>
                  )
                ))}
                {recipe.diets && recipe.diets.map((diet, index) => (
                  diet !== "None" && (
                    <span key={`diet-${index}`} className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full">
                      {diet}
                    </span>
                  )
                ))}
                {recipe.dishTypes && recipe.dishTypes.map((type, index) => (
                  type !== "None" && (
                    <span key={`type-${index}`} className="bg-purple-500/90 text-white text-xs px-2 py-1 rounded-full">
                      {type}
                    </span>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Recipe Content Container */}
        <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
          {/* Favorite button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className={`flex items-center px-4 py-2 rounded-full shadow-sm text-sm font-medium transition ${
                favoriteLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {favoriteLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
                  <span>Processing...</span>
                </>
              ) : isFavorite ? (
                <>
                  <HeartIconSolid className="h-5 w-5 text-red-500 mr-2" />
                  <span>Remove from Favorites</span>
                </>
              ) : (
                <>
                  <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
                  <span>Add to Favorites</span>
                </>
              )}
            </button>
          </div>
          
          {/* Recipe Information Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 transform transition-all duration-300 hover:shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Recipe Information</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
              <div className="bg-[#f7faf8] rounded-lg p-4 flex flex-col items-center text-center transition hover:shadow-sm">
                <ClockIcon className="h-7 w-7 text-[#4b7e53] mb-2" />
                <span className="text-xs text-gray-500 uppercase font-medium tracking-wide">Prep Time</span>
                <span className="font-bold text-gray-800">{recipe.preparationMinutes} min</span>
              </div>
              
              <div className="bg-[#f7faf8] rounded-lg p-4 flex flex-col items-center text-center transition hover:shadow-sm">
                <ClockIcon className="h-7 w-7 text-[#4b7e53] mb-2" />
                <span className="text-xs text-gray-500 uppercase font-medium tracking-wide">Cook Time</span>
                <span className="font-bold text-gray-800">{recipe.cookingMinutes} min</span>
              </div>
              
              <div className="bg-[#f7faf8] rounded-lg p-4 flex flex-col items-center text-center group relative transition hover:shadow-sm">
                <div className="flex items-center mb-1">
                  <UserIcon className="h-7 w-7 text-[#4b7e53] mb-1" />
                  <div className="ml-1 flex space-x-1">
                    <button 
                      onClick={() => adjustServings(-0.5)}
                      className="h-5 w-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                    >
                      -
                    </button>
                    <button 
                      onClick={() => adjustServings(0.5)}
                      className="h-5 w-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>
                <span className="text-xs text-gray-500 uppercase font-medium tracking-wide">Servings</span>
                <span className="font-bold text-gray-800">
                  {calculateAmount(recipe.servings)}
                </span>
              </div>
              
              <div className="bg-[#f7faf8] rounded-lg p-4 flex flex-col items-center text-center transition hover:shadow-sm">
                <FireIcon className="h-7 w-7 text-[#4b7e53] mb-2" />
                <span className="text-xs text-gray-500 uppercase font-medium tracking-wide">Calories</span>
                <span className="font-bold text-gray-800">{recipe.calories}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#f7faf8] rounded-lg p-4 transition hover:shadow-sm">
                <h3 className="text-sm text-gray-500 uppercase font-medium tracking-wide mb-1">Protein</h3>
                <p className="text-xl font-bold text-gray-800">{recipe.protein}</p>
              </div>
              
              <div className="bg-[#f7faf8] rounded-lg p-4 transition hover:shadow-sm">
                <h3 className="text-sm text-gray-500 uppercase font-medium tracking-wide mb-1">Carbs</h3>
                <p className="text-xl font-bold text-gray-800">{recipe.carbs}</p>
              </div>
              
              <div className="bg-[#f7faf8] rounded-lg p-4 transition hover:shadow-sm">
                <h3 className="text-sm text-gray-500 uppercase font-medium tracking-wide mb-1">Fat</h3>
                <p className="text-xl font-bold text-gray-800">{recipe.fat}</p>
              </div>
            </div>
          </div>
          
          {/* Ingredients and Instructions in 2 columns on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Ingredients Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 transform transition-all duration-300 hover:shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Ingredients</h2>
              <p className="text-sm text-gray-500 mb-5">Check off ingredients as you gather them:</p>
              
              <ul className="space-y-3">
                {recipe.ingredients && recipe.ingredients.map((ingredient) => {
                  // Generate a unique key using both the ingredient id and name
                  const ingredientKey = `${ingredient.id}-${ingredient.name.replace(/\s+/g, '-')}`;
                  
                  return (
                    <li 
                      key={ingredientKey}
                      className={`flex items-start p-3 rounded-lg transition-all duration-300 ${
                        checkedIngredients[ingredientKey] 
                          ? 'bg-green-50 border border-green-100' 
                          : 'bg-gray-50 hover:bg-gray-100'
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
                            className="h-8 w-8 object-cover rounded-full mr-2 border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/100?text=Ingredient";
                            }}
                          />
                          <span className={`font-medium ${checkedIngredients[ingredientKey] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {ingredient.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 block mt-1">
                          {calculateAmount(ingredient.amount.value)} {ingredient.amount.unit}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              
              {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                <div className="py-8 text-center">
                  <p className="text-gray-500 italic">No ingredient information available for this recipe.</p>
                </div>
              )}
            </div>
            
            {/* Instructions Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 transform transition-all duration-300 hover:shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Instructions</h2>
              
              <ol className="space-y-6">
                {recipe.instructions && recipe.instructions.map((instruction) => (
                  <li key={instruction.number} className="relative pl-9">
                    <div className="absolute left-0 top-1 flex items-center justify-center h-6 w-6 rounded-full bg-[#4b7e53] text-white text-sm font-medium">
                      {instruction.number}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{instruction.step}</p>
                  </li>
                ))}
              </ol>
              
              {(!recipe.instructions || recipe.instructions.length === 0) && (
                <div className="py-8 text-center">
                  <p className="text-gray-500 italic">No instructions available for this recipe.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom "Back to Recipes" button */}
          <div className="flex justify-center mt-10 mb-6">
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