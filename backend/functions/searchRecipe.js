const express = require("express");
const axios = require("axios");
const router = express.Router();

const SPOONACULAR_API_KEY = "026008f475974904a5fff1f27ac6a23c";

router.post("/searchRecipe", async (req, res) => {
  const { searchTerm, cuisine } = req.body;

  console.log("📥 [Backend] Nhận yêu cầu tìm kiếm:");
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
      title: item.title,
      image: item.image,
      calories: item.nutrition?.nutrients?.find((n) => n.name === "Calories")?.amount || 0,
      protein: item.nutrition?.nutrients?.find((n) => n.name === "Protein")?.amount || 0,
      fat: item.nutrition?.nutrients?.find((n) => n.name === "Fat")?.amount || 0,
    }));

    console.log("✅ [Backend] Trả về", recipes.length, "món ăn:");
    console.table(recipes);

    return res.status(200).json(recipes);
  } catch (error) {
    console.error("❌ [Backend] Lỗi khi gọi Spoonacular:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
