// frontend/src/pages/components/profile/HealthProfileSection.tsx
import React, { useState, useEffect } from 'react';
import { updateUserProfile } from '../../../api/profile';
import { 
  checkDietaryConflict, 
  getConflictingDiets, 
  checkAllergyDietConflict,
  checkCrossAllergy,
  getSuggestedAllergies
} from '../../../utils/dietaryConflicts';

interface HealthProfileSectionProps {
  user: any;
  profileData: any;
  loading: boolean;
  onProfileUpdated: () => Promise<void>;
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

const HealthProfileSection: React.FC<HealthProfileSectionProps> = ({ 
  user, 
  profileData, 
  loading,
  onProfileUpdated 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'Male',
    activityLevel: 'Sedentary',
    goal: 'Weight Maintenance',
    allergies: [],
    dietaryRestrictions: []
  });
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [allergyMessage, setAllergyMessage] = useState<string | null>(null);
  const [crossAllergyMessage, setCrossAllergyMessage] = useState<string | null>(null);

  // Initialize edit data when profile data is loaded
  useEffect(() => {
    if (profileData && profileData.healthProfile) {
      console.log('Initializing health profile edit data', profileData.healthProfile);
      setEditData({
        height: profileData.healthProfile.height || '',
        weight: profileData.healthProfile.weight || '',
        age: profileData.healthProfile.age || '',
        gender: profileData.healthProfile.gender || 'Male',
        activityLevel: profileData.healthProfile.activityLevel || 'Sedentary',
        goal: profileData.healthProfile.goal || 'Weight Maintenance',
        allergies: profileData.healthProfile.allergies || [],
        dietaryRestrictions: profileData.healthProfile.dietaryRestrictions || []
      });
    }
  }, [profileData]);

  // Effect to handle auto-suggestions and cross-allergies when editing
  useEffect(() => {
    if (isEditing) {
      const { autoSelectAllergies, allergySuggestions } = getSuggestedAllergies(
        editData.allergies,
        editData.dietaryRestrictions
      );
      
      // Tự động chọn các dị ứng liên quan
      if (autoSelectAllergies.length > 0) {
        const newAllergies = [...editData.allergies];
        let added = false;
        
        autoSelectAllergies.forEach(allergy => {
          if (!editData.allergies.includes(allergy)) {
            newAllergies.push(allergy);
            added = true;
          }
        });
        
        if (added) {
          console.log('Auto-selecting related allergies:', autoSelectAllergies);
          setEditData({
            ...editData,
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
      
      // Kiểm tra xung đột giữa dị ứng và chế độ ăn
      for (const diet of editData.dietaryRestrictions) {
        const { hasConflict, conflictingAllergies } = checkAllergyDietConflict(
          editData.allergies, 
          diet
        );
        
        if (hasConflict && !conflictMessage) {
          setConflictMessage(
            `Warning: Your ${conflictingAllergies.join(', ')} ${
              conflictingAllergies.length > 1 ? 'allergies' : 'allergy'
            } may make the ${diet} diet difficult to follow.`
          );
          break; // Chỉ hiển thị một cảnh báo tại một thời điểm
        }
      }
    } else {
      // Reset all messages when not editing
      setAllergyMessage(null);
      setCrossAllergyMessage(null);
      setConflictMessage(null);
    }
  }, [isEditing, editData.allergies, editData.dietaryRestrictions]);

  const handleEditDataChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  const handleAllergiesChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      // Kiểm tra dị ứng chéo để hiển thị gợi ý
      const { hasCrossAllergy, crossAllergies } = checkCrossAllergy(
        editData.allergies, 
        value
      );
      
      if (hasCrossAllergy) {
        setCrossAllergyMessage(
          `People allergic to ${value} often have reactions to: ${crossAllergies.join(', ')}.`
        );
      }
      
      // Kiểm tra xung đột với chế độ ăn đã chọn
      for (const diet of editData.dietaryRestrictions) {
        const { hasConflict, conflictingAllergies } = checkAllergyDietConflict(
          [...editData.allergies, value], 
          diet
        );
        
        if (hasConflict) {
          setConflictMessage(
            `Warning: Your ${value} allergy may make the ${diet} diet difficult to follow.`
          );
          // Không ngăn người dùng chọn, chỉ cảnh báo họ
          break;
        }
      }
      
      setEditData({
        ...editData,
        allergies: [...editData.allergies, value]
      });
    } else {
      // Reset messages when removing allergies
      if (editData.allergies.length === 1) {
        setCrossAllergyMessage(null);
      }
      
      setEditData({
        ...editData,
        allergies: editData.allergies.filter(item => item !== value)
      });
    }
  };

  const handleDietaryRestrictionsChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      // Kiểm tra xung đột giữa các chế độ ăn
      const { hasConflict, conflictingDiet } = checkDietaryConflict(
        editData.dietaryRestrictions, 
        value
      );
      
      if (hasConflict && conflictingDiet) {
        setConflictMessage(`Cannot select ${value} as it conflicts with ${conflictingDiet}`);
        return; // Don't add the conflicting diet
      }
      
      // Kiểm tra xung đột với dị ứng đã chọn
      const { hasConflict: hasAllergyConflict, conflictingAllergies } = checkAllergyDietConflict(
        editData.allergies, 
        value
      );
      
      if (hasAllergyConflict) {
        setConflictMessage(
          `Warning: The ${value} diet may be difficult with your ${conflictingAllergies.join(', ')} allergy.`
        );
        // Vẫn cho phép chọn, nhưng hiển thị cảnh báo
      } else {
        // Clear any previous conflict message
        setConflictMessage(null);
      }
      
      setEditData({
        ...editData,
        dietaryRestrictions: [...editData.dietaryRestrictions, value]
      });
    } else {
      // Clear any conflict message when removing a diet
      setConflictMessage(null);
      
      setEditData({
        ...editData,
        dietaryRestrictions: editData.dietaryRestrictions.filter(item => item !== value)
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      console.log('Saving profile data:', editData);
      await updateUserProfile(user.uid, editData);
      
      // Reload profile data via parent component
      await onProfileUpdated();
      
      setIsEditing(false);
      setConflictMessage(null); // Clear any conflict messages
      setAllergyMessage(null);
      setCrossAllergyMessage(null);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  // Get list of conflicting diets that should be disabled
  const disabledDiets = getConflictingDiets(
    editData.dietaryRestrictions, 
    editData.allergies
  );

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{isEditing ? 'Edit Profile' : 'Your Health Profile'}</h2>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 primary-bg text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={editData.height}
                      onChange={handleEditDataChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={editData.weight}
                      onChange={handleEditDataChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={editData.age}
                      onChange={handleEditDataChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={editData.gender}
                      onChange={handleEditDataChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Activity & Goals Section */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-4">Activity & Goals</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                    <select
                      id="activityLevel"
                      name="activityLevel"
                      value={editData.activityLevel}
                      onChange={handleEditDataChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="Sedentary">Sedentary (little or no exercise)</option>
                      <option value="Lightly Active">Lightly active (light exercise 1-3 days/week)</option>
                      <option value="Moderately Active">Moderately active (moderate exercise 3-5 days/week)</option>
                      <option value="Very Active">Very active (hard exercise 6-7 days/week)</option>
                      <option value="Extremely Active">Extremely active (very hard exercise & physical job)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                    <select
                      id="goal"
                      name="goal"
                      value={editData.goal}
                      onChange={handleEditDataChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Weight Maintenance">Weight Maintenance</option>
                      <option value="Weight Gain">Weight Gain</option>
                      <option value="Muscle Gain">Muscle Gain</option>
                      <option value="Improve Health">Improve Health</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Allergies Section */}
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-700 mb-4">Allergies</h3>
                
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
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {COMMON_ALLERGIES.map((allergy) => (
                    <div key={allergy} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`allergy-${allergy}`}
                        name="allergies"
                        value={allergy}
                        checked={editData.allergies.includes(allergy)}
                        onChange={handleAllergiesChange}
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
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-700 mb-4">Dietary Restrictions</h3>
                
                {conflictMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-md flex items-start">
                    <svg className="h-5 w-5 mr-2 flex-shrink-0 text-red-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>{conflictMessage}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DIETARY_RESTRICTIONS.map((diet) => {
                    const isDisabled = disabledDiets.includes(diet);
                    const isSelected = editData.dietaryRestrictions.includes(diet);
                    
                    return (
                      <div key={diet} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`diet-${diet}`}
                          name="dietaryRestrictions"
                          value={diet}
                          checked={isSelected}
                          disabled={!isSelected && isDisabled}
                          onChange={handleDietaryRestrictionsChange}
                          className={`h-4 w-4 ${
                            isDisabled && !isSelected 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-emerald-600'
                          } focus:ring-emerald-500 border-gray-300 rounded`}
                        />
                        <label 
                          htmlFor={`diet-${diet}`} 
                          className={`ml-2 text-sm ${
                            isDisabled && !isSelected 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-gray-700'
                          }`}
                        >
                          {diet}
                          {isDisabled && !isSelected && " (conflicts with selection)"}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setConflictMessage(null); // Clear any conflict messages
                  setAllergyMessage(null);
                  setCrossAllergyMessage(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-6 py-2 primary-bg text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        ) : (
          profileData && profileData.healthProfile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold primary-text-color mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600">Height:</span>
                    <span className="font-medium text-gray-900">{profileData.healthProfile.height || 'Not set'} cm</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium text-gray-900">{profileData.healthProfile.weight || 'Not set'} kg</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium text-gray-900">{profileData.healthProfile.age || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium text-gray-900">{profileData.healthProfile.gender || 'Not set'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold primary-text-color mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Activity & Goals
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600">Activity Level:</span>
                    <span className="font-medium text-gray-900">{profileData.healthProfile.activityLevel || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-600">Goal:</span>
                    <span className="font-medium text-gray-900">{profileData.healthProfile.goal || 'Not set'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold primary-text-color mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Allergies
                </h3>
                {profileData.healthProfile.allergies && profileData.healthProfile.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.healthProfile.allergies.map((allergy, index) => (
                      <span key={index} className="bg-red-50 text-red-700 text-xs px-3 py-1 rounded-full border border-red-100">
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No allergies specified</p>
                )}
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold primary-text-color mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Dietary Restrictions
                </h3>
                {profileData.healthProfile.dietaryRestrictions && profileData.healthProfile.dietaryRestrictions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.healthProfile.dietaryRestrictions.map((diet, index) => (
                      <span key={index} className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full border border-emerald-100">
                        {diet}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No dietary restrictions specified</p>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default HealthProfileSection;