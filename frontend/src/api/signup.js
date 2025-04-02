// frontend/src/api/signup.js
import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const registerUser = async ({ email, password, displayName }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });
    
    // Create user document with empty health profile
    await setDoc(doc(db, "user", user.uid), { 
      email, 
      fullName: displayName,
      provider: "password",
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
    
    return { uid: user.uid, email, displayName };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const signUpWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Create user document with empty health profile (using merge to avoid overwriting existing data)
    await setDoc(doc(db, "user", user.uid), { 
      email: user.email, 
      fullName: user.displayName,
      provider: "google",
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
    }, { merge: true });
    
    return { uid: user.uid, email: user.email, displayName: user.displayName };
  } catch (error) {
    console.error("Google sign-up error:", error);
    throw error;
  }
};