// frontend/src/utils/searchConflictDetector.ts

import { DIET_RESTRICTIONS, ALLERGY_RELATIONSHIPS } from './dietaryConflicts';

// Map of common allergens to their related search terms that might indicate conflicts
const ALLERGEN_SEARCH_TERMS: Record<string, string[]> = {
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
  'Wheat': ['bread', 'pasta', 'wheat', 'flour', 'cracker', 'cereal']
};

// Map of dietary restrictions to their related search terms that might indicate conflicts
const DIET_SEARCH_TERMS: Record<string, string[]> = {
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

// Define types for conflict detection results
export interface SearchConflict {
  type: 'allergy' | 'diet';
  item: string;
  searchTerm: string;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
}

/**
 * Detects potential conflicts between a search term and user's dietary/allergy restrictions
 * 
 * @param searchTerm - The search term entered by the user
 * @param userDiets - Array of user's dietary restrictions
 * @param userAllergies - Array of user's allergies
 * @returns Object containing conflict information and explanations
 */
export const detectSearchConflicts = (
  searchTerm: string,
  userDiets: string[] = [],
  userAllergies: string[] = []
): { 
  hasConflicts: boolean;
  conflicts: SearchConflict[];
} => {
  console.log('🔍 [Frontend] Detecting search conflicts for:', searchTerm);
  console.log('🍽️ User diets:', userDiets);
  console.log('⚠️ User allergies:', userAllergies);
  
  // Convert search term to lowercase for case-insensitive matching
  const normalizedSearchTerm = searchTerm.toLowerCase();
  const searchWords = normalizedSearchTerm.split(/\s+/);
  const conflicts: SearchConflict[] = [];

  // Check for allergy conflicts first (higher priority)
  if (userAllergies.length > 0) {
    // Include allergies expanded based on relationships
    const expandedAllergies = [...userAllergies];
    
    // Add related allergies (e.g., if allergic to Gluten, also consider Wheat)
    userAllergies.forEach(allergy => {
      const relatedAllergies = ALLERGY_RELATIONSHIPS[allergy] || [];
      relatedAllergies.forEach(related => {
        if (!expandedAllergies.includes(related)) {
          expandedAllergies.push(related);
        }
      });
    });
    
    // Check each allergy against search terms
    expandedAllergies.forEach(allergy => {
      const conflictTerms = ALLERGEN_SEARCH_TERMS[allergy] || [];
      
      // Check for whole word matches first (higher confidence)
      for (const term of conflictTerms) {
        // Look for whole word match (e.g., "milk" but not "milkshake")
        const wholeWordRegex = new RegExp(`\\b${term}\\b`, 'i');
        if (wholeWordRegex.test(normalizedSearchTerm)) {
          // High severity for direct matches
          conflicts.push({
            type: 'allergy',
            item: allergy,
            searchTerm: term,
            severity: 'high',
            explanation: `You've indicated an allergy to ${allergy}, but searched for "${term}" which typically contains ${allergy.toLowerCase()}.`
          });
          break; // Only add one conflict per allergy for clarity
        }
      }
      
      // If no whole word match, check for partial matches (lower confidence)
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
            break;
          }
        }
      }
    });
  }

  // Check for dietary restriction conflicts
  if (userDiets.length > 0) {
    userDiets.forEach(diet => {
      const conflictTerms = DIET_SEARCH_TERMS[diet] || [];
      
      // Check for direct matches first
      for (const term of conflictTerms) {
        const wholeWordRegex = new RegExp(`\\b${term}\\b`, 'i');
        if (wholeWordRegex.test(normalizedSearchTerm)) {
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
            severity: 'medium', // Diet conflicts generally less severe than allergy conflicts
            explanation: explanation
          });
          break; // Only add one conflict per diet for clarity
        }
      }
      
      // If no direct match, check for partial matches
      if (!conflicts.some(c => c.item === diet && c.type === 'diet')) {
        for (const term of conflictTerms) {
          if (searchWords.some(word => word.includes(term) || term.includes(word))) {
            conflicts.push({
              type: 'diet',
              item: diet,
              searchTerm: term,
              severity: 'low',
              explanation: `Your search may include "${term}", which is typically avoided in a ${diet} diet.`
            });
            break;
          }
        }
      }
    });
  }

  console.log('🚫 [Frontend] Detected conflicts:', conflicts.length > 0 ? conflicts : 'None');
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts: conflicts
  };
};

/**
 * Gets a list of alternative search terms based on detected conflicts
 * 
 * @param conflicts - Array of detected search conflicts
 * @returns Array of suggested alternative searches
 */
export const getSuggestedAlternatives = (
  conflicts: SearchConflict[],
  originalSearchTerm: string
): string[] => {
  const suggestions: string[] = [];
  
  if (conflicts.length === 0) return suggestions;
  
  // Group conflicts by type for better suggestions
  const allergyConflicts = conflicts.filter(c => c.type === 'allergy');
  const dietConflicts = conflicts.filter(c => c.type === 'diet');
  
  // Add alternative ingredients based on common substitutions
  for (const conflict of conflicts) {
    switch (conflict.item) {
      case 'Dairy':
        suggestions.push(`${originalSearchTerm} dairy-free`);
        suggestions.push(`${originalSearchTerm} with almond milk`);
        suggestions.push(`${originalSearchTerm} with coconut milk`);
        break;
      case 'Egg':
        suggestions.push(`${originalSearchTerm} egg-free`);
        suggestions.push(`${originalSearchTerm} vegan`);
        break;
      case 'Gluten':
      case 'Wheat':
        suggestions.push(`${originalSearchTerm} gluten-free`);
        suggestions.push(`${conflict.searchTerm === 'pasta' ? 'zucchini noodles' : originalSearchTerm}`);
        suggestions.push(`${conflict.searchTerm === 'bread' ? 'gluten-free bread' : originalSearchTerm}`);
        break;
      case 'Peanut':
      case 'Tree Nut':
        suggestions.push(`${originalSearchTerm} nut-free`);
        suggestions.push(`${originalSearchTerm} seed butter`);
        break;
      case 'Seafood':
      case 'Shellfish':
        suggestions.push(`${originalSearchTerm} without seafood`);
        break;
      case 'Vegetarian':
      case 'Vegan':
        suggestions.push(`vegetarian ${originalSearchTerm}`);
        suggestions.push(`vegan ${originalSearchTerm}`);
        suggestions.push(`plant-based ${originalSearchTerm}`);
        break;
      case 'Keto':
      case 'Low-Carb':
        suggestions.push(`low-carb ${originalSearchTerm}`);
        suggestions.push(`keto ${originalSearchTerm}`);
        suggestions.push(`${originalSearchTerm} without pasta`);
        suggestions.push(`${originalSearchTerm} with cauliflower rice`);
        break;
    }
  }
  
  // Filter, deduplicate and limit suggestions
  return [...new Set(suggestions)].slice(0, 3);
};

/**
 * Generates a comprehensive warning message based on detected conflicts
 * 
 * @param conflicts - Array of detected search conflicts
 * @returns String warning message explaining the conflicts
 */
export const generateConflictWarning = (conflicts: SearchConflict[]): string => {
  if (conflicts.length === 0) return '';
  
  // Group conflicts by type
  const allergyConflicts = conflicts.filter(c => c.type === 'allergy');
  const dietConflicts = conflicts.filter(c => c.type === 'diet');
  
  let warningMessage = '';
  
  // Prioritize allergy warnings
  if (allergyConflicts.length > 0) {
    // Get highest severity conflict
    const highSeverity = allergyConflicts.find(c => c.severity === 'high');
    if (highSeverity) {
      warningMessage = highSeverity.explanation;
    } else {
      warningMessage = allergyConflicts[0].explanation;
    }
  } 
  // Add diet conflicts if there are no allergies or if there are both
  else if (dietConflicts.length > 0) {
    warningMessage = dietConflicts[0].explanation;
  }
  
  // Add general advice
  if (conflicts.length > 1) {
    warningMessage += ' We\'ll still show results, but you may want to adjust your search.';
  }
  
  return warningMessage;
};