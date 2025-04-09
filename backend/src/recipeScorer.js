/**
 * Recipe scoring utility based on nutrition targets
 * Scores recipes according to how well they match the user's nutrition targets
 */

/**
 * Calculates a nutritional match score for a recipe
 * @param {Object} recipe - Recipe object from Spoonacular API
 * @param {Object} nutritionTargets - User's nutrition targets
 * @returns {Number} Score from 0-100 representing how well the recipe matches nutrition targets
 */
function calculateNutritionMatchScore(recipe, nutritionTargets) {
    if (!recipe || !nutritionTargets) {
      console.log('⚠️ [Backend] Missing recipe or nutrition targets for scoring');
      return 0;
    }
    
    console.log(`🔢 [Backend] Calculating nutrition match score for recipe: ${recipe.title}`);
    
    // Extract recipe nutrients
    const recipeCalories = extractNutrientAmount(recipe, 'Calories');
    const recipeProtein = extractNutrientAmount(recipe, 'Protein');
    const recipeCarbs = extractNutrientAmount(recipe, 'Carbohydrates');
    const recipeFat = extractNutrientAmount(recipe, 'Fat');
    
    console.log(`📊 [Backend] Recipe nutrients - Calories: ${recipeCalories}, Protein: ${recipeProtein}g, Carbs: ${recipeCarbs}g, Fat: ${recipeFat}g`);
    
    // Get nutrition targets
    const targetCalories = nutritionTargets.calories?.target || 0;
    const targetProtein = nutritionTargets.protein?.target || 0;
    const targetCarbs = nutritionTargets.carbs?.target || 0;
    const targetFat = nutritionTargets.fat?.target || 0;
    
    // Calculate scores for each nutrient (0-100 for each)
    const caloriesScore = calculateNutrientScore(recipeCalories, targetCalories, nutritionTargets.calories?.min, nutritionTargets.calories?.max);
    const proteinScore = calculateNutrientScore(recipeProtein, targetProtein, nutritionTargets.protein?.min, nutritionTargets.protein?.max);
    const carbsScore = calculateNutrientScore(recipeCarbs, targetCarbs, nutritionTargets.carbs?.min, nutritionTargets.carbs?.max);
    const fatScore = calculateNutrientScore(recipeFat, targetFat, nutritionTargets.fat?.min, nutritionTargets.fat?.max);
    
    // Weight the scores (protein is weighted higher as it's typically more important for fitness goals)
    const weightedScore = (caloriesScore * 0.35) + (proteinScore * 0.3) + (carbsScore * 0.2) + (fatScore * 0.15);
    
    console.log(`📊 [Backend] Nutrient scores - Calories: ${caloriesScore}, Protein: ${proteinScore}, Carbs: ${carbsScore}, Fat: ${fatScore}`);
    console.log(`📊 [Backend] Final weighted score: ${weightedScore.toFixed(1)}`);
    
    return weightedScore;
  }
  
  /**
   * Calculates a score for a specific nutrient
   * @param {Number} actual - Actual amount of nutrient in recipe
   * @param {Number} target - Target amount of nutrient
   * @param {Number} min - Minimum acceptable amount
   * @param {Number} max - Maximum acceptable amount
   * @returns {Number} Score from 0-100
   */
  function calculateNutrientScore(actual, target, min, max) {
    // If no nutrition data is available, return a neutral score
    if (actual === undefined || actual === null || target === 0) {
      return 50;
    }
    
    // Use target +/- 10% as default range if min/max not provided
    const minValue = min || (target * 0.9);
    const maxValue = max || (target * 1.1);
    
    // Score is 100 if actual value is exactly at target
    if (actual === target) {
      return 100;
    }
    
    // Score is 80 if within min/max range
    if (actual >= minValue && actual <= maxValue) {
      const rangePosition = (actual - minValue) / (maxValue - minValue);
      const distanceFromIdeal = Math.abs(0.5 - rangePosition) * 2; // 0 at middle, 1 at edges
      return 80 + (20 * (1 - distanceFromIdeal)); // Score between 80-100 based on position in range
    }
    
    // Score decreases as values go outside the min/max range
    if (actual < minValue) {
      const deficit = minValue - actual;
      const percentDeficit = deficit / minValue;
      return Math.max(0, 80 - (percentDeficit * 100));
    } else {
      const excess = actual - maxValue;
      const percentExcess = excess / maxValue;
      return Math.max(0, 80 - (percentExcess * 80));
    }
  }
  
  /**
   * Extracts a nutrient amount from a recipe
   * @param {Object} recipe - Recipe object from Spoonacular API
   * @param {String} nutrientName - Name of the nutrient to extract
   * @returns {Number|undefined} Amount of the nutrient, or undefined if not found
   */
  function extractNutrientAmount(recipe, nutrientName) {
    // Try to find nutrient in nutrition.nutrients array
    if (recipe.nutrition && recipe.nutrition.nutrients && Array.isArray(recipe.nutrition.nutrients)) {
      const nutrient = recipe.nutrition.nutrients.find(n => 
        n.name.toLowerCase() === nutrientName.toLowerCase()
      );
      
      if (nutrient && nutrient.amount !== undefined) {
        return nutrient.amount;
      }
    }
    
    // Fallbacks for common nutrients if not found in nutrients array
    switch (nutrientName.toLowerCase()) {
      case 'calories':
        return recipe.calories !== undefined ? recipe.calories : undefined;
      case 'protein':
        return recipe.protein !== undefined ? extractNumericValue(recipe.protein) : undefined;
      case 'carbohydrates':
      case 'carbs':
        return recipe.carbs !== undefined ? extractNumericValue(recipe.carbs) : undefined;
      case 'fat':
        return recipe.fat !== undefined ? extractNumericValue(recipe.fat) : undefined;
      default:
        return undefined;
    }
  }
  
  /**
   * Extracts numeric value from a string like "10g"
   * @param {String|Number} value - Value to extract from
   * @returns {Number} Extracted numeric value
   */
  function extractNumericValue(value) {
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      const match = value.match(/^([\d.]+)/);
      if (match && match[1]) {
        return parseFloat(match[1]);
      }
    }
    
    return 0;
  }
  
  /**
   * Scores a batch of recipes based on nutrition targets
   * @param {Array} recipes - Array of recipe objects
   * @param {Object} nutritionTargets - User's nutrition targets
   * @returns {Array} Same recipes, but each with a nutritionScore property
   */
  function scoreRecipesByNutrition(recipes, nutritionTargets) {
    if (!recipes || !Array.isArray(recipes) || recipes.length === 0 || !nutritionTargets) {
      return recipes;
    }
    
    console.log(`🔢 [Backend] Scoring ${recipes.length} recipes by nutrition targets`);
    
    return recipes.map(recipe => {
      const nutritionScore = calculateNutritionMatchScore(recipe, nutritionTargets);
      
      return {
        ...recipe,
        nutritionScore
      };
    });
  }
  
  /**
   * Calculates the overall match score combining nutrition score and recommended ingredients score
   * @param {Array} recipes - Array of recipe objects with nutritionScore and recommendedScore
   * @returns {Array} Same recipes, with an overall matchScore property
   */
  function calculateOverallMatchScores(recipes) {
    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      return recipes;
    }
    
    console.log(`🔢 [Backend] Calculating overall match scores for ${recipes.length} recipes`);
    
    return recipes.map(recipe => {
      const nutritionScore = recipe.nutritionScore || 0;
      const recommendedScore = recipe.recommendedScore || 0;
      
      // Convert recommendedScore to 0-100 scale (max possible is typically 5-10 ingredients)
      const normalizedRecommendedScore = Math.min(100, recommendedScore * 10);
      
      // Overall score weights nutrition more heavily (70%) than ingredients (30%)
      const matchScore = (nutritionScore * 0.7) + (normalizedRecommendedScore * 0.3);
      
      return {
        ...recipe,
        matchScore
      };
    });
  }
  
  module.exports = {
    scoreRecipesByNutrition,
    calculateOverallMatchScores,
    calculateNutritionMatchScore
  };