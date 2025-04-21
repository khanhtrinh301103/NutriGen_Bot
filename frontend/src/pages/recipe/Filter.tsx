import React, { useState, useEffect } from "react";

interface FilterProps {
  onChange: (filters: any) => void;
  initialCuisine?: string; // Added to allow setting initial value
}

const Filter: React.FC<FilterProps> = ({ onChange, initialCuisine = "" }) => {
  const [filters, setFilters] = useState({
    cuisine: initialCuisine || "", // Use initialCuisine if provided
  });

  const [showFilters, setShowFilters] = useState(false);

  // Update filters when initialCuisine changes (e.g. from localStorage)
  useEffect(() => {
    if (initialCuisine !== filters.cuisine) {
      console.log("🔄 [UI] Restoring cuisine filter to:", initialCuisine);
      setFilters(prev => ({ ...prev, cuisine: initialCuisine }));
    }
  }, [initialCuisine]);

  const cuisineOptions = [
    { value: "", label: "All" },
    { value: "african", label: "African" },
    { value: "asian", label: "Asian" },
    { value: "american", label: "American" },
    { value: "british", label: "British" },
    { value: "cajun", label: "Cajun" },
    { value: "caribbean", label: "Caribbean" },
    { value: "chinese", label: "Chinese" },
    { value: "eastern_european", label: "Eastern European" },
    { value: "european", label: "European" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "greek", label: "Greek" },
    { value: "indian", label: "Indian" },
    { value: "irish", label: "Irish" },
    { value: "italian", label: "Italian" },
    { value: "japanese", label: "Japanese" },
    { value: "jewish", label: "Jewish" },
    { value: "korean", label: "Korean" },
    { value: "latin_american", label: "Latin American" },
    { value: "mediterranean", label: "Mediterranean" },
    { value: "mexican", label: "Mexican" },
    { value: "middle_eastern", label: "Middle Eastern" },
    { value: "nordic", label: "Nordic" },
    { value: "southern", label: "Southern" },
    { value: "spanish", label: "Spanish" },
    { value: "thai", label: "Thai" },
    { value: "vietnamese", label: "Vietnamese" }
  ];

  const handleCuisineChange = (value: string) => {
    console.log("🍽️ [UI] Cuisine filter changed to:", value);
    setFilters((prev) => {
      const updated = { ...prev, cuisine: value };
      onChange(updated);
      return updated;
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg md:rounded-l-none md:border-r md:border-t md:border-b h-full">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-[#4b7e53] font-medium">Cuisine</h3>
        {/* Toggle button only visible on small screens */}
        <button 
          className="md:hidden text-gray-500 p-1"
          onClick={() => setShowFilters(!showFilters)}
          aria-label={showFilters ? "Hide filters" : "Show filters"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {showFilters ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </div>
      
      <div className={`p-2 space-y-1 overflow-visible ${showFilters ? 'block' : 'hidden md:block'}`}>
        {/* "All" option gets full width and different styling */}
        <div 
          className={`
            p-1.5 rounded-md cursor-pointer flex items-center space-x-2
            transition-all duration-200 
            ${filters.cuisine === "" 
              ? "bg-[#edf5ef] border-[#4b7e53] text-[#4b7e53] border" 
              : "bg-white border-gray-200 hover:bg-gray-50 border"
            }
          `}
          onClick={() => handleCuisineChange("")}
        >
          <div 
            className={`
              w-4 h-4 rounded-full border flex items-center justify-center
              ${filters.cuisine === "" 
                ? "border-[#4b7e53]" 
                : "border-gray-400"
              }
            `}
          >
            {filters.cuisine === "" && (
              <div className="w-2 h-2 rounded-full bg-[#4b7e53]"></div>
            )}
          </div>
          
          <span className="text-sm font-medium">All</span>
        </div>

        {/* Other cuisine options */}
        {cuisineOptions.slice(1).map((option) => (
          <div 
            key={option.value}
            className={`
              p-1.5 rounded-md cursor-pointer flex items-center space-x-2
              transition-all duration-200 
              ${filters.cuisine === option.value 
                ? "bg-[#edf5ef] border-[#4b7e53] text-[#4b7e53] border" 
                : "bg-white border-gray-200 hover:bg-gray-50 border"
              }
            `}
            onClick={() => handleCuisineChange(option.value)}
          >
            <div 
              className={`
                w-4 h-4 rounded-full border flex items-center justify-center
                ${filters.cuisine === option.value 
                  ? "border-[#4b7e53]" 
                  : "border-gray-400"
                }
              `}
            >
              {filters.cuisine === option.value && (
                <div className="w-2 h-2 rounded-full bg-[#4b7e53]"></div>
              )}
            </div>
            
            <span className="text-sm">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;