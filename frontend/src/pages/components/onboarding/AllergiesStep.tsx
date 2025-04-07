// frontend/src/pages/components/onboarding/AllergiesStep.tsx
import React from 'react';
import { HealthProfile } from '../../../utils/nutritionCalculator';

interface AllergiesStepProps {
  formData: HealthProfile;
  setFormData: React.Dispatch<React.SetStateAction<HealthProfile>>;
}

// Common food allergies list
const COMMON_ALLERGIES = [
  'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 
  'Seafood', 'Sesame', 'Shellfish', 'Soy', 
  'Sulfite', 'Tree Nut', 'Wheat'
];

// Dietary restrictions list
const DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
  'Low-Carb', 'Keto', 'Paleo', 'Pescatarian', 'Mediterranean'
];

const AllergiesStep: React.FC<AllergiesStepProps> = ({ formData, setFormData }) => {
  console.log('Rendering AllergiesStep component', { 
    allergies: formData.allergies,
    dietaryRestrictions: formData.dietaryRestrictions || []
  });
  
  // Handle allergy checkbox changes
  const handleAllergyChange = (allergy: string, checked: boolean) => {
    console.log(`Allergy change: ${allergy} - ${checked ? 'added' : 'removed'}`);
    
    if (checked) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, allergy]
      });
    } else {
      setFormData({
        ...formData,
        allergies: formData.allergies.filter(a => a !== allergy)
      });
    }
  };
  
  // Handle dietary restriction checkbox changes
  const handleDietaryRestrictionChange = (restriction: string, checked: boolean) => {
    console.log(`Dietary restriction change: ${restriction} - ${checked ? 'added' : 'removed'}`);
    
    // Initialize dietaryRestrictions array if it doesn't exist
    const currentRestrictions = formData.dietaryRestrictions || [];
    
    if (checked) {
      setFormData({
        ...formData,
        dietaryRestrictions: [...currentRestrictions, restriction]
      });
    } else {
      setFormData({
        ...formData,
        dietaryRestrictions: currentRestrictions.filter(r => r !== restriction)
      });
    }
  };
  
  return (
    <div className="space-y-10">
      {/* Allergies Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Allergies</h2>
        <p className="text-gray-600 mb-4">
          Select any allergies you have. We will exclude recipes containing these ingredients.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {COMMON_ALLERGIES.map((allergy) => (
            <div key={allergy} className="flex items-center">
              <input
                type="checkbox"
                id={`allergy-${allergy}`}
                name="allergies"
                value={allergy}
                checked={formData.allergies.includes(allergy)}
                onChange={(e) => handleAllergyChange(allergy, e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor={`allergy-${allergy}`} className="ml-2 text-sm text-gray-700">
                {allergy}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dietary Restrictions Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Dietary Restrictions</h2>
        <p className="text-gray-600 mb-4">
          Select any dietary restrictions you follow. We'll personalize recipes to match your preferences.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DIETARY_RESTRICTIONS.map((restriction) => (
            <div key={restriction} className="flex items-center">
              <input
                type="checkbox"
                id={`diet-${restriction}`}
                name="dietaryRestrictions"
                value={restriction}
                checked={(formData.dietaryRestrictions || []).includes(restriction)}
                onChange={(e) => handleDietaryRestrictionChange(restriction, e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor={`diet-${restriction}`} className="ml-2 text-sm text-gray-700">
                {restriction}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              You can always update these preferences later in your profile settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllergiesStep;