const express = require("express");
const axios = require("axios");
const router = express.Router();

const SPOONACULAR_API_KEY = "9c657b351ef94436ba49efe35a78d955";

/**
 * Get detailed recipe information by ID
 * Combines multiple Spoonacular API endpoints to get comprehensive recipe details
 */
router.get("/recipe/:id", async (req, res) => {
  const { id } = req.params;
  
  console.log("📥 [Backend] Received recipe details request for ID:", id);
  
  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    console.error("❌ [Backend] Invalid recipe ID:", id);
    return res.status(400).json({ 
      error: "Invalid recipe ID",
      message: "Recipe ID must be a valid number" 
    });
  }
  
  try {
    // Parallel API calls to get all required information
    const [basicInfoResponse, nutritionResponse, ingredientsResponse, instructionsResponse] = await Promise.all([
      axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
        params: { apiKey: SPOONACULAR_API_KEY }
      }),
      axios.get(`https://api.spoonacular.com/recipes/${id}/nutritionWidget.json`, {
        params: { apiKey: SPOONACULAR_API_KEY }
      }),
      axios.get(`https://api.spoonacular.com/recipes/${id}/ingredientWidget.json`, {
        params: { apiKey: SPOONACULAR_API_KEY }
      }),
      axios.get(`https://api.spoonacular.com/recipes/${id}/analyzedInstructions`, {
        params: { apiKey: SPOONACULAR_API_KEY }
      })
    ]);
    
    console.log("✅ [Backend] Successfully retrieved recipe data from Spoonacular");
    
    // Extract basic recipe information
    const basicInfo = basicInfoResponse.data;
    const nutrition = nutritionResponse.data;
    const ingredients = ingredientsResponse.data;
    const instructions = instructionsResponse.data;
    
    // Combine all data into a single response object
    const recipeDetails = {
      id: basicInfo.id,
      title: basicInfo.title,
      image: basicInfo.image.startsWith('http') 
        ? basicInfo.image 
        : `https://spoonacular.com/recipeImages/${basicInfo.id}-556x370.${basicInfo.imageType}`,
      imageType: basicInfo.imageType,
      servings: basicInfo.servings,
      readyInMinutes: basicInfo.readyInMinutes,
      preparationMinutes: basicInfo.preparationMinutes || Math.round(basicInfo.readyInMinutes / 2), // Estimate if not available
      cookingMinutes: basicInfo.cookingMinutes || Math.round(basicInfo.readyInMinutes / 2), // Estimate if not available
      
      // Categories
      cuisines: basicInfo.cuisines && basicInfo.cuisines.length > 0 ? basicInfo.cuisines : ["None"],
      diets: basicInfo.diets && basicInfo.diets.length > 0 ? basicInfo.diets : ["None"],
      dishTypes: basicInfo.dishTypes && basicInfo.dishTypes.length > 0 ? basicInfo.dishTypes : ["None"],
      
      // Nutrition information
      calories: nutrition.calories,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      protein: nutrition.protein,
      nutrients: nutrition.nutrients,
      
      // Ingredients information
      ingredients: ingredients.ingredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        amount: ing.amount.metric || ing.amount.us, // Prefer metric if available
        image: ing.image?.startsWith('http') 
          ? ing.image 
          : `https://spoonacular.com/cdn/ingredients_100x100/${ing.image}`
      })),
      
      // Cooking instructions
      instructions: instructions.length > 0 
        ? instructions[0].steps.map(step => ({
            number: step.number,
            step: step.step,
            ingredients: step.ingredients || []
          })) 
        : []
    };
    
    console.log("✅ [Backend] Returning compiled recipe details for ID:", id);
    
    return res.status(200).json(recipeDetails);
  } catch (error) {
    console.error("❌ [Backend] Error fetching recipe details:", error.message);
    
    // More detailed error logging
    if (error.response) {
      console.error("❌ [Backend] API Error Status:", error.response.status);
      console.error("❌ [Backend] API Error Data:", error.response.data);
    }
    
    return res.status(500).json({ 
      error: "Failed to fetch recipe details",
      message: error.message
    });
  }
});

module.exports = router;