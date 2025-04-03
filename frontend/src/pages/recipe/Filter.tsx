import React, { useState } from "react";

interface FilterProps {
  onChange: (filters: any) => void;
}

const Filter: React.FC<FilterProps> = ({ onChange }) => {
  const [filters, setFilters] = useState({
    cuisine: "",
  });

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
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
      <h3 className="font-medium text-[#4b7e53] mb-3">Cuisine</h3>
      
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-2">
        {/* "All" option gets its own line and is wider */}
        <div className="col-span-2 md:col-span-3 lg:col-span-2 mb-1">
          <div 
            className={`
              p-2 rounded-md cursor-pointer flex items-center space-x-2
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
        </div>

        {/* Rest of cuisine options in grid layout */}
        {cuisineOptions.slice(1).map((option) => (
          <div key={option.value}>
            <div 
              className={`
                p-2 rounded-md cursor-pointer flex items-center space-x-2
                transition-all duration-200 h-full
                ${filters.cuisine === option.value 
                  ? "bg-[#edf5ef] border-[#4b7e53] text-[#4b7e53] border" 
                  : "bg-white border-gray-200 hover:bg-gray-50 border"
                }
              `}
              onClick={() => handleCuisineChange(option.value)}
            >
              <div 
                className={`
                  min-w-4 h-4 rounded-full border flex items-center justify-center
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
              
              <span className="text-sm truncate">{option.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;