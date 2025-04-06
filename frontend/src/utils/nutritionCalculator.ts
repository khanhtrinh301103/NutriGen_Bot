// frontend/src/utils/nutritionCalculator.ts

// Define interfaces
interface HealthProfile {
    weight: number | string;
    height: number | string;
    age: number | string;
    gender: string;
    activityLevel: string;
    goal: string;
    mealsPerDay?: number;
    macroDistribution?: string;
  }
  
  // Define goal messages for UI display
  export const goalMessages = {
    'Weight Loss': 'For weight loss',
    'Weight Gain': 'For weight gain',
    'Weight Maintenance': 'For maintenance',
    'Muscle Gain': 'For muscle gain',
    'Improve Health': 'For health improvement'
  };
  
  // Function to calculate BMR (Basal Metabolic Rate) using the Mifflin-St Jeor Equation
  export function calculateBMR(healthProfile: HealthProfile): number {
    const weight = Number(healthProfile.weight);
    const height = Number(healthProfile.height);
    const age = Number(healthProfile.age);
    const gender = healthProfile.gender;
    
    if (!weight || !height || !age) return 0;
    
    if (gender === 'Male') {
      return Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
    } else {
      return Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
    }
  }
  
  // Function to calculate TDEE (Total Daily Energy Expenditure)
  export function calculateTDEE(healthProfile: HealthProfile): number {
    const bmr = calculateBMR(healthProfile);
    const activityLevel = healthProfile.activityLevel;
    
    let activityMultiplier = 1.2; // Sedentary
    
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
    
    return Math.round(bmr * activityMultiplier);
  }
  
  // Function to calculate target calories based on goal
  export function calculateTarget(healthProfile: HealthProfile): number {
    const tdee = calculateTDEE(healthProfile);
    const goal = healthProfile.goal;
    
    switch (goal) {
      case 'Weight Loss':
        return Math.round(tdee * 0.8); // 20% deficit
      case 'Weight Gain':
        return Math.round(tdee * 1.15); // 15% surplus
      case 'Muscle Gain':
        return Math.round(tdee * 1.2); // 20% surplus for muscle building
      case 'Improve Health':
        return Math.round(tdee * 0.95); // 5% deficit for gradual improvement
      case 'Weight Maintenance':
      default:
        return tdee; // Maintenance
    }
  }
  
  // Function to calculate calories per meal based on target and meals per day
  export function calculateCaloriesPerMeal(healthProfile: HealthProfile): number {
    const dailyCalories = calculateTarget(healthProfile);
    const mealsPerDay = healthProfile.mealsPerDay || 3;
    
    return Math.round(dailyCalories / mealsPerDay);
  }
  
  // Function to get macro distribution percentages based on selected plan
  export function getMacroDistribution(macroDistribution: string = 'Balanced'): { protein: number; carbs: number; fat: number } {
    switch (macroDistribution) {
      case 'HighProtein':
        return { protein: 0.45, carbs: 0.25, fat: 0.3 };
      case 'LowCarb':
        return { protein: 0.4, carbs: 0.2, fat: 0.4 };
      case 'Ketogenic':
        return { protein: 0.35, carbs: 0.05, fat: 0.6 };
      case 'Balanced':
      default:
        return { protein: 0.3, carbs: 0.4, fat: 0.3 };
    }
  }
  
  // Function to calculate macro percentage for progress bars
  export function calculateMacroPercentage(healthProfile: HealthProfile, macroType: 'protein' | 'carbs' | 'fat'): number {
    const macroDistribution = getMacroDistribution(healthProfile.macroDistribution || 'Balanced');
    return Math.round(macroDistribution[macroType] * 100);
  }
  
  // Function to calculate daily protein in grams
  export function calculateDailyProtein(healthProfile: HealthProfile): number {
    const dailyCalories = calculateTarget(healthProfile);
    const macroDistribution = getMacroDistribution(healthProfile.macroDistribution || 'Balanced');
    
    // 1g protein = 4 calories
    return Math.round((dailyCalories * macroDistribution.protein) / 4);
  }
  
  // Function to calculate daily carbs in grams
  export function calculateDailyCarbs(healthProfile: HealthProfile): number {
    const dailyCalories = calculateTarget(healthProfile);
    const macroDistribution = getMacroDistribution(healthProfile.macroDistribution || 'Balanced');
    
    // 1g carbs = 4 calories
    return Math.round((dailyCalories * macroDistribution.carbs) / 4);
  }
  
  // Function to calculate daily fat in grams
  export function calculateDailyFat(healthProfile: HealthProfile): number {
    const dailyCalories = calculateTarget(healthProfile);
    const macroDistribution = getMacroDistribution(healthProfile.macroDistribution || 'Balanced');
    
    // 1g fat = 9 calories
    return Math.round((dailyCalories * macroDistribution.fat) / 9);
  }
  
  // Function to calculate protein per meal in grams
  export function calculateProteinPerMeal(healthProfile: HealthProfile): number {
    const dailyProtein = calculateDailyProtein(healthProfile);
    const mealsPerDay = healthProfile.mealsPerDay || 3;
    
    return Math.round(dailyProtein / mealsPerDay);
  }
  
  // Function to calculate carbs per meal in grams
  export function calculateCarbsPerMeal(healthProfile: HealthProfile): number {
    const dailyCarbs = calculateDailyCarbs(healthProfile);
    const mealsPerDay = healthProfile.mealsPerDay || 3;
    
    return Math.round(dailyCarbs / mealsPerDay);
  }
  
  // Function to calculate fat per meal in grams
  export function calculateFatPerMeal(healthProfile: HealthProfile): number {
    const dailyFat = calculateDailyFat(healthProfile);
    const mealsPerDay = healthProfile.mealsPerDay || 3;
    
    return Math.round(dailyFat / mealsPerDay);
  }