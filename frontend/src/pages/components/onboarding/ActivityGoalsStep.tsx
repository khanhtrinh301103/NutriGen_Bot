// frontend/src/pages/components/onboarding/ActivityGoalsStep.tsx
import React from 'react';
import { HealthProfile, calculateBMR, calculateTDEE, calculateTarget } from '../../../utils/nutritionCalculator';

interface ActivityGoalsStepProps {
  formData: HealthProfile;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ActivityGoalsStep: React.FC<ActivityGoalsStepProps> = ({ formData, handleChange }) => {
  console.log('Rendering ActivityGoalsStep component', { 
    activityLevel: formData.activityLevel, 
    goal: formData.goal 
  });
  
  const hasRequiredData = 
    formData.weight && 
    formData.height && 
    formData.age;
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Activity & Goals</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">
            Activity Level
          </label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="Sedentary">Sedentary (little or no exercise)</option>
            <option value="Lightly Active">Lightly active (light exercise 1-3 days/week)</option>
            <option value="Moderately Active">Moderately active (moderate exercise 3-5 days/week)</option>
            <option value="Very Active">Very active (hard exercise 6-7 days/week)</option>
            <option value="Extremely Active">Extremely active (very hard exercise & physical job)</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
            Your Goal
          </label>
          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="Weight Loss">Weight Loss</option>
            <option value="Weight Maintenance">Weight Maintenance</option>
            <option value="Weight Gain">Weight Gain</option>
            <option value="Muscle Gain">Muscle Gain</option>
            <option value="Improve Health">Improve Health</option>
          </select>
        </div>
        
        {/* Display calculated nutrition info based on input */}
        {hasRequiredData && (
          <div className="mt-8 bg-emerald-50 p-4 rounded-lg">
            <h3 className="font-medium text-emerald-800 mb-2">Based on your information:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Basal Metabolic Rate</p>
                <p className="text-lg font-bold text-emerald-600">
                  {calculateBMR(formData)} calories
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Daily Energy Expenditure</p>
                <p className="text-lg font-bold text-emerald-600">
                  {calculateTDEE(formData)} calories
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Target Calories</p>
                <p className="text-lg font-bold text-emerald-600">
                  {calculateTarget(formData)} calories
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityGoalsStep;