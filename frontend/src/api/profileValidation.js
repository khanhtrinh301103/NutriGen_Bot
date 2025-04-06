// frontend/src/api/profileValidation.js
import { getUserProfile } from './profile';
import { auth } from './firebaseConfig';

/**
 * Validates if the user's health profile is complete
 * @returns {Promise<Object>} An object with isComplete status and message if incomplete
 */
export const validateHealthProfile = async () => {
  try {
    // Make sure user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("❌ [Profile] Validation failed: User not authenticated");
      return {
        isComplete: false,
        message: "You need to be logged in to access this feature."
      };
    }
    
    const userId = currentUser.uid;
    console.log("🔍 [Profile] Validating health profile for user:", userId);
    
    // Get user profile data
    const profileData = await getUserProfile(userId);
    
    // Check if health profile exists
    if (!profileData || !profileData.healthProfile) {
      console.log("❌ [Profile] Validation failed: Health profile does not exist");
      return {
        isComplete: false,
        message: "Your health profile is missing. Please complete your profile information."
      };
    }
    
    const { healthProfile } = profileData;
    
    // Validate required fields
    // Note: allergies and dietaryRestrictions are optional as per requirements
    const requiredFields = [
      { name: 'height', label: 'Height' },
      { name: 'weight', label: 'Weight' },
      { name: 'age', label: 'Age' },
      { name: 'gender', label: 'Gender' },
      { name: 'activityLevel', label: 'Activity Level' },
      { name: 'goal', label: 'Goal' }
    ];
    
    // Check each required field
    const missingFields = requiredFields.filter(field => {
      // Field must exist and not be empty string
      return !healthProfile[field.name] || healthProfile[field.name] === '';
    });
    
    if (missingFields.length > 0) {
      // Construct a user-friendly message with missing fields
      const missingFieldLabels = missingFields.map(field => field.label);
      const message = `Please complete your health profile. Missing information: ${missingFieldLabels.join(', ')}`;
      
      console.log(`❌ [Profile] Validation failed: Missing fields: ${missingFieldLabels.join(', ')}`);
      
      return {
        isComplete: false,
        message: message,
        missingFields: missingFieldLabels
      };
    }
    
    // If we get here, the profile is complete
    console.log("✅ [Profile] Validation successful: Health profile is complete");
    return {
      isComplete: true
    };
    
  } catch (error) {
    console.error("💥 [Profile] Error validating health profile:", error);
    return {
      isComplete: false,
      message: "An error occurred while checking your profile. Please try again later.",
      error: error.message
    };
  }
};

/**
 * Higher-order function to create a profile gatekeeper
 * Use this to protect routes that require a complete health profile
 * @param {Function} onIncomplete Function to call when profile is incomplete (e.g., redirect)
 * @returns {Function} A function that checks profile and takes appropriate action
 */
export const requireCompleteProfile = (onIncomplete) => {
  return async () => {
    const validation = await validateHealthProfile();
    
    if (!validation.isComplete) {
      console.log("🚫 [Profile] Blocking access: Health profile incomplete");
      
      // Execute the callback with the validation result
      if (typeof onIncomplete === 'function') {
        onIncomplete(validation);
      }
      
      return false;
    }
    
    console.log("✅ [Profile] Granting access: Health profile is complete");
    return true;
  };
};