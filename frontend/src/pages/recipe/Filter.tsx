import React, { useState } from "react";

interface Filters {
  cuisine: string;
}

interface FilterProps {
  onChange: (filters: Filters) => void;
}

const Filter: React.FC<FilterProps> = ({ onChange }) => {
  const [filters, setFilters] = useState({
    cuisine: "",
  });

  const [showFilters, setShowFilters] = useState(false);

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
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Filter Header */}
      <div className="bg-[#4b7e53] p-4 flex justify-between items-center">
        <h3 className="text-white font-semibold text-lg">Filters</h3>
        <button 
          className="md:hidden text-white p-1 hover:bg-[#3a6442] rounded transition-colors duration-200"
          onClick={() => setShowFilters(!showFilters)}
          aria-label={showFilters ? "Hide filters" : "Show filters"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {showFilters ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </div>

      {/* Cuisine Section */}
      <div className={`${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-gray-700 font-medium mb-3">Cuisine Type</h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {/* "All" option */}
            <div 
              className={`
                p-2.5 rounded-lg cursor-pointer flex items-center space-x-3
                transition-all duration-200 
                ${filters.cuisine === "" 
                  ? "bg-[#edf5ef] text-[#4b7e53] ring-1 ring-[#4b7e53]" 
                  : "hover:bg-gray-50"
                }
              `}
              onClick={() => handleCuisineChange("")}
            >
              <div 
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${filters.cuisine === "" 
                    ? "border-[#4b7e53]" 
                    : "border-gray-300"
                  }
                `}
              >
                {filters.cuisine === "" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4b7e53]"></div>
                )}
              </div>
              <span className={`text-sm ${filters.cuisine === "" ? "font-medium" : ""}`}>
                All Cuisines
              </span>
            </div>

            {/* Other cuisine options */}
            {cuisineOptions.slice(1).map((option) => (
              <div 
                key={option.value}
                className={`
                  p-2.5 rounded-lg cursor-pointer flex items-center space-x-3
                  transition-all duration-200 
                  ${filters.cuisine === option.value 
                    ? "bg-[#edf5ef] text-[#4b7e53] ring-1 ring-[#4b7e53]" 
                    : "hover:bg-gray-50"
                  }
                `}
                onClick={() => handleCuisineChange(option.value)}
              >
                <div 
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${filters.cuisine === option.value 
                      ? "border-[#4b7e53]" 
                      : "border-gray-300"
                    }
                  `}
                >
                  {filters.cuisine === option.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4b7e53]"></div>
                  )}
                </div>
                <span className={`text-sm ${filters.cuisine === option.value ? "font-medium" : ""}`}>
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;