/**
 * Nutrition-aware search processor for recipes
 * Enhances recipe search results with nutrition-based filtering and sorting
 */

const { filterRecipesByNutrition, rankByRecommendedIngredients } = require('./recipeFilter');
const { scoreRecipesByNutrition, calculateOverallMatchScores } = require('./recipeScorer');

/**
 * Processes search results with nutrition profile to enhance relevance
 * @param {Array} recipes - Original recipe search results from Spoonacular
 * @param {Object} nutritionProfile - User's nutrition profile with dietary restrictions
 * @returns {Array} Enhanced and sorted recipe search results
 */
function processNutritionBasedSearch(recipes, nutritionProfile) {
  if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
    console.log('⚠️ [Backend] No recipes to process for nutrition search');
    return [];
  }
  
  if (!nutritionProfile) {
    console.log('⚠️ [Backend] No nutrition profile provided, returning original results');
    return recipes;
  }
  
  console.log(`🔄 [Backend] Processing ${recipes.length} recipes with nutrition profile`);
  
  // Step 1: Filter recipes based on allergies and dietary restrictions
  const filteredRecipes = filterRecipesByNutrition(recipes, nutritionProfile);
  
  if (filteredRecipes.length === 0) {
    console.log('⚠️ [Backend] No recipes left after dietary filtering, returning original results');
    // Return original recipes if all were filtered out
    return recipes;
  }
  
  // Step 2: Score recipes based on how well they match nutrition targets
  const targetNutrition = nutritionProfile.targetNutrition || {};
  const scoredRecipes = scoreRecipesByNutrition(filteredRecipes, targetNutrition);
  
  // Step 3: Rank recipes by recommended ingredients
  const recommendedIngredients = nutritionProfile.recommendedIngredients || {};
  const rankedRecipes = rankByRecommendedIngredients(scoredRecipes, recommendedIngredients);
  
  // Step 4: Calculate overall match scores
  const finalRecipes = calculateOverallMatchScores(rankedRecipes);
  
  // Step 5: Sort by overall match score (descending)
  finalRecipes.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  
  console.log(`✅ [Backend] Processed recipes sorted by nutrition match: ${finalRecipes.length} results`);
  
  // Add match percentage for display purposes
  return finalRecipes.map(recipe => ({
    ...recipe,
    nutritionMatchPercentage: Math.round(recipe.nutritionScore || 0), // As a percentage
    recommendedIngredientsCount: recipe.recommendedScore || 0,
    overallMatchPercentage: Math.round(recipe.matchScore || 0) // As a percentage
  }));
}

/**
 * Enhances recipe objects with nutrition match information
 * @param {Array} recipes - Recipe array from search results
 * @param {Object} nutritionProfile - User's nutrition profile
 * @returns {Array} Enhanced recipes with nutrition match information
 */
function enhanceRecipesWithNutritionInfo(recipes, nutritionProfile) {
  if (!recipes || !nutritionProfile) {
    return recipes;
  }
  
  const targetNutrition = nutritionProfile.targetNutrition || {};
  
  return recipes.map(recipe => {
    // Calculate how well each nutrient matches the target
    const proteinTarget = targetNutrition.protein?.target || 0;
    const carbsTarget = targetNutrition.carbs?.target || 0;
    const fatTarget = targetNutrition.fat?.target || 0;
    
    const proteinActual = recipe.protein || 0;
    const carbsActual = recipe.carbs || 0;
    const fatActual = recipe.fat || 0;
    
    // Calculate match percentages (100% = exact match, can be over 100% if exceeds target)
    const proteinMatch = proteinTarget ? Math.min(200, Math.round((proteinActual / proteinTarget) * 100)) : 0;
    const carbsMatch = carbsTarget ? Math.min(200, Math.round((carbsActual / carbsTarget) * 100)) : 0;
    const fatMatch = fatTarget ? Math.min(200, Math.round((fatActual / fatTarget) * 100)) : 0;
    
    return {
      ...recipe,
      // Add nutrition match info
      nutritionInfo: {
        proteinMatch,
        carbsMatch,
        fatMatch,
        proteinTarget,
        carbsTarget,
        fatTarget
      }
    };
  });
}

/**
 * Creates parameter string for Spoonacular API based on nutrition profile
 * @param {Object} nutritionProfile - User's nutrition profile
 * @returns {Object} Parameters for Spoonacular API call
 */
function createSpoonacularParams(nutritionProfile) {
  if (!nutritionProfile) {
    return {};
  }
  
  console.log('🔧 [Backend] Creating Spoonacular API parameters from nutrition profile');
  
  const params = {
    addRecipeNutrition: true // Always get nutrition info
  };
  
  // Add nutrition target parameters if available
  if (nutritionProfile.targetNutrition) {
    const { calories, protein, carbs, fat } = nutritionProfile.targetNutrition;
    
    // Add min/max calorie range (with some flexibility)
    if (calories) {
      params.minCalories = calories.min ? Math.floor(calories.min * 0.8) : undefined;
      params.maxCalories = calories.max ? Math.ceil(calories.max * 1.2) : undefined;
      console.log(`🔢 [Backend] Calorie range: ${params.minCalories}-${params.maxCalories} kcal`);
    }
    
    // Add macronutrient ranges if available (less strict for API call, we'll refine later)
    if (protein) {
      params.minProtein = protein.min ? Math.floor(protein.min * 0.7) : undefined;
      params.maxProtein = protein.max ? Math.ceil(protein.max * 1.3) : undefined;
      console.log(`🔢 [Backend] Protein range: ${params.minProtein}-${params.maxProtein}g`);
    }
    
    if (carbs) {
      params.minCarbs = carbs.min ? Math.floor(carbs.min * 0.7) : undefined;
      params.maxCarbs = carbs.max ? Math.ceil(carbs.max * 1.3) : undefined;
      console.log(`🔢 [Backend] Carbs range: ${params.minCarbs}-${params.maxCarbs}g`);
    }
    
    if (fat) {
      params.minFat = fat.min ? Math.floor(fat.min * 0.7) : undefined;
      params.maxFat = fat.max ? Math.ceil(fat.max * 1.3) : undefined;
      console.log(`🔢 [Backend] Fat range: ${params.minFat}-${params.maxFat}g`);
    }
  }
  
  // Add dietary restrictions if available
  if (nutritionProfile.dietaryProfile && nutritionProfile.dietaryProfile.restrictions) {
    const restrictions = nutritionProfile.dietaryProfile.restrictions;
    
    // Map our dietary restrictions to Spoonacular diet parameters
    const dietMap = {
      'Vegetarian': 'vegetarian',
      'Vegan': 'vegan',
      'Gluten-Free': 'gluten free',
      'Dairy-Free': 'dairy free',
      'Keto': 'ketogenic',
      'Paleo': 'paleo'
    };
    
    // Find the first matching diet parameter
    for (const restriction of restrictions) {
      if (dietMap[restriction]) {
        params.diet = dietMap[restriction];
        console.log(`🔢 [Backend] Diet parameter: ${params.diet}`);
        break; // Use only the first matching diet to avoid over-restricting results
      }
    }
    
    // Add intolerances parameter for allergies
    if (nutritionProfile.dietaryProfile.allergies && nutritionProfile.dietaryProfile.allergies.length > 0) {
      // Map our allergies to Spoonacular intolerances
      const intoleranceMap = {
        'Dairy': 'dairy',
        'Egg': 'egg',
        'Gluten': 'gluten',
        'Grain': 'grain',
        'Peanut': 'peanut',
        'Seafood': 'seafood',
        'Shellfish': 'shellfish',
        'Soy': 'soy',
        'Sulfite': 'sulfite',
        'Tree Nut': 'tree nut',
        'Wheat': 'wheat'
      };
      
      const intolerances = nutritionProfile.dietaryProfile.allergies
        .map(allergy => intoleranceMap[allergy])
        .filter(Boolean);
      
      if (intolerances.length > 0) {
        params.intolerances = intolerances.join(',');
        console.log(`🔢 [Backend] Intolerances parameter: ${params.intolerances}`);
      }
    }
  }
  
  return params;
}

/**
 * Combines the original search parameters with nutrition-based parameters
 * @param {Object} originalParams - Original search parameters (query, cuisine)
 * @param {Object} nutritionParams - Parameters derived from nutrition profile
 * @returns {Object} Combined parameters for API call
 */
function combineSearchParams(originalParams, nutritionParams) {
  return {
    ...originalParams,
    ...nutritionParams,
    // Ensure these crucial parameters are always included
    addRecipeNutrition: true,
    number: 50, // Get more results to allow for filtering
  };
}

/**
 * Determines if a nutrition profile should be applied for search
 * @param {Object} nutritionProfile - User's nutrition profile
 * @returns {Boolean} True if the profile should be applied
 */
function shouldApplyNutritionProfile(nutritionProfile) {
  // Check if we have a valid nutrition profile with essential data
  if (!nutritionProfile || !nutritionProfile.targetNutrition) {
    console.log('⚠️ [Backend] Invalid or missing nutrition profile');
    return false;
  }
  
  // Check if we have the minimum required nutrition targets
  const { calories, protein } = nutritionProfile.targetNutrition;
  if (!calories || !calories.target || !protein || !protein.target) {
    console.log('⚠️ [Backend] Nutrition profile missing essential targets');
    return false;
  }
  
  console.log('✅ [Backend] Valid nutrition profile, will apply to search');
  return true;
}

module.exports = {
  processNutritionBasedSearch,
  createSpoonacularParams,
  combineSearchParams,
  shouldApplyNutritionProfile,
  enhanceRecipesWithNutritionInfo
};