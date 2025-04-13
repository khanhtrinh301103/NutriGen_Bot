// frontend/src/api/signup.js
import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// Đảm bảo import getDoc, doc
import { doc, setDoc, getDoc } from "firebase/firestore";

export const registerUser = async ({ email, password, displayName }) => {
  try {
    console.log("🔐 [Auth] Registering new user with email:", email);
    
    // Xác định role (admin chỉ nếu email là admin@gmail.com)
    const role = email === "admin@gmail.com" ? "admin" : "user";
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });
    
    // Create user document with empty health profile and role
    await setDoc(doc(db, "user", user.uid), { 
      email, 
      fullName: displayName,
      provider: "password",
      role: role, // Add role field
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log("✅ [Auth] User registered successfully with role:", role);
    return { uid: user.uid, email, displayName, role };
  } catch (error) {
    console.error("❌ [Auth] Registration error:", error);
    throw error;
  }
};

export const signUpWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    console.log("🔐 [Auth] Attempting to sign up with Google");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user already exists
    const userRef = doc(db, "user", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // New user - create document with role
      console.log("✅ [Auth] New Google user, creating profile with role: user");
      await setDoc(userRef, { 
        email: user.email, 
        fullName: user.displayName,
        provider: "google",
        role: "user", // Default role for Google sign-ups
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      console.log("🔄 [Auth] Existing Google user, logging in");
    }
    
    return { uid: user.uid, email: user.email, displayName: user.displayName };
  } catch (error) {
    console.error("❌ [Auth] Google sign-up error:", error);
    throw error;
  }
};