import { auth, db } from "./firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Hàm lấy thông tin người dùng (vai trò và trạng thái)
const getUserInfo = async (uid) => {
  try {
    console.log("🔍 [Auth] Fetching user info for:", uid);
    const userRef = doc(db, "user", uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const role = userData.role || "user"; // Default to "user" if no role specified
      const status = userData.status || "active"; // Default to "active" if no status specified
      
      console.log("✅ [Auth] User info found - Role:", role, "Status:", status);
      return { role, status };
    } else {
      console.log("⚠️ [Auth] User document not found, defaulting to role: user, status: active");
      return { role: "user", status: "active" }; // Default values
    }
  } catch (error) {
    console.error("❌ [Auth] Error fetching user info:", error);
    return { role: "user", status: "active" }; // Default values on error
  }
};

export const signInUser = async ({ email, password }) => {
  try {
    console.log("🔐 [Auth] Attempting to sign in with email:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user info from Firestore
    const { role, status } = await getUserInfo(user.uid);
    
    // Check if account is suspended
    if (status === "suspended") {
      console.warn("🚫 [Auth] Suspended account attempted login:", email);
      throw new Error("ACCOUNT_SUSPENDED");
    }
    
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
    
    // Check if user document exists
    const userRef = doc(db, "user", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // New user - create document with default role and active status
      console.log("✅ [Auth] New Google user, creating profile with role: user, status: active");
      await setDoc(userRef, { 
        email: user.email, 
        fullName: user.displayName,
        provider: "google",
        role: "user", // Default role for Google sign-ups
        status: "active", // Default status
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
      
      return { uid: user.uid, email: user.email, displayName: user.displayName, role: "user" };
    }
    
    // User exists, get user info from Firestore
    const { role, status } = await getUserInfo(user.uid);
    
    // Check if account is suspended
    if (status === "suspended") {
      console.warn("🚫 [Auth] Suspended account attempted Google login:", user.email);
      throw new Error("ACCOUNT_SUSPENDED");
    }
    
    console.log("✅ [Auth] Google sign in successful for:", user.email, "with role:", role);
    return { uid: user.uid, email: user.email, displayName: user.displayName, role };
  } catch (error) {
    console.error("❌ [Auth] Google login error:", error);
    throw error;
  }
};