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

    // Ghi log danh sách nutrients có sẵn từ món ăn đầu tiên để kiểm tra
    if (response.data.results.length > 0 && response.data.results[0].nutrition) {
      console.log("💡 [Backend] Available nutrients:", 
        response.data.results[0].nutrition.nutrients.map(n => n.name)
      );
      
      // Log chi tiết về Carbohydrates để kiểm tra
      const carbsData = response.data.results[0].nutrition.nutrients.find(n => n.name === "Carbohydrates");
      console.log("💡 [Backend] Carbohydrates data:", carbsData);
    }

    const recipes = response.data.results.map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image,
      imageType: item.imageType, // Thêm trường này để đồng bộ với enhanceSearchRecipe.js
      calories: item.nutrition?.nutrients?.find((n) => n.name === "Calories")?.amount || 0,
      protein: item.nutrition?.nutrients?.find((n) => n.name === "Protein")?.amount || 0,
      fat: item.nutrition?.nutrients?.find((n) => n.name === "Fat")?.amount || 0,
      carbs: item.nutrition?.nutrients?.find((n) => n.name === "Carbohydrates")?.amount || 0, // Thêm trường carbs
    }));

    console.log("✅ [Backend] Returning", recipes.length, "recipes:");
    // Log sample data để kiểm tra
    if (recipes.length > 0) {
      console.log("🔢 [Backend] Sample recipe with ID:", recipes[0].id, "Title:", recipes[0].title);
      console.log("📊 [Backend] Sample nutrition data:", {
        calories: recipes[0].calories,
        protein: recipes[0].protein,
        fat: recipes[0].fat,
        carbs: recipes[0].carbs
      });
    }
    
    return res.status(200).json(recipes);
  } catch (error) {
    console.error("❌ [Backend] Error calling Spoonacular API:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});