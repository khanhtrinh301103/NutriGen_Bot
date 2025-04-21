/**
 * Recipe filtering utility based on dietary restrictions and allergies
 * Filters recipes according to user's nutrition profile
 */

// Mapping of common allergens to ingredient keywords that should be avoided
const ALLERGEN_KEYWORDS = {
    'Seafood': ['fish', 'salmon', 'tuna', 'tilapia', 'cod', 'shellfish', 'shrimp', 'crab', 'lobster', 'mussels', 'oysters', 'clams', 'seafood'],
    'Shellfish': ['shrimp', 'crab', 'lobster', 'clams', 'mussels', 'oysters', 'shellfish'],
    'Tree Nut': ['almond', 'walnut', 'cashew', 'hazelnut', 'pecan', 'pistachio', 'macadamia', 'brazil nut', 'pine nut'],
    'Peanut': ['peanut', 'peanuts', 'peanut butter'],
    'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy', 'whey', 'casein', 'lactose'],
    'Egg': ['egg', 'eggs', 'yolk', 'whites', 'mayonnaise'],
    'Gluten': ['wheat', 'barley', 'rye', 'gluten', 'bread', 'pasta', 'flour', 'couscous'],
    'Soy': ['soy', 'tofu', 'tempeh', 'edamame', 'soy sauce', 'miso', 'soy milk'],
    'Sesame': ['sesame', 'tahini', 'sesame oil', 'sesame seeds'],
    'Mustard': ['mustard'],
    'Sulphites': ['wine', 'vinegar', 'dried fruit']
  };
  
  // Mapping of diet types to excluded ingredients
  const DIET_EXCLUSIONS = {
    'Vegetarian': ['meat', 'chicken', 'beef', 'pork', 'turkey', 'lamb', 'bacon', 'ham', 'sausage', 'gelatin'],
    'Vegan': ['meat', 'chicken', 'beef', 'pork', 'turkey', 'lamb', 'bacon', 'ham', 'sausage', 'gelatin', 'milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'honey'],
    'Paleo': ['grain', 'cereal', 'bread', 'pasta', 'rice', 'dairy', 'milk', 'cheese', 'yogurt', 'legumes', 'beans', 'peanuts', 'sugar', 'corn', 'potato'],
    'Keto': ['sugar', 'bread', 'pasta', 'rice', 'potato', 'corn', 'grain', 'cereal', 'beans', 'legumes'],
    'Low-Carb': ['sugar', 'bread', 'pasta', 'rice', 'potato', 'corn', 'grain', 'cereal', 'fruit juice']
  };
  
  /**
   * Checks if a recipe is safe for a person with specific allergies
   * @param {Object} recipe - Recipe object from Spoonacular API
   * @param {Array} allergies - List of user allergies
   * @returns {Boolean} True if recipe is safe (doesn't contain allergens)
   */
  function isAllergySafe(recipe, allergies = []) {
    if (!allergies || allergies.length === 0) {
      console.log('🔍 [Backend] No allergies to check, recipe is safe');
      return true;
    }
    
    // Extract recipe ingredients as a string for easier keyword searching
    const ingredientText = extractIngredientText(recipe);
    console.log(`🔍 [Backend] Checking allergies for recipe: ${recipe.title}`);
    
    // Check each allergy
    for (const allergy of allergies) {
      const allergenKeywords = ALLERGEN_KEYWORDS[allergy] || [allergy.toLowerCase()];
      
      for (const keyword of allergenKeywords) {
        if (ingredientText.includes(keyword.toLowerCase())) {
          console.log(`⚠️ [Backend] Recipe contains allergen: ${keyword} (${allergy})`);
          return false;
        }
      }
    }
    
    console.log('✅ [Backend] Recipe is allergy-safe');
    return true;
  }
  
  /**
   * Checks if a recipe complies with dietary restrictions
   * @param {Object} recipe - Recipe object from Spoonacular API
   * @param {Array} dietaryRestrictions - List of dietary restrictions
   * @returns {Boolean} True if recipe complies with all dietary restrictions
   */
  function meetsDietaryRestrictions(recipe, dietaryRestrictions = []) {
    if (!dietaryRestrictions || dietaryRestrictions.length === 0) {
      console.log('🔍 [Backend] No dietary restrictions to check');
      return true;
    }
    
    // Extract recipe ingredients as a string
    const ingredientText = extractIngredientText(recipe);
    console.log(`🔍 [Backend] Checking dietary restrictions for recipe: ${recipe.title}`);
    
    // Use Spoonacular's diets property if available
    if (recipe.diets && Array.isArray(recipe.diets)) {
      for (const restriction of dietaryRestrictions) {
        const restrictionLower = restriction.toLowerCase();
        
        // Check if diet is explicitly matched in the recipe's diets array
        const matchedDiet = recipe.diets.find(diet => 
          diet.toLowerCase() === restrictionLower ||
          (restrictionLower === 'vegetarian' && diet.toLowerCase() === 'vegetarian') ||
          (restrictionLower === 'vegan' && diet.toLowerCase() === 'vegan') ||
          (restrictionLower === 'gluten-free' && diet.toLowerCase() === 'gluten free') ||
          (restrictionLower === 'dairy-free' && diet.toLowerCase() === 'dairy free') ||
          (restrictionLower === 'low-carb' && (diet.toLowerCase() === 'low carb' || diet.toLowerCase() === 'ketogenic'))
        );
        
        if (matchedDiet) {
          console.log(`✅ [Backend] Recipe explicitly matches diet: ${restriction}`);
          continue;
        }
        
        // If diet isn't explicitly matched, check ingredients
        const excludedIngredients = DIET_EXCLUSIONS[restriction] || [];
        
        for (const ingredient of excludedIngredients) {
          if (ingredientText.includes(ingredient.toLowerCase())) {
            console.log(`⚠️ [Backend] Recipe contains excluded ingredient for ${restriction}: ${ingredient}`);
            return false;
          }
        }
      }
    } else {
      // Fallback to ingredient text analysis if diets property isn't available
      for (const restriction of dietaryRestrictions) {
        const excludedIngredients = DIET_EXCLUSIONS[restriction] || [];
        
        for (const ingredient of excludedIngredients) {
          if (ingredientText.includes(ingredient.toLowerCase())) {
            console.log(`⚠️ [Backend] Recipe contains excluded ingredient for ${restriction}: ${ingredient}`);
            return false;
          }
        }
      }
    }
    
    console.log('✅ [Backend] Recipe meets all dietary restrictions');
    return true;
  }
  
  /**
   * Extracts all ingredients from a recipe as a single lowercase string
   * @param {Object} recipe - Recipe object from Spoonacular API
   * @returns {String} Combined ingredient text
   */
  function extractIngredientText(recipe) {
    let ingredientText = '';
    
    // Try to use the extendedIngredients array if available
    if (recipe.extendedIngredients && Array.isArray(recipe.extendedIngredients)) {
      ingredientText = recipe.extendedIngredients
        .map(ing => ing.name || ing.originalName || '')
        .join(' ').toLowerCase();
    } 
    // Otherwise use the title and summary as a fallback
    else {
      ingredientText = `${recipe.title || ''} ${recipe.summary || ''}`.toLowerCase();
    }
    
    return ingredientText;
  }
  
  /**
   * Filters recipes based on user's nutritional profile
   * @param {Array} recipes - List of recipe objects from Spoonacular API
   * @param {Object} nutritionProfile - User's nutrition profile with dietary restrictions
   * @returns {Array} Filtered recipes that match nutritional requirements
   */
  function filterRecipesByNutrition(recipes, nutritionProfile) {
    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      console.log('⚠️ [Backend] No recipes to filter');
      return [];
    }
    
    if (!nutritionProfile) {
      console.log('⚠️ [Backend] No nutrition profile provided, returning all recipes');
      return recipes;
    }
    
    console.log(`🔍 [Backend] Filtering ${recipes.length} recipes by nutrition profile`);
    
    // Extract dietary restrictions and allergies
    const allergies = nutritionProfile.dietaryProfile?.allergies || [];
    const dietaryRestrictions = nutritionProfile.dietaryProfile?.restrictions || [];
    
    console.log(`🔍 [Backend] User allergies: ${allergies.join(', ')}`);
    console.log(`🔍 [Backend] User dietary restrictions: ${dietaryRestrictions.join(', ')}`);
    
    // Filter recipes
    const filteredRecipes = recipes.filter(recipe => 
      isAllergySafe(recipe, allergies) && 
      meetsDietaryRestrictions(recipe, dietaryRestrictions)
    );
    
    console.log(`✅ [Backend] After filtering: ${filteredRecipes.length} recipes match criteria`);
    return filteredRecipes;
  }
  
  /**
   * Prioritizes recipes by recommended ingredients
   * @param {Array} recipes - List of recipe objects
   * @param {Object} recommendedIngredients - Recommended ingredients from nutrition profile
   * @returns {Array} Same recipes, but each with a recommendedScore property
   */
  function rankByRecommendedIngredients(recipes, recommendedIngredients) {
    if (!recipes || !Array.isArray(recipes) || recipes.length === 0 || !recommendedIngredients) {
      return recipes;
    }
    
    console.log(`🔢 [Backend] Ranking ${recipes.length} recipes by recommended ingredients`);
    
    // Create a flat array of all recommended ingredients
    const allRecommended = [];
    Object.values(recommendedIngredients).forEach(group => {
      if (Array.isArray(group)) {
        allRecommended.push(...group);
      }
    });
    
    // Score each recipe by counting recommended ingredients
    return recipes.map(recipe => {
      const ingredientText = extractIngredientText(recipe);
      let recommendedCount = 0;
      
      allRecommended.forEach(ingredient => {
        if (ingredientText.includes(ingredient.toLowerCase())) {
          recommendedCount++;
        }
      });
      
      return {
        ...recipe,
        recommendedScore: recommendedCount
      };
    });
  }
  
  module.exports = {
    filterRecipesByNutrition,
    isAllergySafe,
    meetsDietaryRestrictions,
    rankByRecommendedIngredients
  };