// frontend/src/api/profile.js
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";
import { updateProfile } from "firebase/auth";

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

export const uploadProfileImage = async (imageFile) => {
  try {
    // 사용자가 로그인되어 있는지 확인
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const userId = currentUser.uid;
    
    // 파일 확장자 추출
    const fileExtension = imageFile.name.split('.').pop();
    
    // 고유한 파일 이름 생성
    const fileName = `profile_${Date.now()}.${fileExtension}`;
    
    // 스토리지 경로 설정 - 각 사용자별 폴더 구조
    // profileImages 폴더 내에 사용자 ID별 폴더, 그 안에 이미지 저장
    const filePath = `profileImages/${userId}/${fileName}`;
    
    console.log("Preparing to upload to:", filePath);
    
    // Storage 레퍼런스 생성
    const storageRef = ref(storage, filePath);
    
    console.log("Starting upload...");
    
    // 파일 업로드
    await uploadBytes(storageRef, imageFile);
    
    console.log("Upload complete, getting download URL");
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log("Download URL:", downloadURL);
    
    // 사용자 프로필 업데이트
    await updateProfile(currentUser, {
      photoURL: downloadURL
    });
    
    console.log("Auth profile updated");
    
    // Firestore에 프로필 이미지 URL 저장
    const userRef = doc(db, "user", userId);
    await updateDoc(userRef, {
      photoURL: downloadURL,
      updatedAt: new Date().toISOString()
    });
    
    console.log("Firestore profile updated");
    
    return downloadURL;
  } catch (error) {
    console.error("Error in uploadProfileImage:", error);
    if (error.code) {
      console.error("Error code:", error.code);
    }
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