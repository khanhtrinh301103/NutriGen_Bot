import React from "react";

interface RecipeCardProps {
  image: string;
  title: string;
  calories: number;
  protein?: number;
  fat?: number;
  instructions?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  image,
  title,
  calories,
  protein,
  fat,
  instructions = "No instructions available.",
}) => {
  return (
    <div className="w-full h-[340px] [perspective:1000px] group">
      <div
        className="relative w-full h-full transition-transform duration-700 
                   [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"
      >
        {/* FRONT SIDE */}
        <div className="absolute w-full h-full bg-white rounded-lg overflow-hidden shadow-md 
                        transition-all duration-300 [backface-visibility:hidden]">
          <img src={image} alt={title} className="w-full h-44 object-cover" />
          <div className="p-4 flex flex-col justify-between h-[calc(100%-11rem)]">
            <h2 className="text-[#4b7e53] font-semibold text-md line-clamp-2">{title}</h2>
            <p className="text-xs text-gray-600 mt-1">Calories: {Math.round(calories)} kcal</p>
            <p className="text-xs text-gray-600">Protein: {Math.round(protein || 0)} g</p>
            <p className="text-xs text-gray-600">Fat: {Math.round(fat || 0)} g</p>
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="absolute w-full h-full bg-gray-50 rounded-lg shadow-md 
                        p-4 flex flex-col justify-center items-center text-center 
                        [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <button
            className="mt-4 text-white bg-[#4b7e53] hover:bg-green-700 text-sm py-2 px-4 rounded transition"
            onClick={(e) => e.stopPropagation()}
          >
            Show Instruction
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
