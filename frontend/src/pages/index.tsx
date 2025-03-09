import { useState } from "react";
import { getRecipe } from "../api/getRecipe";

export default function Home() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const data = await getRecipe(query);
    setRecipes(data);
  };

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <h1>NutriGen Bot - Recipe Finder</h1>
      <input
        type="text"
        placeholder="Enter ingredient (e.g., pasta)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "10px", marginRight: "10px" }}
      />
      <button onClick={handleSearch} style={{ padding: "10px" }}>Search</button>

      {recipes.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          {recipes.map((recipe) => (
            <div key={recipe.id} style={{ marginBottom: "20px" }}>
              <img src={recipe.image} alt={recipe.title} width="200" />
              <h3>{recipe.title}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
