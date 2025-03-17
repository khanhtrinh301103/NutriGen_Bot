// frontend/src/api/profile.js
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

// Get user profile data
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "user", userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
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
          dietaryRestrictions: []
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
    
    // Update profile data in Firestore
    await updateDoc(userRef, {
      healthProfile: {
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
        const updatedRecipes = [...savedRecipes, {
          ...recipe,
          savedAt: new Date().toISOString()
        }];
        
        await updateDoc(userRef, {
          savedRecipes: updatedRecipes
        });
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
      
      const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
      
      await updateDoc(userRef, {
        savedRecipes: updatedRecipes
      });
    }
    return true;
  } catch (error) {
    console.error("Error removing recipe:", error);
    throw error;
  }
};