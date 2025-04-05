const express = require("express");
const axios = require("axios");
const router = express.Router();

const SPOONACULAR_API_KEY = "7a6e45249407478683346a18f937ba47";

router.post("/searchRecipe", async (req, res) => {
  const { searchTerm, cuisine } = req.body;

  console.log("📥 [Backend] Received search request:");
  console.log("🔍 Keyword:", searchTerm);
  console.log("🌍 Cuisine:", cuisine);

  try {
    const response = await axios.get("https://api.spoonacular.com/recipes/complexSearch", {
      params: {
        query: searchTerm,
        cuisine,
        number: 50,
        addRecipeNutrition: true,
        apiKey: SPOONACULAR_API_KEY,
      },
    });

    const recipes = response.data.results.map((item) => ({
      id: item.id, // Added ID field
      title: item.title,
      image: item.image,
      calories: item.nutrition?.nutrients?.find((n) => n.name === "Calories")?.amount || 0,
      protein: item.nutrition?.nutrients?.find((n) => n.name === "Protein")?.amount || 0,
      fat: item.nutrition?.nutrients?.find((n) => n.name === "Fat")?.amount || 0,
    }));

    console.log("✅ [Backend] Returning", recipes.length, "recipes:");
    // Log some sample data including IDs
    if (recipes.length > 0) {
      console.log("🔢 [Backend] Sample recipe with ID:", recipes[0].id, "Title:", recipes[0].title);
    }
    
    return res.status(200).json(recipes);
  } catch (error) {
    console.error("❌ [Backend] Error calling Spoonacular API:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;