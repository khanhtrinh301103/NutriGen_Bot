// frontend/src/pages/components/onboarding/AllergiesStep.tsx
import React, { useState, useEffect } from 'react';
import { HealthProfile } from '../../../utils/nutritionCalculator';
import { 
  checkDietaryConflict, 
  getConflictingDiets, 
  checkAllergyDietConflict,
  checkCrossAllergy,
  getSuggestedAllergies
} from '../../../utils/dietaryConflicts';

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
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [allergyMessage, setAllergyMessage] = useState<string | null>(null);
  const [crossAllergyMessage, setCrossAllergyMessage] = useState<string | null>(null);
  
  console.log('Rendering AllergiesStep component', { 
    allergies: formData.allergies,
    dietaryRestrictions: formData.dietaryRestrictions || []
  });
  
  // Auto-select related allergies and show suggestions
  useEffect(() => {
    const { autoSelectAllergies, allergySuggestions } = getSuggestedAllergies(
      formData.allergies,
      formData.dietaryRestrictions || []
    );
    
    // Tự động chọn các dị ứng liên quan
    if (autoSelectAllergies.length > 0) {
      const newAllergies = [...formData.allergies];
      let added = false;
      
      autoSelectAllergies.forEach(allergy => {
        if (!formData.allergies.includes(allergy)) {
          newAllergies.push(allergy);
          added = true;
        }
      });
      
      if (added) {
        console.log('Auto-selecting related allergies:', autoSelectAllergies);
        setFormData({
          ...formData,
          allergies: newAllergies
        });
        
        // Hiển thị thông báo về việc tự động chọn dị ứng
        setAllergyMessage(`We've automatically selected some related allergies based on your choices.`);
        
        // Tự động xóa thông báo sau 5 giây
        setTimeout(() => {
          setAllergyMessage(null);
        }, 5000);
      }
    }
    
    // Hiển thị gợi ý về dị ứng chéo
    if (allergySuggestions.length > 0 && !crossAllergyMessage) {
      setCrossAllergyMessage(
        `Based on your allergies, you might also consider: ${allergySuggestions.join(', ')}.`
      );
    } else if (allergySuggestions.length === 0) {
      setCrossAllergyMessage(null);
    }
  }, [formData.allergies, formData.dietaryRestrictions]);
  
  // Handle allergy checkbox changes
  const handleAllergyChange = (allergy: string, checked: boolean) => {
    console.log(`Allergy change: ${allergy} - ${checked ? 'added' : 'removed'}`);
    
    if (checked) {
      // Kiểm tra dị ứng chéo để hiển thị gợi ý
      const { hasCrossAllergy, crossAllergies } = checkCrossAllergy(
        formData.allergies, 
        allergy
      );
      
      if (hasCrossAllergy) {
        setCrossAllergyMessage(
          `People allergic to ${allergy} often have reactions to: ${crossAllergies.join(', ')}.`
        );
      }
      
      // Kiểm tra xung đột với chế độ ăn đã chọn
      const currentDiets = formData.dietaryRestrictions || [];
      for (const diet of currentDiets) {
        const { hasConflict, conflictingAllergies } = checkAllergyDietConflict(
          [...formData.allergies, allergy], 
          diet
        );
        
        if (hasConflict) {
          setConflictMessage(
            `Warning: Your ${allergy} allergy may make the ${diet} diet difficult to follow.`
          );
          // Không ngăn người dùng chọn, chỉ cảnh báo họ
        }
      }
      
      setFormData({
        ...formData,
        allergies: [...formData.allergies, allergy]
      });
    } else {
      // Xóa thông báo dị ứng chéo khi bỏ chọn
      setCrossAllergyMessage(null);
      
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
      // Kiểm tra xung đột giữa các chế độ ăn
      const { hasConflict, conflictingDiet } = checkDietaryConflict(
        currentRestrictions, 
        restriction
      );
      
      if (hasConflict && conflictingDiet) {
        setConflictMessage(`Cannot select ${restriction} as it conflicts with ${conflictingDiet}`);
        return; // Don't add the conflicting diet
      }
      
      // Kiểm tra xung đột với dị ứng đã chọn
      const { hasConflict: hasAllergyConflict, conflictingAllergies } = checkAllergyDietConflict(
        formData.allergies, 
        restriction
      );
      
      if (hasAllergyConflict) {
        setConflictMessage(
          `Warning: The ${restriction} diet may be difficult with your ${conflictingAllergies.join(', ')} allergy.`
        );
        // Vẫn cho phép chọn, nhưng hiển thị cảnh báo
      } else {
        // Clear any previous conflict message
        setConflictMessage(null);
      }
      
      setFormData({
        ...formData,
        dietaryRestrictions: [...currentRestrictions, restriction]
      });
    } else {
      // Clear any conflict message when removing a diet
      setConflictMessage(null);
      
      setFormData({
        ...formData,
        dietaryRestrictions: currentRestrictions.filter(r => r !== restriction)
      });
    }
  };
  
  // Get list of conflicting diets that should be disabled
  const disabledDiets = getConflictingDiets(
    formData.dietaryRestrictions || [], 
    formData.allergies
  );
  
  return (
    <div className="space-y-10">
      {/* Allergies Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Allergies</h2>
        <p className="text-gray-600 mb-4">
          Select any allergies you have. We will exclude recipes containing these ingredients.
        </p>
        
        {allergyMessage && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-md flex items-start">
            <svg className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{allergyMessage}</span>
          </div>
        )}
        
        {crossAllergyMessage && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-md flex items-start">
            <svg className="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{crossAllergyMessage}</span>
          </div>
        )}
        
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
        
        {conflictMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-md flex items-start">
            <svg className="h-5 w-5 mr-2 flex-shrink-0 text-red-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{conflictMessage}</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DIETARY_RESTRICTIONS.map((restriction) => {
            const isDisabled = disabledDiets.includes(restriction);
            const isSelected = (formData.dietaryRestrictions || []).includes(restriction);
            
            return (
              <div key={restriction} className="flex items-center">
                <input
                  type="checkbox"
                  id={`diet-${restriction}`}
                  name="dietaryRestrictions"
                  value={restriction}
                  checked={isSelected}
                  disabled={!isSelected && isDisabled}
                  onChange={(e) => handleDietaryRestrictionChange(restriction, e.target.checked)}
                  className={`h-4 w-4 ${
                    isDisabled && !isSelected 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-emerald-600'
                  } focus:ring-emerald-500 border-gray-300 rounded`}
                />
                <label 
                  htmlFor={`diet-${restriction}`} 
                  className={`ml-2 text-sm ${
                    isDisabled && !isSelected 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700'
                  }`}
                >
                  {restriction}
                  {isDisabled && !isSelected && " (conflicts with selection)"}
                </label>
              </div>
            );
          })}
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