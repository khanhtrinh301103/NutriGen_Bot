export const sendSearchRequest = async (searchTerm, cuisine, setResult) => {
  console.log("🚀 [Frontend] Sending search request...");
  console.log("🔍 Keyword:", searchTerm);
  console.log("🌍 Cuisine:", cuisine);

  try {
    const res = await fetch("http://localhost:5000/api/searchRecipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchTerm, cuisine }),
    });

    const data = await res.json();
    console.log("✅ [Frontend] Received results from backend:");
    console.table(data); // Display recipes in table format
    setResult(data);
  } catch (error) {
    console.error("❌ [Frontend] Error calling backend:", error);
  }
};

// New function to fetch recipe details by ID
export const getRecipeDetails = async (recipeId) => {
  console.log("🚀 [Frontend] Fetching recipe details for ID:", recipeId);
  
  // Validate ID
  if (!recipeId) {
    console.error("❌ [Frontend] Missing recipe ID");
    throw new Error("Recipe ID is required");
  }
  
  try {
    const res = await fetch(`http://localhost:5000/api/recipe/${recipeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    console.log("✅ [Frontend] Received recipe details from backend:", data.title);
    return data;
  } catch (error) {
    console.error("❌ [Frontend] Error fetching recipe details:", error);
    throw error; // Re-throw to handle in the component
  }
};