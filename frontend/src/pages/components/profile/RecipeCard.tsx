// frontend/src/components/profile/RecipeCard.tsx
import React from 'react';
import { ClockIcon, FireIcon, TrashIcon } from '@heroicons/react/24/outline';
import useScrollReveal from '../../../utils/useScrollReveal';

interface RecipeCardProps {
  recipe: any;
  removingId: number | null;
  onView: (id: number | string) => void;
  onRemove: (id: number | string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, removingId, onView, onRemove }) => {
  const { ref, visible } = useScrollReveal();
  const getNumber = (value: any) => {
    return Math.round(typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value);
  };

  return (
    <div
      ref={ref}
      className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-500 transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]`}
      onClick={() => onView(recipe.id)}
    >
      <div className="h-48 bg-gray-200 relative cursor-pointer overflow-hidden">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3
          className="text-lg font-semibold text-gray-800 mb-2 hover:text-emerald-600 transition-colors cursor-pointer line-clamp-2"
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
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.calories && (
            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center hover:bg-blue-100 hover:scale-105 hover:ring transition-all">
              <FireIcon className="h-3 w-3 mr-1" />
              {getNumber(recipe.calories)} kcal
            </span>
          )}
          {recipe.protein && getNumber(recipe.protein) > 0 && (
            <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full hover:bg-green-100 hover:scale-105 hover:ring transition-all">
              {getNumber(recipe.protein)}g protein
            </span>
          )}
          {recipe.carbs && getNumber(recipe.carbs) > 0 && (
            <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full hover:bg-purple-100 hover:scale-105 hover:ring transition-all">
              {getNumber(recipe.carbs)}g carbs
            </span>
          )}
          {recipe.fat && getNumber(recipe.fat) > 0 && (
            <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-full hover:bg-yellow-100 hover:scale-105 hover:ring transition-all">
              {getNumber(recipe.fat)}g fat
            </span>
          )}
        </div>

        <div className="flex items-center justify-end mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(recipe.id);
            }}
            disabled={removingId === recipe.id}
            className={`flex items-center gap-1 text-sm px-3 py-2 rounded-lg transition-all duration-300 ${
              removingId === recipe.id
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-red-600 hover:bg-red-100 hover:text-red-700 hover:scale-105 hover:ring-2 hover:ring-red-200'
            }`}
          >
            <TrashIcon className="h-4 w-4" />
            {removingId === recipe.id ? (
              <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              'Remove'
            )}
          </button>
        </div>

        {recipe.savedAt && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-sm text-emerald-700 font-medium">
              📌 Saved on {new Date(recipe.savedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default RecipeCard;
