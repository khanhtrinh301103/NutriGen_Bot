import React, { useEffect, useState } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { saveRecipe, removeRecipe, getSavedRecipes } from "../../api/profile";

interface NutritionInfo {
  proteinMatch?: number;
  carbsMatch?: number;
  fatMatch?: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
}

interface RecipeCardProps {
  id: number;
  image: string;
  title: string;
  calories: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  // Thêm thông tin thích hợp về dinh dưỡng
  nutritionMatchPercentage?: number;
  overallMatchPercentage?: number;
  nutritionInfo?: NutritionInfo;
  instructions?: string;
  readyInMinutes?: number;
  servings?: number;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  image,
  title,
  calories,
  protein,
  fat,
  carbs,
  nutritionMatchPercentage,
  overallMatchPercentage,
  nutritionInfo,
  instructions = "No instructions available.",
  readyInMinutes,
  servings,
}) => {
  const router = useRouter();
  
  // State for controlling slide-bottom animation
  const [isVisible, setIsVisible] = useState<boolean>(false);
  // State for favorite button
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  // Tình trạng chế độ dinh dưỡng
  const [isNutritionMode, setIsNutritionMode] = useState<boolean>(false);
  // Loading state for favorite action
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);

  // Check if recipe is in favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        // Ensure id is converted to a number for consistent comparison
        const recipeId = typeof id === 'string' ? parseInt(id, 10) : id;
        const savedRecipes = await getSavedRecipes();
        
        // Convert both to ensure type safety
        const isInFavorites = savedRecipes.some((recipe) => {
          const savedId = typeof recipe.id === 'string' ? parseInt(recipe.id, 10) : recipe.id;
          return savedId === recipeId;
        });
        
        console.log(`📊 [UI] Recipe ${recipeId} favorite status:`, isInFavorites);
        setIsFavorite(isInFavorites);
      } catch (error) {
        console.error("❌ [UI] Error checking favorite status:", error);
      }
    };
    
    checkFavoriteStatus();
  }, [id]);

  // Effect để kiểm tra chế độ dinh dưỡng
  useEffect(() => {
    try {
      const nutritionModeEnabled = localStorage.getItem('nutritionModeEnabled');
      setIsNutritionMode(nutritionModeEnabled ? JSON.parse(nutritionModeEnabled) : false);
    } catch (error) {
      console.error("❌ [UI] Error checking nutrition mode:", error);
      setIsNutritionMode(false);
    }
  }, []);

  // Effect to trigger slide-bottom animation when component mounts
  useEffect(() => {
    console.log("🎭 [UI] Recipe card rendering with slide-bottom animation: ", title);
    
    // Small delay to ensure the slide-bottom animation works properly
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [title]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setFavoriteLoading(true);
      
      // Ensure id is a number for consistency
      const recipeId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      if (isFavorite) {
        // Remove from favorites
        console.log(`❤️ [UI] Removing recipe ${recipeId} from favorites`);
        await removeRecipe(recipeId);
      } else {
        // Add to favorites
        console.log(`❤️ [UI] Adding recipe ${recipeId} to favorites`);
        
        // Ensure all values are of expected types
        const recipeData = {
          id: recipeId,
          title,
          image,
          calories: typeof calories === 'string' ? parseFloat(calories) : calories || 0,
          protein: typeof protein === 'string' ? parseFloat(protein) : protein || 0,
          fat: typeof fat === 'string' ? parseFloat(fat) : fat || 0,
          carbs: typeof carbs === 'string' ? parseFloat(carbs) : carbs || 0,
          readyInMinutes: readyInMinutes || 30,
          servings: servings || 4,
        };
        
        console.log("📦 [UI] Saving recipe data:", recipeData);
        await saveRecipe(recipeData);
      }
      
      // Toggle state after successful API call
      setIsFavorite(!isFavorite);
      console.log(`❤️ [UI] Recipe ${title} ${!isFavorite ? 'added to' : 'removed from'} favorites`);
    } catch (error) {
      console.error("❌ [UI] Error toggling favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };
  
  // Navigate to recipe details page
  const navigateToDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("🔍 [UI] Navigating to detailed view for recipe:", title, "with ID:", id);
    router.push(`/recipe/${id}`);
  };
  
  // Render nutrition match badge if in nutrition mode
  const renderNutritionBadge = () => {
    if (!isNutritionMode || !overallMatchPercentage) return null;
    
    let badgeColor = 'bg-yellow-100 text-yellow-700';
    let icon = '⚠️';
    
    // Phân loại độ phù hợp
    if (overallMatchPercentage >= 80) {
      badgeColor = 'bg-green-100 text-green-700';
      icon = '✓';
    } else if (overallMatchPercentage >= 60) {
      badgeColor = 'bg-blue-100 text-blue-700';
      icon = '👍';
    }
    
    return (
      <div className={`absolute top-2 right-2 ${badgeColor} text-xs font-medium px-2 py-1 rounded-full z-10 flex items-center shadow`}>
        <span className="mr-1">{icon}</span>
        <span>{Math.round(overallMatchPercentage)}% match</span>
      </div>
    );
  };
  
  // Render nutrient match bars
  const renderNutrientMatchBars = () => {
    if (!isNutritionMode || !nutritionInfo) return null;
    
    const { proteinMatch, carbsMatch, fatMatch } = nutritionInfo || {};
    
    return (
      <div className="mt-2 space-y-1.5">
        {/* Protein Match Bar */}
        <div className="flex items-center text-xs">
          <span className="w-16 font-medium text-gray-700">Protein</span>
          <div className="flex-grow h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                proteinMatch && proteinMatch >= 80 ? 'bg-green-500' : 
                proteinMatch && proteinMatch >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${Math.min(100, proteinMatch || 0)}%` }}
            ></div>
          </div>
          <span className="ml-2 w-8 text-right text-gray-600">{proteinMatch ? `${Math.round(proteinMatch)}%` : 'N/A'}</span>
        </div>
        
        {/* Carbs Match Bar */}
        <div className="flex items-center text-xs">
          <span className="w-16 font-medium text-gray-700">Carbs</span>
          <div className="flex-grow h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                carbsMatch && carbsMatch >= 80 ? 'bg-green-500' : 
                carbsMatch && carbsMatch >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${Math.min(100, carbsMatch || 0)}%` }}
            ></div>
          </div>
          <span className="ml-2 w-8 text-right text-gray-600">{carbsMatch ? `${Math.round(carbsMatch)}%` : 'N/A'}</span>
        </div>
        
        {/* Fat Match Bar */}
        <div className="flex items-center text-xs">
          <span className="w-16 font-medium text-gray-700">Fat</span>
          <div className="flex-grow h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                fatMatch && fatMatch >= 80 ? 'bg-green-500' : 
                fatMatch && fatMatch >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${Math.min(100, fatMatch || 0)}%` }}
            ></div>
          </div>
          <span className="ml-2 w-8 text-right text-gray-600">{fatMatch ? `${Math.round(fatMatch)}%` : 'N/A'}</span>
        </div>
      </div>
    );
  };
  
  return (
    <div 
      className={`w-full h-[340px] [perspective:1000px] group transition-all duration-500 ease-in-out ${
        isVisible 
          ? "opacity-100 transform translate-y-0" 
          : "opacity-0 transform translate-y-8"
      }`}
    >
      <div
        className="relative w-full h-full transition-transform duration-700 
                   [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"
      >
        {/* FRONT SIDE */}
        <div className="absolute w-full h-full bg-white rounded-lg overflow-hidden shadow-md 
                        transition-all duration-300 [backface-visibility:hidden]">
          <div className="relative">
            <img src={image} alt={title} className="w-full h-44 object-cover" />
            {renderNutritionBadge()}
          </div>
          <div className="p-4 flex flex-col justify-between h-[calc(100%-11rem)]">
            <h2 className="text-[#4b7e53] font-semibold text-md line-clamp-2">{title}</h2>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">
                <span className="font-semibold">Calories:</span> {Math.round(calories)} kcal
              </p>
              <p className="text-sm font-medium text-gray-700">
                <span className="font-semibold">Protein:</span> {Math.round(protein || 0)} g
              </p>
              <p className="text-sm font-medium text-gray-700">
                <span className="font-semibold">Fat:</span> {Math.round(fat || 0)} g
              </p>
              {carbs !== undefined && (
                <p className="text-sm font-medium text-gray-700">
                  <span className="font-semibold">Carbs:</span> {Math.round(carbs)} g
                </p>
              )}
              
              {/* Render nutrition match bars if in nutrition mode */}
              {isNutritionMode && renderNutrientMatchBars()}
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="absolute w-full h-full bg-gray-50 rounded-lg shadow-md 
                        p-4 flex flex-col justify-center items-center text-center 
                        [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="space-y-4 w-full max-w-[200px]">
            <button
              className="w-full text-white bg-[#4b7e53] hover:bg-green-700 text-sm py-2 px-4 rounded transition flex items-center justify-center gap-2"
              onClick={navigateToDetails}
            >
              Show Instructions
            </button>
            
            <button
              disabled={favoriteLoading}
              className={`w-full flex items-center justify-center gap-2 text-sm py-2 px-4 rounded transition ${
                favoriteLoading 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : isFavorite 
                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200" 
                    : "bg-red-50 hover:bg-red-100 text-red-600"
              }`}
              onClick={(e) => toggleFavorite(e)}
            >
              {favoriteLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : isFavorite ? (
                <>
                  <HeartIconSolid className="h-5 w-5 text-red-500" />
                  <span>Remove from Favorites</span>
                </>
              ) : (
                <>
                  <HeartIcon className="h-5 w-5 text-red-500" />
                  <span>Add to Favorites</span>
                </>
              )}
            </button>
            
            {/* Nutrition match details on back side */}
            {isNutritionMode && nutritionMatchPercentage && (
              <div className="mt-2 bg-green-50 p-2 rounded text-sm">
                <p className="font-medium text-green-700">Nutrition Match: {Math.round(nutritionMatchPercentage)}%</p>
                {nutritionInfo && (
                  <p className="text-xs text-gray-600 mt-1">
                    Matches your nutrition goals for protein, carbs and fat.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;