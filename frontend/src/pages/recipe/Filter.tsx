import React, { useState } from "react";

interface FilterProps {
  onChange: (filters: any) => void;
}

const Filter: React.FC<FilterProps> = ({ onChange }) => {
  const [filters, setFilters] = useState({
    cuisine: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updated = { ...prev, [name]: value };
      onChange(updated);
      return updated;
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
      <select
        name="cuisine"
        value={filters.cuisine}
        onChange={handleChange}
        className="block w-full p-2 border border-gray-300 rounded-md"
      >
        <option value="">All</option>
        <option value="italian">Italian</option>
        <option value="mexican">Mexican</option>
        <option value="japanese">Japanese</option>
        <option value="vietnamese">Vietnamese</option>
      </select>
    </div>
  );
};

export default Filter;
