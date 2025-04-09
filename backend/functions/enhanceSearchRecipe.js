/**
 * Enhanced recipe search with nutrition-aware functionality
 * Extends the basic recipe search with nutrition profile integration
 */

const express = require("express");
const axios = require("axios");
const router = express.Router();

// Import nutrition-related utilities
const { 
  processNutritionBasedSearch, 
  createSpoonacularParams, 
  combineSearchParams,
  shouldApplyNutritionProfile,
  enhanceRecipesWithNutritionInfo
} = require("../src/nutritionSearchProcessor");

const SPOONACULAR_API_KEY = "7a6e45249407478683346a18f937ba47";

// Main search endpoint
router.post("/searchRecipe", async (req, res) => {
  const { searchTerm, cuisine, nutritionProfile, nutritionMode } = req.body;

  console.log("📥 [Backend] Received enhanced search request:");
  console.log("🔍 Keyword:", searchTerm);
  console.log("🌍 Cuisine:", cuisine);
  console.log("📊 Nutrition Mode:", nutritionMode ? "Enabled" : "Disabled");

  try {
    // Start with basic search parameters
    let searchParams = {
      query: searchTerm,
      cuisine,
      addRecipeNutrition: true, // Always get nutrition info
      number: 50, // Get enough results for filtering
      apiKey: SPOONACULAR_API_KEY,
    };

    // Apply nutrition-based parameters if nutrition mode is enabled
    if (nutritionMode && nutritionProfile) {
      console.log("📊 [Backend] Applying nutrition profile to search");
      
      // Check if nutrition profile has required data
      if (shouldApplyNutritionProfile(nutritionProfile)) {
        // Generate nutrition-specific parameters
        const nutritionParams = createSpoonacularParams(nutritionProfile);
        // Combine with original search parameters
        searchParams = combineSearchParams(searchParams, nutritionParams);
        
        console.log("📊 [Backend] Final search parameters:", JSON.stringify(searchParams, null, 2));
      } else {
        console.log("⚠️ [Backend] Nutrition profile incomplete, using basic search");
      }
    }

    // Khởi tạo các biến theo dõi fallback
    let response;
    let didFallback = false;
    let fallbackMessage = "";
    let fallbackType = "";

    // Thử tìm kiếm với tất cả tham số
    console.log("🔄 [Backend] Calling Spoonacular API with parameters");
    response = await axios.get("https://api.spoonacular.com/recipes/complexSearch", {
      params: searchParams,
    });

    // Kiểm tra nếu không có kết quả, thực hiện fallback theo mức độ
    if (response.data.results.length === 0 && nutritionMode && nutritionProfile) {
      console.log("⚠️ [Backend] No results with strict parameters, trying fallback #1: Removing diet restriction");
      
      // Fallback 1: Thử lại với việc loại bỏ tham số diet
      const fallback1Params = {...searchParams};
      delete fallback1Params.diet;
      
      const fallback1Response = await axios.get("https://api.spoonacular.com/recipes/complexSearch", {
        params: fallback1Params,
      });

      if (fallback1Response.data.results.length > 0) {
        console.log(`✅ [Backend] Fallback #1 successful: Found ${fallback1Response.data.results.length} recipes without diet restriction`);
        response = fallback1Response;
        didFallback = true;
        fallbackType = "diet";
        fallbackMessage = "Diet restrictions were relaxed to find results";
      } else {
        console.log("⚠️ [Backend] Fallback #1 failed, trying fallback #2: Relaxing nutrition parameters");
        
        // Fallback 2: Thử lại với việc nới lỏng tham số dinh dưỡng
        const fallback2Params = {...fallback1Params};
        
        // Nới lỏng giới hạn dinh dưỡng
        if (fallback2Params.minCalories) fallback2Params.minCalories = Math.floor(fallback2Params.minCalories * 0.7);
        if (fallback2Params.maxCalories) fallback2Params.maxCalories = Math.ceil(fallback2Params.maxCalories * 1.3);
        if (fallback2Params.minProtein) fallback2Params.minProtein = Math.floor(fallback2Params.minProtein * 0.6);
        if (fallback2Params.maxProtein) fallback2Params.maxProtein = Math.ceil(fallback2Params.maxProtein * 1.4);
        if (fallback2Params.minCarbs) fallback2Params.minCarbs = Math.floor(fallback2Params.minCarbs * 0.6);
        if (fallback2Params.maxCarbs) fallback2Params.maxCarbs = Math.ceil(fallback2Params.maxCarbs * 1.4);
        if (fallback2Params.minFat) fallback2Params.minFat = Math.floor(fallback2Params.minFat * 0.6);
        if (fallback2Params.maxFat) fallback2Params.maxFat = Math.ceil(fallback2Params.maxFat * 1.4);
        
        console.log("🔄 [Backend] Fallback #2 parameters:", JSON.stringify(fallback2Params, null, 2));
        
        const fallback2Response = await axios.get("https://api.spoonacular.com/recipes/complexSearch", {
          params: fallback2Params,
        });

        if (fallback2Response.data.results.length > 0) {
          console.log(`✅ [Backend] Fallback #2 successful: Found ${fallback2Response.data.results.length} recipes with relaxed nutrition parameters`);
          response = fallback2Response;
          didFallback = true;
          fallbackType = "nutrition";
          fallbackMessage = "Diet restrictions and nutrition ranges were relaxed to find results";
        } else {
          console.log("⚠️ [Backend] Fallback #2 failed, trying fallback #3: Basic search with nutrition");
          
          // Fallback 3: Chỉ giữ lại tìm kiếm cơ bản + addRecipeNutrition
          const fallback3Params = {
            query: searchTerm,
            cuisine,
            addRecipeNutrition: true,
            number: 50,
            apiKey: SPOONACULAR_API_KEY,
          };
          
          const fallback3Response = await axios.get("https://api.spoonacular.com/recipes/complexSearch", {
            params: fallback3Params,
          });

          if (fallback3Response.data.results.length > 0) {
            console.log(`✅ [Backend] Fallback #3 successful: Found ${fallback3Response.data.results.length} recipes with basic search`);
            response = fallback3Response;
            didFallback = true;
            fallbackType = "basic";
            fallbackMessage = "Using basic search results and applying nutrition filtering afterward";
          }
        }
      }
    }

    // Extract and process results
    let recipes = response.data.results.map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image,
      imageType: item.imageType,
      calories: item.nutrition?.nutrients?.find((n) => n.name === "Calories")?.amount || 0,
      protein: item.nutrition?.nutrients?.find((n) => n.name === "Protein")?.amount || 0, 
      carbs: item.nutrition?.nutrients?.find((n) => n.name === "Carbohydrates")?.amount || 0,
      fat: item.nutrition?.nutrients?.find((n) => n.name === "Fat")?.amount || 0,
      // Store full nutrition data for later processing
      nutrition: item.nutrition,
      diets: item.diets || [],
      summary: item.summary || "",
      extendedIngredients: item.extendedIngredients || []
    }));

    console.log("✅ [Backend] Retrieved", recipes.length, "recipes from Spoonacular");

    // Apply nutrition-based processing if nutrition mode is enabled
    if (nutritionMode && nutritionProfile && recipes.length > 0) {
      if (shouldApplyNutritionProfile(nutritionProfile)) {
        console.log("📊 [Backend] Processing recipes with nutrition profile");
        
        // Process recipes with nutrition profile
        recipes = processNutritionBasedSearch(recipes, nutritionProfile);
        
        // Log some sample data including scores
        if (recipes.length > 0) {
          console.log("🔢 [Backend] Top match:", recipes[0].title);
          console.log("📊 Match score:", recipes[0].overallMatchPercentage);
        }
      } else {
        // Still add basic nutrition match info even if full profile processing isn't applied
        recipes = enhanceRecipesWithNutritionInfo(recipes, nutritionProfile);
      }
    }

    // Before returning, clean up response by removing large object properties
    // to reduce bandwidth and prevent browser memory issues
    const cleanedRecipes = recipes.map(recipe => {
      const { 
        nutrition, extendedIngredients, summary, ...essentialData 
      } = recipe;
      
      return {
        ...essentialData,
        nutritionMatchPercentage: recipe.nutritionMatchPercentage,
        overallMatchPercentage: recipe.overallMatchPercentage,
        nutritionInfo: recipe.nutritionInfo
      };
    });
    
    console.log("✅ [Backend] Returning", cleanedRecipes.length, "processed recipes");
    // Log some sample data including IDs
    if (cleanedRecipes.length > 0) {
      console.log("🔢 [Backend] Sample recipe with ID:", cleanedRecipes[0].id, "Title:", cleanedRecipes[0].title);
    }
    
    // Gửi kết quả kèm thông tin fallback nếu có
    if (didFallback) {
      console.log(`ℹ️ [Backend] Response includes fallback info: ${fallbackMessage}`);
      return res.status(200).json({
        recipes: cleanedRecipes,
        fallback: {
          applied: true,
          type: fallbackType,
          message: fallbackMessage
        }
      });
    } else {
      return res.status(200).json(cleanedRecipes);
    }
  } catch (error) {
    console.error("❌ [Backend] Error calling Spoonacular API:", error.message);
    
    // More detailed error logging
    if (error.response) {
      console.error("❌ [Backend] API Error Status:", error.response.status);
      console.error("❌ [Backend] API Error Data:", error.response.data);
    }
    
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message
    });
  }
});

module.exports = router;