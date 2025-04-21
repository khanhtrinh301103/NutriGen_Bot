// backend/src/conflictDetector.js

/**
 * Utility to detect and handle conflicts between search terms and user dietary restrictions
 */

// Define common food items that conflict with specific diets or allergies
const FOOD_CONFLICT_TERMS = {
    // Allergies
    'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream', 'dairy'],
    'Egg': ['egg', 'omelet', 'mayonnaise', 'meringue'],
    'Gluten': ['bread', 'pasta', 'wheat', 'flour', 'gluten', 'noodle', 'cake', 'cookie', 'pastry'],
    'Grain': ['wheat', 'barley', 'rye', 'oats', 'rice', 'corn', 'grain', 'cereal'],
    'Peanut': ['peanut', 'groundnut', 'goober', 'peanut butter'],
    'Seafood': ['fish', 'seafood', 'salmon', 'tuna', 'cod', 'sardine', 'anchovy', 'sushi'],
    'Shellfish': ['shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop', 'shellfish'],
    'Soy': ['soy', 'tofu', 'edamame', 'soya', 'tempeh', 'miso'],
    'Sulfite': ['wine', 'sulfite', 'preservative'],
    'Tree Nut': ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut', 'nut'],
    'Wheat': ['bread', 'pasta', 'wheat', 'flour', 'cracker', 'cereal'],
    
    // Diets
    'Vegetarian': ['meat', 'beef', 'pork', 'chicken', 'turkey', 'lamb'],
    'Vegan': ['meat', 'beef', 'pork', 'chicken', 'turkey', 'lamb', 'cheese', 'milk', 'egg', 'honey', 'dairy'],
    'Gluten-Free': ['bread', 'pasta', 'wheat', 'flour', 'gluten', 'noodle', 'cake', 'cookie', 'pastry'],
    'Dairy-Free': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream'],
    'Low-Carb': ['sugar', 'bread', 'pasta', 'rice', 'potato', 'carb'],
    'Keto': ['sugar', 'bread', 'pasta', 'rice', 'potato', 'carb', 'honey', 'sweet'],
    'Paleo': ['grain', 'dairy', 'legume', 'bean', 'peanut', 'processed food'],
    'Pescatarian': ['meat', 'beef', 'pork', 'chicken', 'turkey', 'lamb'],
    'Mediterranean': ['processed food', 'red meat', 'sugar', 'butter']
  };
  
  // Allergy relationships (if allergic to A, also allergic to B)
  const ALLERGY_RELATIONSHIPS = {
    'Gluten': ['Wheat'],
    'Grain': ['Wheat'],
    'Seafood': ['Shellfish']
  };
  
  /**
   * Detects conflicts between a search term and a user's dietary restrictions and allergies
   * @param {string} searchTerm - The search query from the user
   * @param {Object} nutritionProfile - User's nutrition profile containing diet and allergies
   * @returns {Object} Conflict information including type, severity, and explanation
   */
  function detectSearchConflicts(searchTerm, nutritionProfile) {
    console.log('🔍 [Backend] Checking search conflicts for:', searchTerm);
    
    // Exit early if no nutrition profile or no search term
    if (!searchTerm || !nutritionProfile) {
      console.log('⚠️ [Backend] Missing data for conflict detection');
      return { hasConflicts: false, conflicts: [] };
    }
    
    // Normalize search term
    const normalizedSearch = searchTerm.toLowerCase();
    const searchWords = normalizedSearch.split(/\s+/);
    
    // Extract dietary restrictions and allergies
    const dietaryRestrictions = nutritionProfile.dietaryProfile?.restrictions || [];
    let allergies = nutritionProfile.dietaryProfile?.allergies || [];
    
    console.log('🍽️ [Backend] User diets:', dietaryRestrictions);
    console.log('⚠️ [Backend] User allergies:', allergies);
    
    // Expand allergies to include related allergies
    const expandedAllergies = [...allergies];
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
    
    const conflicts = [];
    
    // Check allergy conflicts first (higher priority)
    if (expandedAllergies.length > 0) {
      expandedAllergies.forEach(allergy => {
        const conflictTerms = FOOD_CONFLICT_TERMS[allergy] || [];
        
        // Check for whole word matches (higher confidence)
        for (const term of conflictTerms) {
          const wholeWordRegex = new RegExp(`\\b${term}\\b`, 'i');
          if (wholeWordRegex.test(normalizedSearch)) {
            conflicts.push({
              type: 'allergy',
              item: allergy,
              searchTerm: term,
              severity: 'high',
              explanation: `You've indicated an allergy to ${allergy}, but searched for "${term}" which typically contains ${allergy.toLowerCase()}.`
            });
            console.log(`🚫 [Backend] Detected allergy conflict: ${allergy} with search term "${term}"`);
            break; // Only add one conflict per allergy
          }
        }
        
        // If no whole word match, check for partial matches
        if (!conflicts.some(c => c.item === allergy)) {
          for (const term of conflictTerms) {
            if (searchWords.some(word => word.includes(term) || term.includes(word))) {
              conflicts.push({
                type: 'allergy',
                item: allergy,
                searchTerm: term,
                severity: 'medium',
                explanation: `Your search may contain ${allergy.toLowerCase()}, which you've listed as an allergy.`
              });
              console.log(`🚫 [Backend] Detected potential allergy conflict: ${allergy} with search term containing "${term}"`);
              break;
            }
          }
        }
      });
    }
    
    // Check dietary restriction conflicts
    if (dietaryRestrictions.length > 0) {
      dietaryRestrictions.forEach(diet => {
        const conflictTerms = FOOD_CONFLICT_TERMS[diet] || [];
        
        // Already found an allergy conflict for this diet-related term?
        const hasAllergyConflictAlready = conflicts.some(c => 
          c.type === 'allergy' && conflictTerms.includes(c.searchTerm)
        );
        
        // If no allergy conflict for this diet, check for conflicts
        if (!hasAllergyConflictAlready) {
          for (const term of conflictTerms) {
            const wholeWordRegex = new RegExp(`\\b${term}\\b`, 'i');
            if (wholeWordRegex.test(normalizedSearch)) {
              // Generate appropriate explanation based on diet type
              let explanation = '';
              switch (diet) {
                case 'Vegetarian':
                  explanation = `You're following a ${diet} diet, but searched for "${term}" which is typically a meat product.`;
                  break;
                case 'Vegan':
                  explanation = `You're following a ${diet} diet, but searched for "${term}" which is typically an animal product.`;
                  break;
                case 'Gluten-Free':
                  explanation = `You're following a ${diet} diet, but searched for "${term}" which typically contains gluten.`;
                  break;
                case 'Dairy-Free':
                  explanation = `You're following a ${diet} diet, but searched for "${term}" which is a dairy product.`;
                  break;
                case 'Low-Carb':
                case 'Keto':
                  explanation = `You're following a ${diet} diet, but searched for "${term}" which is typically high in carbohydrates.`;
                  break;
                case 'Paleo':
                  explanation = `You're following a ${diet} diet, but searched for "${term}" which is typically avoided in paleo diets.`;
                  break;
                case 'Pescatarian':
                  explanation = `You're following a ${diet} diet, but searched for "${term}" which is a meat product (not seafood).`;
                  break;
                default:
                  explanation = `Your search for "${term}" may conflict with your ${diet} dietary restriction.`;
              }
              
              conflicts.push({
                type: 'diet',
                item: diet,
                searchTerm: term,
                severity: 'medium',
                explanation: explanation
              });
              console.log(`🚫 [Backend] Detected diet conflict: ${diet} with search term "${term}"`);
              break;
            }
          }
        }
      });
    }
    
    console.log(`✅ [Backend] Conflict detection complete. Found ${conflicts.length} conflicts.`);
    
    return {
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts
    };
  }
  
  /**
   * Generates alternative search suggestions based on detected conflicts
   * @param {Array} conflicts - Array of detected conflicts
   * @param {string} originalSearchTerm - Original search term
   * @returns {Array} List of alternative search suggestions
   */
  function generateAlternativeSuggestions(conflicts, originalSearchTerm) {
    if (!conflicts || conflicts.length === 0 || !originalSearchTerm) {
      return [];
    }
    
    const suggestions = new Set();
    
    for (const conflict of conflicts) {
      switch (conflict.item) {
        case 'Dairy':
          suggestions.add(`${originalSearchTerm} dairy-free`);
          suggestions.add(`${originalSearchTerm} with almond milk`);
          break;
        case 'Egg':
          suggestions.add(`${originalSearchTerm} egg-free`);
          suggestions.add(`${originalSearchTerm} vegan`);
          break;
        case 'Gluten':
        case 'Wheat':
          suggestions.add(`${originalSearchTerm} gluten-free`);
          if (conflict.searchTerm === 'pasta') {
            suggestions.add('zucchini noodles');
          }
          if (conflict.searchTerm === 'bread') {
            suggestions.add('gluten-free bread');
          }
          break;
        case 'Vegetarian':
        case 'Vegan':
          suggestions.add(`vegetarian ${originalSearchTerm}`);
          suggestions.add(`vegan ${originalSearchTerm}`);
          break;
        case 'Keto':
        case 'Low-Carb':
          suggestions.add(`low-carb ${originalSearchTerm}`);
          suggestions.add(`keto ${originalSearchTerm}`);
          if (conflict.searchTerm === 'pasta') {
            suggestions.add('zucchini noodles');
          }
          if (conflict.searchTerm === 'rice') {
            suggestions.add('cauliflower rice');
          }
          break;
      }
    }
    
    return Array.from(suggestions).slice(0, 3);
  }
  
  module.exports = {
    detectSearchConflicts,
    generateAlternativeSuggestions
  };