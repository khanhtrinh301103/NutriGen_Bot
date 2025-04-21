// frontend/src/api/adminAPI/UserDetailsService.js
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getUserById } from './UserManagement';

/**
 * Get complete user details including health profile, calculated nutrition, etc.
 * @param {string} userId - The Firebase user ID
 * @returns {Promise<Object>} - Complete user details
 */
export const getUserDetails = async (userId) => {
  try {
    console.log(`🔍 [Admin] Fetching complete details for user: ${userId}`);
    
    // Get user document from Firestore
    const userDocRef = doc(db, "user", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      console.error(`❌ [Admin] User with ID ${userId} not found`);
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Get all user data
    const userData = userDocSnap.data();
    console.log(`✅ [Admin] Successfully fetched details for user: ${userData.fullName || userData.email}`);
    
    // Structure the data
    return {
      // Basic info
      id: userId,
      fullName: userData.fullName || "Unknown User",
      email: userData.email || "No Email",
      createdAt: userData.createdAt || null,
      updatedAt: userData.updatedAt || null,
      provider: userData.provider || "email",
      
      // Health profile
      healthProfile: userData.healthProfile || {},
      
      // Calculated nutrition
      calculatedNutrition: userData.healthProfile?.calculatedNutrition || {},
      
      // Saved recipes
      savedRecipes: userData.savedRecipes || [],
      
      // Any other user-specific data
      status: userData.status || "active",
      role: userData.role || "user",
    };
  } catch (error) {
    console.error(`❌ [Admin] Error fetching user details for ${userId}:`, error);
    throw error;
  }
};

/**
 * Update health profile for a user
 * @param {string} userId - The Firebase user ID
 * @param {Object} healthProfileData - The health profile data to update
 * @returns {Promise<boolean>} - True if update was successful
 */
export const updateUserHealthProfile = async (userId, healthProfileData) => {
  try {
    console.log(`✏️ [Admin] Updating health profile for user: ${userId}`);
    console.log("Update data:", healthProfileData);
    
    const userDocRef = doc(db, "user", userId);
    
    // First check if user exists
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      console.error(`❌ [Admin] User with ID ${userId} not found`);
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Update only the health profile
    await updateDoc(userDocRef, {
      'healthProfile': healthProfileData,
      'updatedAt': new Date().toISOString()
    });
    
    console.log(`✅ [Admin] Successfully updated health profile for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`❌ [Admin] Error updating health profile for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get user's saved recipes
 * @param {string} userId - The Firebase user ID
 * @returns {Promise<Array>} - Array of saved recipes
 */
export const getUserSavedRecipes = async (userId) => {
  try {
    console.log(`🍽️ [Admin] Fetching saved recipes for user: ${userId}`);
    
    const userDocRef = doc(db, "user", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      console.error(`❌ [Admin] User with ID ${userId} not found`);
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const userData = userDocSnap.data();
    const savedRecipes = userData.savedRecipes || [];
    
    console.log(`✅ [Admin] Found ${savedRecipes.length} saved recipes for user ${userId}`);
    return savedRecipes;
  } catch (error) {
    console.error(`❌ [Admin] Error fetching saved recipes for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get user's nutrition calculations
 * @param {string} userId - The Firebase user ID
 * @returns {Promise<Object>} - Nutrition calculation data
 */
export const getUserNutritionData = async (userId) => {
  try {
    console.log(`🥗 [Admin] Fetching nutrition data for user: ${userId}`);
    
    const userDocRef = doc(db, "user", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      console.error(`❌ [Admin] User with ID ${userId} not found`);
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const userData = userDocSnap.data();
    const calculatedNutrition = userData.healthProfile?.calculatedNutrition || {};
    
    console.log(`✅ [Admin] Successfully fetched nutrition data for user ${userId}`);
    return calculatedNutrition;
  } catch (error) {
    console.error(`❌ [Admin] Error fetching nutrition data for user ${userId}:`, error);
    throw error;
  }
};