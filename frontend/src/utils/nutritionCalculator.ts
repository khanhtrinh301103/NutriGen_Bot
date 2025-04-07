// frontend/src/utils/nutritionCalculator.ts

/**
 * User health profile data type
 */
export interface HealthProfile {
  weight: number | string;
  height: number | string;
  age: number | string;
  gender: string;
  activityLevel: string;
  goal: string;
  allergies: string[];
  dietaryRestrictions?: string[];
  mealsPerDay?: number;
  macroDistribution?: string;
}

/**
 * Define goal messages for UI display
 */
export const goalMessages = {
  'Weight Loss': 'For weight loss',
  'Weight Gain': 'For weight gain',
  'Weight Maintenance': 'For maintenance',
  'Muscle Gain': 'For muscle gain',
  'Improve Health': 'For health improvement'
};

/**
 * Calculate BMR (Basal Metabolic Rate) using the Mifflin-St Jeor Equation
 * @param healthProfile User health profile data
 * @returns Calculated BMR in calories
 */
export function calculateBMR(healthProfile: HealthProfile): number {
  const weight = Number(healthProfile.weight);
  const height = Number(healthProfile.height);
  const age = Number(healthProfile.age);
  const gender = healthProfile.gender;
  
  if (!weight || !height || !age) {
    console.log('Missing required data for BMR calculation');
    return 0;
  }
  
  let bmr = 0;
  if (gender === 'Male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  
  console.log(`Calculated BMR: ${Math.round(bmr)} calories for ${gender}, ${weight}kg, ${height}cm, ${age}y`);
  return Math.round(bmr);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param healthProfile User health profile data
 * @returns Calculated TDEE in calories
 */
export function calculateTDEE(healthProfile: HealthProfile): number {
  const bmr = calculateBMR(healthProfile);
  const activityLevel = healthProfile.activityLevel;
  
  let activityMultiplier = 1.2; // Default: Sedentary
  
  switch (activityLevel) {
    case 'Lightly Active':
      activityMultiplier = 1.375;
      break;
    case 'Moderately Active':
      activityMultiplier = 1.55;
      break;
    case 'Very Active':
      activityMultiplier = 1.725;
      break;
    case 'Extremely Active':
      activityMultiplier = 1.9;
      break;
    default:
      activityMultiplier = 1.2;
  }
  
  const tdee = Math.round(bmr * activityMultiplier);
  console.log(`Calculated TDEE: ${tdee} calories with activity level "${activityLevel}" (multiplier: ${activityMultiplier})`);
  return tdee;
}

/**
 * Calculate target calories based on user's health goal
 * @param healthProfile User health profile data
 * @returns Target calories for the specified goal
 */
export function calculateTarget(healthProfile: HealthProfile): number {
  const tdee = calculateTDEE(healthProfile);
  const goal = healthProfile.goal;
  
  let targetMultiplier = 1.0; // Default: Maintenance
  
  switch (goal) {
    case 'Weight Loss':
      targetMultiplier = 0.8; // 20% deficit
      break;
    case 'Weight Gain':
      targetMultiplier = 1.15; // 15% surplus
      break;
    case 'Muscle Gain':
      targetMultiplier = 1.2; // 20% surplus
      break;
    case 'Improve Health':
      targetMultiplier = 0.95; // 5% deficit
      break;
    case 'Weight Maintenance':
    default:
      targetMultiplier = 1.0;
  }
  
  const targetCalories = Math.round(tdee * targetMultiplier);
  console.log(`Calculated target calories: ${targetCalories} for goal "${goal}" (multiplier: ${targetMultiplier})`);
  return targetCalories;
}

/**
 * Calculate calories per meal based on target and meals per day
 * @param healthProfile User health profile data
 * @returns Calories per meal
 */
export function calculateCaloriesPerMeal(healthProfile: HealthProfile): number {
  const dailyCalories = calculateTarget(healthProfile);
  const mealsPerDay = healthProfile.mealsPerDay || 3;
  
  const caloriesPerMeal = Math.round(dailyCalories / mealsPerDay);
  console.log(`Calculated calories per meal: ${caloriesPerMeal} (${dailyCalories} daily calories / ${mealsPerDay} meals)`);
  return caloriesPerMeal;
}

/**
 * Get macro distribution percentages based on selected plan
 * @param macroDistribution Macro distribution type
 * @returns Object containing protein, carbs and fat percentages
 */
export function getMacroDistribution(macroDistribution: string = 'Balanced'): { protein: number; carbs: number; fat: number } {
  let distribution = { protein: 0.3, carbs: 0.4, fat: 0.3 }; // Default balanced
  
  switch (macroDistribution) {
    case 'HighProtein':
      distribution = { protein: 0.45, carbs: 0.25, fat: 0.3 };
      break;
    case 'LowCarb':
      distribution = { protein: 0.4, carbs: 0.2, fat: 0.4 };
      break;
    case 'Ketogenic':
      distribution = { protein: 0.35, carbs: 0.05, fat: 0.6 };
      break;
    case 'Balanced':
    default:
      distribution = { protein: 0.3, carbs: 0.4, fat: 0.3 };
  }
  
  console.log(`Macro distribution for ${macroDistribution}: Protein ${distribution.protein * 100}%, Carbs ${distribution.carbs * 100}%, Fat ${distribution.fat * 100}%`);
  return distribution;
}

/**
 * Calculate macro percentage for progress bars
 * @param healthProfile User health profile data
 * @param macroType Macro type (protein, carbs, fat)
 * @returns Percentage for the specified macro
 */
export function calculateMacroPercentage(healthProfile: HealthProfile, macroType: 'protein' | 'carbs' | 'fat'): number {
  const macroDistribution = getMacroDistribution(healthProfile.macroDistribution || 'Balanced');
  const percentage = Math.round(macroDistribution[macroType] * 100);
  
  console.log(`${macroType.charAt(0).toUpperCase() + macroType.slice(1)} percentage: ${percentage}%`);
  return percentage;
}

/**
 * Calculate daily protein in grams
 * @param healthProfile User health profile data
 * @returns Daily protein in grams
 */
export function calculateDailyProtein(healthProfile: HealthProfile): number {
  const dailyCalories = calculateTarget(healthProfile);
  const macroDistribution = getMacroDistribution(healthProfile.macroDistribution || 'Balanced');
  
  // 1g protein = 4 calories
  const proteinGrams = Math.round((dailyCalories * macroDistribution.protein) / 4);
  console.log(`Daily protein: ${proteinGrams}g (${Math.round(macroDistribution.protein * 100)}% of ${dailyCalories} calories)`);
  return proteinGrams;
}

/**
 * Calculate daily carbs in grams
 * @param healthProfile User health profile data
 * @returns Daily carbs in grams
 */
export function calculateDailyCarbs(healthProfile: HealthProfile): number {
  const dailyCalories = calculateTarget(healthProfile);
  const macroDistribution = getMacroDistribution(healthProfile.macroDistribution || 'Balanced');
  
  // 1g carbs = 4 calories
  const carbsGrams = Math.round((dailyCalories * macroDistribution.carbs) / 4);
  console.log(`Daily carbs: ${carbsGrams}g (${Math.round(macroDistribution.carbs * 100)}% of ${dailyCalories} calories)`);
  return carbsGrams;
}

/**
 * Calculate daily fat in grams
 * @param healthProfile User health profile data
 * @returns Daily fat in grams
 */
export function calculateDailyFat(healthProfile: HealthProfile): number {
  const dailyCalories = calculateTarget(healthProfile);
  const macroDistribution = getMacroDistribution(healthProfile.macroDistribution || 'Balanced');
  
  // 1g fat = 9 calories
  const fatGrams = Math.round((dailyCalories * macroDistribution.fat) / 9);
  console.log(`Daily fat: ${fatGrams}g (${Math.round(macroDistribution.fat * 100)}% of ${dailyCalories} calories)`);
  return fatGrams;
}

/**
 * Calculate protein per meal in grams
 * @param healthProfile User health profile data
 * @returns Protein per meal in grams
 */
export function calculateProteinPerMeal(healthProfile: HealthProfile): number {
  const dailyProtein = calculateDailyProtein(healthProfile);
  const mealsPerDay = healthProfile.mealsPerDay || 3;
  
  const proteinPerMeal = Math.round(dailyProtein / mealsPerDay);
  console.log(`Protein per meal: ${proteinPerMeal}g (${dailyProtein}g / ${mealsPerDay} meals)`);
  return proteinPerMeal;
}

/**
 * Calculate carbs per meal in grams
 * @param healthProfile User health profile data
 * @returns Carbs per meal in grams
 */
export function calculateCarbsPerMeal(healthProfile: HealthProfile): number {
  const dailyCarbs = calculateDailyCarbs(healthProfile);
  const mealsPerDay = healthProfile.mealsPerDay || 3;
  
  const carbsPerMeal = Math.round(dailyCarbs / mealsPerDay);
  console.log(`Carbs per meal: ${carbsPerMeal}g (${dailyCarbs}g / ${mealsPerDay} meals)`);
  return carbsPerMeal;
}

/**
 * Calculate fat per meal in grams
 * @param healthProfile User health profile data
 * @returns Fat per meal in grams
 */
export function calculateFatPerMeal(healthProfile: HealthProfile): number {
  const dailyFat = calculateDailyFat(healthProfile);
  const mealsPerDay = healthProfile.mealsPerDay || 3;
  
  const fatPerMeal = Math.round(dailyFat / mealsPerDay);
  console.log(`Fat per meal: ${fatPerMeal}g (${dailyFat}g / ${mealsPerDay} meals)`);
  return fatPerMeal;
}