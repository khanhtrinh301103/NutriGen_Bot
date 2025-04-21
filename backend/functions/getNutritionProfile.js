// backend/functions/getNutritionProfile.js
const express = require('express');
const router = express.Router();

/**
 * Constants for dietary relationships and restrictions
 */
const ALLERGY_RELATIONSHIPS = {
  'Gluten': ['Wheat'],
  'Grain': ['Wheat'],
  'Seafood': ['Shellfish'],
};

const DIET_RESTRICTIONS = {
  'Vegetarian': ['Chicken', 'Turkey', 'Beef', 'Pork', 'Seafood', 'Shellfish', 'Fish'],
  'Vegan': ['Chicken', 'Turkey', 'Beef', 'Pork', 'Seafood', 'Shellfish', 'Fish', 'Dairy', 'Egg', 'Honey'],
  'Gluten-Free': ['Gluten', 'Wheat', 'Barley', 'Rye'],
  'Dairy-Free': ['Dairy', 'Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream'],
  'Low-Carb': ['Sugar', 'Refined Flour', 'Bread', 'Pasta', 'Rice', 'Potatoes'],
  'Keto': ['Sugar', 'Bread', 'Pasta', 'Rice', 'Potatoes', 'High-Sugar Fruits'],
  'Paleo': ['Dairy', 'Grain', 'Legumes', 'Processed Foods', 'Refined Sugar'],
  'Pescatarian': ['Chicken', 'Turkey', 'Beef', 'Pork'],
  'Mediterranean': ['Processed Foods', 'Red Meat', 'Refined Sugar', 'Butter'],
};

// Mapping of common allergens to their specific ingredients
const ALLERGEN_INGREDIENTS = {
  'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'whey', 'casein'],
  'Egg': ['eggs', 'egg whites', 'egg yolks', 'mayonnaise'],
  'Gluten': ['wheat', 'barley', 'rye', 'bread', 'pasta', 'flour'],
  'Grain': ['wheat', 'barley', 'rye', 'oats', 'corn', 'rice'],
  'Peanut': ['peanuts', 'peanut butter', 'peanut oil'],
  'Seafood': ['fish', 'salmon', 'tuna', 'tilapia', 'cod', 'shellfish', 'shrimp', 'crab', 'lobster'],
  'Shellfish': ['shrimp', 'crab', 'lobster', 'clams', 'mussels', 'oysters'],
  'Soy': ['soy sauce', 'tofu', 'tempeh', 'edamame', 'soy milk', 'soy lecithin'],
  'Sulfite': ['wine', 'dried fruits', 'condiments'],
  'Tree Nut': ['almonds', 'walnuts', 'cashews', 'hazelnuts', 'pecans', 'pistachios', 'coconut'],
  'Wheat': ['bread', 'pasta', 'flour', 'cereals', 'crackers']
};

// Food groups categorized by nutritional profile
const FOOD_GROUPS = {
  'high_protein': {
    'animal': ['chicken breast', 'turkey', 'lean beef', 'pork tenderloin', 'salmon', 'tuna', 'eggs'],
    'plant': ['tofu', 'tempeh', 'seitan', 'lentils', 'chickpeas', 'black beans', 'quinoa', 'edamame']
  },
  'healthy_fats': {
    'oils': ['olive oil', 'avocado oil', 'coconut oil'],
    'nuts_seeds': ['almonds', 'walnuts', 'chia seeds', 'flax seeds', 'hemp seeds', 'pumpkin seeds', 'sunflower seeds'],
    'other': ['avocado', 'olives', 'coconut', 'dark chocolate']
  },
  'complex_carbs': {
    'whole_grains': ['brown rice', 'quinoa', 'oats', 'barley', 'buckwheat', 'whole grain bread'],
    'starchy_veg': ['sweet potatoes', 'potatoes', 'butternut squash', 'corn', 'peas'],
    'legumes': ['black beans', 'chickpeas', 'lentils', 'kidney beans', 'pinto beans']
  },
  'vegetables': {
    'leafy_greens': ['spinach', 'kale', 'arugula', 'collard greens', 'swiss chard', 'lettuce'],
    'cruciferous': ['broccoli', 'cauliflower', 'brussels sprouts', 'cabbage', 'bok choy'],
    'other': ['bell peppers', 'tomatoes', 'cucumber', 'carrots', 'zucchini', 'onions', 'garlic']
  },
  'fruits': {
    'berries': ['blueberries', 'strawberries', 'raspberries', 'blackberries'],
    'citrus': ['oranges', 'lemons', 'limes', 'grapefruit'],
    'other': ['apples', 'bananas', 'pears', 'peaches', 'pineapple', 'mango', 'watermelon']
  }
};

/**
 * Route that handles nutrition profile requests from the frontend
 * It receives user health profile data and returns nutrition recommendations
 */
router.post('/nutrition-profile', (req, res) => {
  console.log('🔄 [Backend] Received nutrition profile request');
  
  try {
    // Extract data from request body
    const profileData = req.body;
    console.log('📊 [Backend] Received profile data:', JSON.stringify(profileData, null, 2));
    
    // Validate request data
    if (!profileData || !profileData.user || !profileData.user.id) {
      console.error('❌ [Backend] Invalid request data: Missing user ID');
      return res.status(400).json({ error: 'Invalid request data: Missing user ID' });
    }
    
    // Check if nutrition data exists
    if (!profileData.nutrition) {
      console.error('❌ [Backend] Invalid request data: Missing nutrition data');
      return res.status(400).json({ error: 'Invalid request data: Missing nutrition data' });
    }
    
    // Extract key nutrition values
    const { caloriesPerMeal, proteinPerMeal, carbsPerMeal, fatPerMeal } = profileData.nutrition;
    
    // Log the specific meal nutrition values we're interested in
    console.log('🍽️ [Backend] Per meal nutrition targets:', {
      caloriesPerMeal,
      proteinPerMeal,
      carbsPerMeal,
      fatPerMeal
    });
    
    // Process nutrition profile and generate recommendations
    const nutritionRecommendations = generateNutritionRecommendations(profileData);
    
    // Return nutrition recommendations
    console.log('✅ [Backend] Sending nutrition recommendations response');
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      recommendations: nutritionRecommendations
    });
    
  } catch (error) {
    console.error('❌ [Backend] Error processing nutrition profile:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Expands allergy list to include related allergies
 * @param {Array} allergies - List of user allergies
 * @returns {Array} Expanded list of allergies
 */
function expandAllergies(allergies) {
  const expandedAllergies = [...allergies];
  
  // Add related allergies
  allergies.forEach(allergy => {
    if (ALLERGY_RELATIONSHIPS[allergy]) {
      ALLERGY_RELATIONSHIPS[allergy].forEach(relatedAllergy => {
        if (!expandedAllergies.includes(relatedAllergy)) {
          expandedAllergies.push(relatedAllergy);
          console.log(`⚠️ [Backend] Added related allergy: ${relatedAllergy} (related to ${allergy})`);
        }
      });
    }
  });
  
  return expandedAllergies;
}

/**
 * Expands dietary restrictions to include all restricted ingredients
 * @param {Array} restrictions - List of user dietary restrictions
 * @returns {Array} List of all restricted ingredients
 */
function getRestrictedIngredients(restrictions) {
  const restrictedIngredients = [];
  
  // For each dietary restriction, add its restricted ingredients
  restrictions.forEach(restriction => {
    if (DIET_RESTRICTIONS[restriction]) {
      DIET_RESTRICTIONS[restriction].forEach(ingredient => {
        if (!restrictedIngredients.includes(ingredient)) {
          restrictedIngredients.push(ingredient);
          console.log(`🚫 [Backend] Added restricted ingredient: ${ingredient} (from ${restriction} diet)`);
        }
      });
    }
  });
  
  return restrictedIngredients;
}

/**
 * Gets specific ingredients to avoid based on allergies
 * @param {Array} allergies - List of user allergies
 * @returns {Array} List of specific ingredients to avoid
 */
function getAllergenIngredients(allergies) {
  const allergenIngredients = [];
  
  allergies.forEach(allergy => {
    if (ALLERGEN_INGREDIENTS[allergy]) {
      ALLERGEN_INGREDIENTS[allergy].forEach(ingredient => {
        if (!allergenIngredients.includes(ingredient)) {
          allergenIngredients.push(ingredient);
          console.log(`⚠️ [Backend] Added allergen ingredient: ${ingredient} (from ${allergy} allergy)`);
        }
      });
    } else {
      // If we don't have a specific list for this allergy, add the allergy itself
      allergenIngredients.push(allergy.toLowerCase());
      console.log(`⚠️ [Backend] Added general allergen: ${allergy.toLowerCase()}`);
    }
  });
  
  return allergenIngredients;
}

/**
 * Generates nutrition recommendations based on user's health profile
 * @param {Object} profileData - User's health profile data
 * @returns {Object} Nutrition recommendations
 */
function generateNutritionRecommendations(profileData) {
  console.log('🧮 [Backend] Generating nutrition recommendations');
  
  // Extract key nutrition values
  const { 
    caloriesPerMeal = 0, 
    proteinPerMeal = 0, 
    carbsPerMeal = 0, 
    fatPerMeal = 0 
  } = profileData.nutrition || {};
  
  // Extract dietary restrictions and allergies
  const dietaryRestrictions = profileData.diet?.dietaryRestrictions || [];
  const rawAllergies = profileData.diet?.allergies || [];
  
  // Expand allergies to include related ones
  const allergies = expandAllergies(rawAllergies);
  
  console.log('🍽️ [Backend] Diet restrictions:', dietaryRestrictions);
  console.log('⚠️ [Backend] Original allergies:', rawAllergies);
  console.log('⚠️ [Backend] Expanded allergies:', allergies);
  
  // Calculate macronutrient distributions
  const proteinCalories = proteinPerMeal * 4; // 4 calories per gram
  const carbCalories = carbsPerMeal * 4; // 4 calories per gram
  const fatCalories = fatPerMeal * 9; // 9 calories per gram
  
  const proteinPercentage = Math.round((proteinCalories / caloriesPerMeal) * 100);
  const carbPercentage = Math.round((carbCalories / caloriesPerMeal) * 100);
  const fatPercentage = Math.round((fatCalories / caloriesPerMeal) * 100);
  
  // Calculate target ranges (±10% flexibility)
  const recommendations = {
    targetNutrition: {
      calories: {
        target: caloriesPerMeal,
        min: Math.round(caloriesPerMeal * 0.9),
        max: Math.round(caloriesPerMeal * 1.1)
      },
      protein: {
        target: proteinPerMeal,
        min: Math.round(proteinPerMeal * 0.9),
        max: Math.round(proteinPerMeal * 1.1),
        percentage: proteinPercentage
      },
      carbs: {
        target: carbsPerMeal,
        min: Math.round(carbsPerMeal * 0.9),
        max: Math.round(carbsPerMeal * 1.1),
        percentage: carbPercentage
      },
      fat: {
        target: fatPerMeal,
        min: Math.round(fatPerMeal * 0.9),
        max: Math.round(fatPerMeal * 1.1),
        percentage: fatPercentage
      }
    },
    dietaryProfile: {
      restrictions: dietaryRestrictions,
      allergies: allergies
    },
    recommendedIngredients: generateRecommendedIngredients(profileData, dietaryRestrictions, allergies),
    recommendedMealTypes: generateRecommendedMealTypes(profileData, dietaryRestrictions, allergies),
    avoid: generateIngredientsToAvoid(profileData, dietaryRestrictions, allergies)
  };
  
  console.log('✅ [Backend] Generated recommendations:', JSON.stringify(recommendations, null, 2));
  return recommendations;
}

/**
 * Generates recommended meal types based on user profile
 * @param {Object} profileData - User profile data
 * @param {Array} dietaryRestrictions - User dietary restrictions
 * @param {Array} allergies - User allergies
 * @returns {Array} Recommended meal types
 */
function generateRecommendedMealTypes(profileData, dietaryRestrictions, allergies) {
  const goal = profileData.lifestyle?.goal || '';
  const proteinNeeds = profileData.nutrition?.proteinPerMeal || 0;
  const carbNeeds = profileData.nutrition?.carbsPerMeal || 0;
  const fatNeeds = profileData.nutrition?.fatPerMeal || 0;
  
  // Base meal types that work for most people
  let mealTypes = [
    'Buddha bowls',
    'Stir-fries',
    'Sheet pan meals',
    'Salads with protein',
    'One-pot meals'
  ];
  
  // Add meal types based on macronutrient profile
  if (proteinNeeds > 30) {
    mealTypes.push('Protein-forward plates');
    mealTypes.push('Lean protein with vegetables');
    console.log('🥩 [Backend] Added high-protein meal suggestions');
  }
  
  if (carbNeeds < 20) {
    mealTypes.push('Cauliflower rice bowls');
    mealTypes.push('Lettuce wraps');
    mealTypes.push('Zucchini noodle dishes');
    console.log('🥗 [Backend] Added low-carb meal suggestions');
  }
  
  if (fatNeeds > 25) {
    mealTypes.push('Avocado-based meals');
    mealTypes.push('Nut and seed bowls');
    mealTypes.push('Fatty fish entrees');
    console.log('🥑 [Backend] Added high-fat meal suggestions');
  }
  
  // Add meal types based on goal
  if (goal.toLowerCase().includes('weight loss')) {
    mealTypes.push('Vegetable-forward plates');
    mealTypes.push('Broth-based soups');
    mealTypes.push('High-volume, low-calorie meals');
    console.log('🍽️ [Backend] Added weight loss meal suggestions');
  } else if (goal.toLowerCase().includes('muscle') || goal.toLowerCase().includes('strength')) {
    mealTypes.push('Protein-rich post-workout meals');
    mealTypes.push('Muscle recovery bowls');
    mealTypes.push('Complete protein platters');
    console.log('💪 [Backend] Added muscle building meal suggestions');
  }
  
  // Adjust for dietary restrictions
  if (dietaryRestrictions.includes('Vegetarian')) {
    mealTypes = mealTypes.filter(meal => !meal.includes('Fatty fish'));
    mealTypes.push('Plant protein bowls');
    mealTypes.push('Bean and grain combinations');
    console.log('🌱 [Backend] Adjusted for vegetarian diet');
  }
  
  if (dietaryRestrictions.includes('Vegan')) {
    mealTypes = mealTypes.filter(meal => !meal.includes('Fatty fish'));
    mealTypes.push('Complete plant protein meals');
    mealTypes.push('Nutritional yeast dishes');
    mealTypes.push('Legume-based entrees');
    console.log('🌱 [Backend] Adjusted for vegan diet');
  }
  
  if (dietaryRestrictions.includes('Gluten-Free')) {
    mealTypes.push('Gluten-free grain bowls');
    mealTypes.push('Vegetable noodle dishes');
    console.log('🌾 [Backend] Added gluten-free meal suggestions');
  }
  
  if (dietaryRestrictions.includes('Keto') || dietaryRestrictions.includes('Low-Carb')) {
    mealTypes.push('Fat-adapted meals');
    mealTypes.push('Low-carb wraps');
    mealTypes.push('Cauliflower-based dishes');
    console.log('🥓 [Backend] Added keto/low-carb meal suggestions');
  }
  
  console.log('✅ [Backend] Generated meal type recommendations:', mealTypes);
  return mealTypes;
}

/**
 * Generates a list of recommended ingredients based on user's profile
 * @param {Object} profileData - User's health profile data
 * @param {Array} dietaryRestrictions - User's dietary restrictions
 * @param {Array} allergies - User's allergies
 * @returns {Object} Categorized list of recommended ingredients
 */
function generateRecommendedIngredients(profileData, dietaryRestrictions, allergies) {
  // Extract key information
  const goal = profileData.lifestyle?.goal || '';
  const proteinNeeds = profileData.nutrition?.proteinPerMeal || 0;
  const carbNeeds = profileData.nutrition?.carbsPerMeal || 0;
  const fatNeeds = profileData.nutrition?.fatPerMeal || 0;
  
  // Get ingredients to avoid
  const ingredientsToAvoid = [
    ...getAllergenIngredients(allergies),
    ...getRestrictedIngredients(dietaryRestrictions)
  ];
  
  // Start with all food groups
  let recommendedIngredients = {
    proteins: [],
    carbohydrates: [],
    fats: [],
    vegetables: [],
    fruits: [],
    herbs_spices: [
      'basil', 'oregano', 'rosemary', 'thyme', 'cilantro',
      'parsley', 'turmeric', 'cinnamon', 'cumin', 'garlic powder',
      'onion powder', 'paprika', 'black pepper', 'cayenne'
    ]
  };
  
  // Add base protein options based on dietary restrictions
  if (!dietaryRestrictions.includes('Vegan') && !dietaryRestrictions.includes('Vegetarian')) {
    // For omnivores
    recommendedIngredients.proteins.push(
      ...FOOD_GROUPS.high_protein.animal.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase())))
    );
  }
  
  if (!dietaryRestrictions.includes('Vegan')) {
    // For vegetarians and omnivores
    recommendedIngredients.proteins.push('greek yogurt', 'cottage cheese');
  }
  
  // Add plant proteins for everyone
  recommendedIngredients.proteins.push(
    ...FOOD_GROUPS.high_protein.plant.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase())))
  );
  
  // Add carbohydrates
  if (!dietaryRestrictions.includes('Low-Carb') && !dietaryRestrictions.includes('Keto')) {
    recommendedIngredients.carbohydrates.push(
      ...FOOD_GROUPS.complex_carbs.whole_grains.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase()))),
      ...FOOD_GROUPS.complex_carbs.starchy_veg.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase()))),
      ...FOOD_GROUPS.complex_carbs.legumes.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase())))
    );
  } else {
    // For low-carb/keto diets
    recommendedIngredients.carbohydrates.push(
      'cauliflower rice', 'zucchini noodles', 'mushrooms', 'bell peppers'
    );
  }
  
  // Add healthy fats
  recommendedIngredients.fats.push(
    ...FOOD_GROUPS.healthy_fats.oils.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase()))),
    ...FOOD_GROUPS.healthy_fats.other.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase())))
  );
  
  // Add nuts and seeds if not allergic
  if (!allergies.includes('Tree Nut') && !allergies.includes('Peanut')) {
    recommendedIngredients.fats.push(
      ...FOOD_GROUPS.healthy_fats.nuts_seeds.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase())))
    );
  }
  
  // Add vegetables
  recommendedIngredients.vegetables.push(
    ...FOOD_GROUPS.vegetables.leafy_greens.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase()))),
    ...FOOD_GROUPS.vegetables.cruciferous.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase()))),
    ...FOOD_GROUPS.vegetables.other.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase())))
  );
  
  // Add fruits (with caution for keto)
  if (!dietaryRestrictions.includes('Keto')) {
    recommendedIngredients.fruits.push(
      ...FOOD_GROUPS.fruits.berries.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase()))),
      ...FOOD_GROUPS.fruits.citrus.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase()))),
      ...FOOD_GROUPS.fruits.other.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase())))
    );
  } else {
    // Only low-sugar fruits for keto
    recommendedIngredients.fruits.push(
      ...FOOD_GROUPS.fruits.berries.filter(item => !ingredientsToAvoid.some(avoid => item.includes(avoid.toLowerCase())))
    );
  }
  
  // Customize based on nutrition goals
  if (proteinNeeds > 30) {
    // Prioritize higher protein options if protein needs are high
    console.log('🥩 [Backend] Prioritizing high protein options');
    if (!dietaryRestrictions.includes('Vegan') && !dietaryRestrictions.includes('Vegetarian')) {
      recommendedIngredients.proteins.unshift('chicken breast', 'turkey breast', 'lean beef');
    }
    if (!dietaryRestrictions.includes('Vegan')) {
      recommendedIngredients.proteins.unshift('greek yogurt', 'cottage cheese', 'egg whites');
    }
    recommendedIngredients.proteins.unshift('tempeh', 'seitan', 'edamame');
  }
  
  if (carbNeeds < 20) {
    // Prioritize lower carb options
    console.log('🥦 [Backend] Prioritizing low carb options');
    recommendedIngredients.carbohydrates = recommendedIngredients.carbohydrates
      .filter(item => !['rice', 'potatoes', 'bread', 'pasta', 'quinoa'].some(high => item.includes(high)));
  }
  
  if (fatNeeds > 25) {
    // Prioritize healthy fat sources
    console.log('🥑 [Backend] Prioritizing healthy fat options');
    recommendedIngredients.fats.unshift('avocado', 'olive oil', 'nuts', 'seeds');
  }
  
  // Goal-specific adjustments
  if (goal.toLowerCase().includes('weight loss')) {
    console.log('⚖️ [Backend] Adjusting for weight loss goal');
    recommendedIngredients.vegetables.unshift('leafy greens', 'broccoli', 'cauliflower', 'zucchini', 'bell peppers');
    recommendedIngredients.proteins.unshift('lean proteins');
  } else if (goal.toLowerCase().includes('muscle') || goal.toLowerCase().includes('strength')) {
    console.log('💪 [Backend] Adjusting for muscle building goal');
    if (!dietaryRestrictions.includes('Vegan') && !dietaryRestrictions.includes('Vegetarian')) {
      recommendedIngredients.proteins.unshift('chicken breast', 'turkey breast', 'lean beef');
    }
    if (!dietaryRestrictions.includes('Vegan')) {
      recommendedIngredients.proteins.unshift('greek yogurt', 'cottage cheese', 'eggs');
    }
    recommendedIngredients.proteins.unshift('tofu', 'tempeh', 'legumes');
  }
  
  // Log recommendations by category
  Object.keys(recommendedIngredients).forEach(category => {
    console.log(`✅ [Backend] ${category}: ${recommendedIngredients[category].join(', ')}`);
  });
  
  return recommendedIngredients;
}

/**
 * Generates a list of ingredients to avoid based on user's profile
 * @param {Object} profileData - User's health profile data
 * @param {Array} dietaryRestrictions - User's dietary restrictions
 * @param {Array} allergies - User's allergies
 * @returns {Object} Categorized list of ingredients to avoid
 */
function generateIngredientsToAvoid(profileData, dietaryRestrictions, allergies) {
  // Start with common unhealthy ingredients
  let avoid = {
    allergens: [],
    dietary_restrictions: [],
    unhealthy: [
      'processed sugar', 'refined flour', 'artificial sweeteners',
      'trans fats', 'excessive salt', 'deep-fried foods',
      'processed meats', 'artificial colors and preservatives'
    ]
  };
  
  // Add allergens to avoid
  allergies.forEach(allergy => {
    if (ALLERGEN_INGREDIENTS[allergy]) {
      avoid.allergens.push(...ALLERGEN_INGREDIENTS[allergy]);
      console.log(`⚠️ [Backend] Added ${allergy} allergen ingredients to avoid list`);
    } else {
      avoid.allergens.push(allergy.toLowerCase());
      console.log(`⚠️ [Backend] Added general allergen to avoid: ${allergy.toLowerCase()}`);
    }
  });
  
  // Add restrictions based on dietary choices
  dietaryRestrictions.forEach(diet => {
    if (DIET_RESTRICTIONS[diet]) {
      // Map general categories to specific ingredients
      DIET_RESTRICTIONS[diet].forEach(category => {
        if (ALLERGEN_INGREDIENTS[category]) {
          avoid.dietary_restrictions.push(...ALLERGEN_INGREDIENTS[category]);
        } else {
          avoid.dietary_restrictions.push(category.toLowerCase());
        }
      });
      console.log(`🍽️ [Backend] Added ${diet} restricted ingredients to avoid list`);
    }
  });
  
  // Goal-specific items to avoid
  const goal = profileData.lifestyle?.goal || '';
  
  if (goal.toLowerCase().includes('weight loss')) {
    avoid.unhealthy.push(
      'high-calorie condiments', 'sugary beverages', 'alcohol',
      'refined carbohydrates', 'high-fat dairy', 'candy', 'desserts'
    );
    console.log('⚖️ [Backend] Added weight loss specific items to avoid');
  } else if (goal.toLowerCase().includes('muscle') || goal.toLowerCase().includes('strength')) {
    avoid.unhealthy.push(
      'alcohol', 'low-protein snacks', 'empty calories'
    );
    console.log('💪 [Backend] Added muscle building specific items to avoid');
  }
  
  // Remove duplicates
  avoid.allergens = [...new Set(avoid.allergens)];
  avoid.dietary_restrictions = [...new Set(avoid.dietary_restrictions)];
  avoid.unhealthy = [...new Set(avoid.unhealthy)];
  
  // Log final avoid lists
  Object.keys(avoid).forEach(category => {
    console.log(`✅ [Backend] ${category} to avoid: ${avoid[category].join(', ')}`);
  });
  
  return avoid;
}

module.exports = router;