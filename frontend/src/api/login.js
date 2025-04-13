import { auth, db } from "./firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Hàm lấy vai trò người dùng
const getUserRole = async (uid) => {
  try {
    console.log("🔍 [Auth] Fetching role for user:", uid);
    const userRef = doc(db, "user", uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log("✅ [Auth] User role found:", userData.role || "user");
      return userData.role || "user"; // Default to "user" if no role specified
    } else {
      console.log("⚠️ [Auth] User document not found, defaulting to role: user");
      return "user"; // Default role
    }
  } catch (error) {
    console.error("❌ [Auth] Error fetching user role:", error);
    return "user"; // Default to user role on error
  }
};

export const signInUser = async ({ email, password }) => {
  try {
    console.log("🔐 [Auth] Attempting to sign in with email:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user role from Firestore
    const role = await getUserRole(user.uid);
    
    console.log("✅ [Auth] Sign in successful for:", email, "with role:", role);
    return { uid: user.uid, email: user.email, displayName: user.displayName, role };
  } catch (error) {
    console.error("❌ [Auth] Login error:", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    console.log("🔐 [Auth] Attempting to sign in with Google");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user document exists, if not create one
    const userRef = doc(db, "user", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // New user - create document with default role
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
    }
    
    // Get user role from Firestore
    const role = await getUserRole(user.uid);
    
    console.log("✅ [Auth] Google sign in successful for:", user.email, "with role:", role);
    return { uid: user.uid, email: user.email, displayName: user.displayName, role };
  } catch (error) {
    console.error("❌ [Auth] Google login error:", error);
    throw error;
  }
};