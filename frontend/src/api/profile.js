// frontend/src/api/profile.js - 업데이트 버전
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth, storage } from "./firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";

// Get user profile data
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
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

// Upload profile image and get URL
const uploadProfileImage = async (userId, imageFile) => {
  try {
    // 고유한 파일 이름 생성 (덮어쓰기 방지)
    const fileName = `profile-${userId}-${Date.now()}`;
    const storageRef = ref(storage, `profile-images/${fileName}`);
    await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

// Update user profile data
export const updateUserProfile = async (userId, profileData, profileImage = null) => {
  try {
    const userRef = doc(db, "users", userId);
    
    // Upload profile image if provided
    let photoURL = null;
    if (profileImage) {
      photoURL = await uploadProfileImage(userId, profileImage);
      
      // Update user auth profile
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { photoURL });
      }
    }
    
    // Update profile data in Firestore
    await updateDoc(userRef, {
      healthProfile: {
        height: profileData.height,
        weight: profileData.weight,
        age: profileData.age,
        gender: profileData.gender,
        activityLevel: profileData.activityLevel,
        goal: profileData.goal,
        allergies: profileData.allergies,
        dietaryRestrictions: profileData.dietaryRestrictions
      },
      ...(photoURL && { photoURL }),
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Get saved recipes
export const getSavedRecipes = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
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
export const saveRecipe = async (userId, recipe) => {
  try {
    const userRef = doc(db, "users", userId);
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
export const removeRecipe = async (userId, recipeId) => {
  try {
    const userRef = doc(db, "users", userId);
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