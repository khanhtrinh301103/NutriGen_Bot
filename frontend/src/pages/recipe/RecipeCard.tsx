import React, { useEffect, useState } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";

interface RecipeCardProps {
  id: number; // Added ID property for navigation
  image: string;
  title: string;
  calories: number;
  protein?: number;
  fat?: number;
  instructions?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  id, // Added ID property
  image,
  title,
  calories,
  protein,
  fat,
  instructions = "No instructions available.",
}) => {
  const router = useRouter(); // Added for navigation
  
  // State for controlling slide-bottom animation
  const [isVisible, setIsVisible] = useState<boolean>(false);
  // State for favorite button
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Effect to trigger slide-bottom animation when component mounts
  useEffect(() => {
    console.log("🎭 [UI] Recipe card rendering with slide-bottom animation: ", title);
    
    // Small delay to ensure the slide-bottom animation works properly
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [title]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    console.log(`❤️ [UI] Recipe ${title} ${!isFavorite ? 'added to' : 'removed from'} favorites`);
  };
  
  // New function to navigate to recipe details page
  const navigateToDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("🔍 [UI] Navigating to detailed view for recipe:", title, "with ID:", id);
    router.push(`/recipe/${id}`);
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
              onClick={navigateToDetails} // Updated to use navigation function
            >
              Show Instructions
            </button>
            
            <button
              className={`w-full flex items-center justify-center gap-2 text-sm py-2 px-4 rounded transition ${
                isFavorite === true 
                  ? "bg-red-100 text-red-600 hover:bg-red-200" 
                  : "bg-blue-50 hover:bg-blue-100 text-blue-600"
              }`}
              onClick={(e) => toggleFavorite(e)}
            >
              {isFavorite === true ? (
                <>
                  <HeartIconSolid className="h-5 w-5 text-red-500" />
                  <span>Remove from Favorites</span>
                </>
              ) : (
                <>
                  <HeartIcon className="h-5 w-5 text-blue-500" />
                  <span>Add to Favorites</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;