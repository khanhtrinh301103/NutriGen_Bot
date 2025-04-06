// frontend/src/api/profile.js
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

// Get user profile data
export const getUserProfile = async (userId) => {
  try {
    console.log(`Getting profile for user: ${userId}`);
    const userRef = doc(db, "user", userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      console.log("Profile data found:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("No profile found, creating empty profile");
      // Create empty profile if it doesn't exist
      const emptyProfile = {
        healthProfile: {
          height: '',
          weight: '',
          age: '',
          gender: 'Male',
          activityLevel: 'Sedentary',
          goal: 'Weight Maintenance',
          allergies: [],
          dietaryRestrictions: [],
          mealsPerDay: 3,
          macroDistribution: 'Balanced'
        },
        savedRecipes: [],
        createdAt: new Date().toISOString()
      };
      
      await setDoc(userRef, emptyProfile);
      return emptyProfile;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update user profile data
export const updateUserProfile = async (userId, profileData) => {
  try {
    // Make sure user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userRef = doc(db, "user", userId);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      throw new Error("User profile does not exist");
    }
    
    const currentData = docSnap.data();
    const currentHealthProfile = currentData.healthProfile || {};
    
    // Check if we're updating a single nutrition field
    if (
      profileData.mealsPerDay !== undefined || 
      profileData.macroDistribution !== undefined
    ) {
      console.log("Updating nutrition field:", profileData);
      
      // Create an update object with just the necessary fields
      const updateFields = {};
      
      // For each key in profileData, add it to the healthProfile
      Object.keys(profileData).forEach(key => {
        updateFields[`healthProfile.${key}`] = profileData[key];
      });
      
      // Add updatedAt field
      updateFields.updatedAt = new Date().toISOString();
      
      // Update only the specific fields
      await updateDoc(userRef, updateFields);
      
      return true;
    }
    
    // Regular health profile update
    console.log("Updating full health profile");
    await updateDoc(userRef, {
      healthProfile: {
        ...currentHealthProfile,
        height: profileData.height,
        weight: profileData.weight,
        age: profileData.age,
        gender: profileData.gender,
        activityLevel: profileData.activityLevel,
        goal: profileData.goal,
        allergies: profileData.allergies || [],
        dietaryRestrictions: profileData.dietaryRestrictions || []
      },
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Get saved recipes
export const getSavedRecipes = async () => {
  try {
    // Make sure user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userId = currentUser.uid;
    const userRef = doc(db, "user", userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log(`Found ${userData.savedRecipes?.length || 0} saved recipes`);
      return userData.savedRecipes || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching saved recipes:", error);
    throw error;
  }
};

// Save a recipe
export const saveRecipe = async (recipe) => {
  try {
    // Make sure user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userId = currentUser.uid;
    const userRef = doc(db, "user", userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const savedRecipes = userData.savedRecipes || [];
      
      // Check if recipe already exists
      if (!savedRecipes.some(r => r.id === recipe.id)) {
        console.log(`Saving recipe: ${recipe.id} - ${recipe.title}`);
        
        const recipeToSave = {
          ...recipe,
          savedAt: new Date().toISOString()
        };
        
        await updateDoc(userRef, {
          savedRecipes: arrayUnion(recipeToSave)
        });
      } else {
        console.log(`Recipe ${recipe.id} already saved, skipping`);
      }
    }
    return true;
  } catch (error) {
    console.error("Error saving recipe:", error);
    throw error;
  }
};

// Remove a saved recipe
export const removeRecipe = async (recipeId) => {
  try {
    // Make sure user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userId = currentUser.uid;
    const userRef = doc(db, "user", userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const savedRecipes = userData.savedRecipes || [];
      
      console.log(`Removing recipe with ID: ${recipeId}`);
      
      // Find the recipe to remove
      const recipeToRemove = savedRecipes.find(recipe => recipe.id === recipeId);
      
      if (recipeToRemove) {
        // Remove the recipe
        await updateDoc(userRef, {
          savedRecipes: arrayRemove(recipeToRemove)
        });
        console.log(`Recipe ${recipeId} removed successfully`);
      } else {
        console.log(`Recipe ${recipeId} not found in saved recipes`);
      }
    }
    return true;
  } catch (error) {
    console.error("Error removing recipe:", error);
    throw error;
  }
};