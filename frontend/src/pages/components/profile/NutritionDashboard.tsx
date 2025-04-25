// frontend/src/pages/components/profile/NutritionDashboard.tsx
import React, { useState, useEffect } from 'react';
import { updateUserProfile } from '../../../api/profile';
import { 
  calculateBMR, 
  calculateTDEE, 
  calculateTarget,
  calculateCaloriesPerMeal,
  calculateProteinPerMeal,
  calculateCarbsPerMeal,
  calculateFatPerMeal,
  calculateMacroPercentage,
  calculateDailyProtein,
  calculateDailyCarbs,
  calculateDailyFat,
  goalMessages
} from '../../../utils/nutritionCalculator';

// Define interfaces for props and data
interface NutritionDashboardProps {
  user: any;
  profileData: any;
  loading: boolean;
  onProfileUpdated: () => Promise<void>;
}

interface CalculatedNutrition {
  bmr: number;
  tdee: number;
  targetCalories: number;
  caloriesPerMeal: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  proteinPerMeal: number;
  carbsPerMeal: number;
  fatPerMeal: number;
}

// Diet Plans with descriptions for better user understanding
const DIET_PLANS = [
  { 
    value: 'Balanced', 
    label: 'Balanced', 
    description: 'Even distribution of macros (30% protein, 40% carbs, 30% fat)',
    recommended: 'Recommended for general wellness and sustainable lifestyle'
  },
  { 
    value: 'HighProtein', 
    label: 'High Protein', 
    description: 'Emphasizes protein intake (45% protein, 25% carbs, 30% fat)',
    recommended: 'Ideal for muscle building and active individuals'
  },
  { 
    value: 'LowCarb', 
    label: 'Low Carb', 
    description: 'Reduces carbohydrate intake (40% protein, 20% carbs, 40% fat)',
    recommended: 'Good for weight management and metabolic health'
  },
  { 
    value: 'Ketogenic', 
    label: 'Ketogenic', 
    description: 'Very low carb, high fat diet (35% protein, 5% carbs, 60% fat)',
    recommended: 'For specific health goals, consult with a healthcare professional'
  }
];

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  user,
  profileData,
  loading,
  onProfileUpdated
}) => {
  // State for nutrition settings
  const [isEditingMacros, setIsEditingMacros] = useState(false);
  const [isEditingMeals, setIsEditingMeals] = useState(false);
  const [nutritionEditData, setNutritionEditData] = useState({
    mealsPerDay: 3,
    macroDistribution: 'Balanced'
  });

  // Initialize nutrition edit data when profile data changes
  useEffect(() => {
    if (profileData && profileData.healthProfile) {
      console.log('Initializing nutrition edit data', profileData.healthProfile);
      setNutritionEditData({
        mealsPerDay: profileData.healthProfile.mealsPerDay || 3,
        macroDistribution: profileData.healthProfile.macroDistribution || 'Balanced'
      });
    }
  }, [profileData]);

  // Helper function to get calculated nutrition values
  const getNutritionValues = (): CalculatedNutrition => {
    if (
      profileData?.healthProfile?.calculatedNutrition && 
      Object.keys(profileData.healthProfile.calculatedNutrition).length > 0
    ) {
      // Use pre-calculated values from Firestore
      console.log('Using pre-calculated nutrition values from Firestore');
      return profileData.healthProfile.calculatedNutrition;
    }
    
    // Fallback: Calculate values on the fly if not available
    console.log('Calculating nutrition values on the fly (fallback)');
    return {
      bmr: calculateBMR(profileData.healthProfile),
      tdee: calculateTDEE(profileData.healthProfile),
      targetCalories: calculateTarget(profileData.healthProfile),
      caloriesPerMeal: calculateCaloriesPerMeal(profileData.healthProfile),
      dailyProtein: calculateDailyProtein(profileData.healthProfile),
      dailyCarbs: calculateDailyCarbs(profileData.healthProfile),
      dailyFat: calculateDailyFat(profileData.healthProfile),
      proteinPerMeal: calculateProteinPerMeal(profileData.healthProfile),
      carbsPerMeal: calculateCarbsPerMeal(profileData.healthProfile),
      fatPerMeal: calculateFatPerMeal(profileData.healthProfile)
    };
  };

  // Handle nutrition edit data changes
  const handleNutritionEditChange = (e) => {
    const { name, value } = e.target;
    console.log(`Nutrition edit change: ${name} = ${value}`);
    setNutritionEditData({
      ...nutritionEditData,
      [name]: value
    });
  };

  // Handle saving meals per day setting
  const handleSaveMeals = async () => {
    if (!user) return;
    
    try {
      console.log('Saving meals per day:', nutritionEditData.mealsPerDay);
      
      await updateUserProfile(user.uid, {
        mealsPerDay: nutritionEditData.mealsPerDay
      });
      
      // Reload profile data
      await onProfileUpdated();
      
      setIsEditingMeals(false);
    } catch (error) {
      console.error("Error saving meals per day:", error);
    }
  };

  // Handle saving macro distribution setting
  const handleSaveMacros = async () => {
    if (!user) return;
    
    try {
      console.log('Saving macro distribution:', nutritionEditData.macroDistribution);
      
      await updateUserProfile(user.uid, {
        macroDistribution: nutritionEditData.macroDistribution
      });
      
      // Reload profile data
      await onProfileUpdated();
      
      setIsEditingMacros(false);
    } catch (error) {
      console.error("Error saving macro distribution:", error);
    }
  };

  // Function to get current diet plan details
  const getCurrentDietPlan = () => {
    const planValue = profileData?.healthProfile?.macroDistribution || 'Balanced';
    return DIET_PLANS.find(plan => plan.value === planValue) || DIET_PLANS[0];
  };

  if (!profileData || !profileData.healthProfile) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading nutrition information...</p>
        </div>
      </div>
    );
  }

  // Get nutrition values either from Firestore or calculate them
  const nutritionValues = getNutritionValues();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 primary-bg">
          <h3 className="text-lg leading-6 font-medium text-white">
            Your Nutrition Summary
          </h3>
          <p className="mt-1 max-w-2xl mx-auto text-sm text-white">
            Based on your health profile, activity level, and goals
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {profileData && profileData.healthProfile && profileData.healthProfile.weight && profileData.healthProfile.height && profileData.healthProfile.age ? (
            <>
              {/* Daily Caloric Needs Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Daily Caloric Needs</h4>
                  <div className="flex items-center">
                    <button 
                      type="button"
                      className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="hidden sm:inline">What's this?</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-gray-500">Basal Metabolic Rate</h4>
                    <div className="text-2xl font-bold text-emerald-600 mt-2">
                      {nutritionValues.bmr} calories
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Calories you burn at rest</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-gray-500">Total Daily Energy Expenditure</h4>
                    <div className="text-2xl font-bold text-blue-600 mt-2">
                      {nutritionValues.tdee} calories
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Calories you burn daily with activity</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <h4 className="text-sm font-medium text-gray-500">Target Daily Calories</h4>
                    <div className="text-2xl font-bold text-purple-600 mt-2">
                      {nutritionValues.targetCalories} calories
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {goalMessages[profileData.healthProfile.goal] || 'For maintenance'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Meals Per Day Settings */}
              <div className="bg-gray-50 rounded-lg p-5 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-md font-medium text-gray-700">Meals Per Day</h4>
                    <button 
                      type="button"
                      className="ml-2 text-gray-400 hover:text-gray-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  {!isEditingMeals ? (
                    <button 
                      onClick={() => setIsEditingMeals(true)}
                      className="px-3 py-1 text-sm text-emerald-600 hover:text-emerald-800 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button 
                        onClick={handleSaveMeals}
                        className="px-3 py-1 text-sm text-emerald-600 hover:text-emerald-800 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setIsEditingMeals(false)}
                        className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                
                {!isEditingMeals ? (
                  <div className="flex items-center justify-between py-3 px-5 bg-white rounded-lg border border-gray-100">
                    <div>
                      <span className="text-4xl font-bold primary-text-color">{profileData.healthProfile.mealsPerDay || 3}</span>
                      <span className="ml-2 text-sm text-gray-500">meals per day</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="block text-center">Affects how your calories and</span>
                      <span className="block text-center">nutrients are distributed throughout the day</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-white rounded-lg border border-gray-100">
                    <select
                      id="mealsPerDay"
                      name="mealsPerDay"
                      value={nutritionEditData.mealsPerDay}
                      onChange={handleNutritionEditChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                    >
                      <option value={1}>1 meal per day</option>
                      <option value={2}>2 meals per day</option>
                      <option value={3}>3 meals per day (Default) </option>
                      <option value={4}>4 meals per day</option>
                      <option value={5}>5 meals per day</option>
                      <option value={6}>6 meals per day</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500 text-center">This will display how your daily calories and nutrients are distributed throughout the day.</p>
                  </div>
                )}
              </div>
              
              {/* Per Meal Breakdown */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-700 mb-4">Per Meal Breakdown</h4>
                <div className="bg-gray-50 p-5 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500">Calories Per Meal</h4>
                      <div className="text-xl font-bold text-purple-600 mt-2">
                        {nutritionValues.caloriesPerMeal} calories
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on {profileData.healthProfile.mealsPerDay || 3} meals per day
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500">Protein Per Meal</h4>
                      <div className="text-xl font-bold text-green-600 mt-2">
                        {nutritionValues.proteinPerMeal}g
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Builds and repairs muscle tissue
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500">Carbs Per Meal</h4>
                      <div className="text-xl font-bold text-amber-600 mt-2">
                        {nutritionValues.carbsPerMeal}g
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Primary energy source
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500">Fat Per Meal</h4>
                      <div className="text-xl font-bold text-blue-600 mt-2">
                        {nutritionValues.fatPerMeal}g
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Hormone production and nutrient absorption
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Macronutrient Distribution Section - Combined Edit and Display */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h4 className="text-md font-medium text-gray-700">Macronutrient Distribution</h4>
                    <button 
                      type="button"
                      className="ml-2 text-gray-400 hover:text-gray-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  {!isEditingMacros ? (
                    <button 
                      onClick={() => setIsEditingMacros(true)}
                      className="px-3 py-1 text-sm text-emerald-600 hover:text-emerald-800 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors"
                    >
                      Change Diet Plan
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button 
                        onClick={handleSaveMacros}
                        className="px-3 py-1 text-sm text-emerald-600 hover:text-emerald-800 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setIsEditingMacros(false)}
                        className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingMacros ? (
                  <>
                    {/* Current Diet Plan Display */}
                    <div className="bg-white p-5 rounded-lg border border-gray-100 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-medium text-gray-900">{getCurrentDietPlan().label} Diet</h5>
                        <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                          Current Plan
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{getCurrentDietPlan().description}</p>
                      <p className="text-xs text-gray-400 italic">{getCurrentDietPlan().recommended}</p>
                    </div>
                    
                    {/* Macro Breakdown */}
                    <div className="bg-gray-50 p-5 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-700">Daily Protein</h4>
                            <span className="text-xs text-gray-500">{calculateMacroPercentage(profileData.healthProfile, 'protein')}%</span>
                          </div>
                          <div className="mt-2 h-3 relative max-w-xl rounded-full overflow-hidden">
                            <div className="w-full h-full bg-gray-200 absolute"></div>
                            <div className="h-full bg-green-500 absolute" style={{width: `${calculateMacroPercentage(profileData.healthProfile, 'protein')}%`}}></div>
                          </div>
                          <p className="mt-2 text-sm font-medium text-gray-900">{nutritionValues.dailyProtein}g</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-700">Daily Carbs</h4>
                            <span className="text-xs text-gray-500">{calculateMacroPercentage(profileData.healthProfile, 'carbs')}%</span>
                          </div>
                          <div className="mt-2 h-3 relative max-w-xl rounded-full overflow-hidden">
                            <div className="w-full h-full bg-gray-200 absolute"></div>
                            <div className="h-full bg-amber-500 absolute" style={{width: `${calculateMacroPercentage(profileData.healthProfile, 'carbs')}%`}}></div>
                          </div>
                          <p className="mt-2 text-sm font-medium text-gray-900">{nutritionValues.dailyCarbs}g</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-700">Daily Fat</h4>
                            <span className="text-xs text-gray-500">{calculateMacroPercentage(profileData.healthProfile, 'fat')}%</span>
                          </div>
                          <div className="mt-2 h-3 relative max-w-xl rounded-full overflow-hidden">
                            <div className="w-full h-full bg-gray-200 absolute"></div>
                            <div className="h-full bg-blue-500 absolute" style={{width: `${calculateMacroPercentage(profileData.healthProfile, 'fat')}%`}}></div>
                          </div>
                          <p className="mt-2 text-sm font-medium text-gray-900">{nutritionValues.dailyFat}g</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white p-5 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-4">Select a diet plan that aligns with your nutritional goals:</p>
                    
                    <div className="space-y-4">
                      {DIET_PLANS.map((plan) => (
                        <div key={plan.value} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`plan-${plan.value}`}
                              name="macroDistribution"
                              type="radio"
                              value={plan.value}
                              checked={nutritionEditData.macroDistribution === plan.value}
                              onChange={handleNutritionEditChange}
                              className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={`plan-${plan.value}`} className="font-medium text-gray-900">
                              {plan.label}
                            </label>
                            <p className="text-gray-500">{plan.description}</p>
                            <p className="text-xs text-gray-400 italic mt-1">{plan.recommended}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      Note: Changing your diet plan will adjust your macronutrient targets but not your total daily calories.
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Please complete your health profile to see nutrition insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionDashboard;