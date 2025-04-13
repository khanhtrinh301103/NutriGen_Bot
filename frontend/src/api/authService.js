import { 
  getAuth, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Check if user is currently authenticated
 */
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

/**
 * Get user role from Firestore
 */
export const getUserRole = async (uid) => {
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

/**
 * Sign in an existing user
 */
export const signInUser = async (email, password) => {
  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("🔐 [Auth] User signed in:", email);
    
    // Fetch user role
    const role = await getUserRole(userCredential.user.uid);
    
    return { ...userCredential, role };
  } catch (error) {
    console.error("❌ [Auth] Sign in error:", error.code, error.message);
    throw error;
  }
};

/**
 * Check if the current user is an admin
 */
export const isAdminUser = async (user) => {
  if (!user) {
    console.log("❌ [Auth] No user provided to check admin status");
    return false;
  }
  
  try {
    // Get user document to check role
    const userRef = doc(db, "user", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const isAdmin = userData.role === "admin";
      console.log("🔍 [Auth] Admin check for user:", user.email, "result:", isAdmin);
      return isAdmin;
    } else {
      console.log("⚠️ [Auth] User document not found for admin check");
      return false;
    }
  } catch (error) {
    console.error("❌ [Auth] Error checking admin status:", error);
    return false;
  }
}

/**
 * Register a new user
 */
export const registerUser = async (email, password, displayName, role = "user") => {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Set the user's display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    console.log("🔐 [Auth] User registered:", email, "with role:", role);
    return { ...userCredential, role };
  } catch (error) {
    console.error("❌ [Auth] Registration error:", error.code, error.message);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email) => {
  const auth = getAuth();
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("📧 [Auth] Password reset email sent to:", email);
  } catch (error) {
    console.error("❌ [Auth] Password reset error:", error.code, error.message);
    throw error;
  }
};

/**
 * Change password for current user
 * Requires reauthentication with current password before changing
 */
export const changePassword = async (currentPassword, newPassword) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.error("❌ [Auth] No user is currently logged in");
    throw new Error("No user is currently logged in");
  }
  
  try {
    // Re-authenticate user before changing password
    console.log("🔄 [Auth] Re-authenticating user before password change");
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
    console.log("✅ [Auth] Password changed successfully");
    return true;
  } catch (error) {
    console.error("❌ [Auth] Password change error:", error.code, error.message);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  const auth = getAuth();
  try {
    // Clear any user-specific data from localStorage
    localStorage.removeItem('recipeSearchState');
    console.log("🧹 [Auth] Cleared user-specific data from localStorage");
    
    await signOut(auth);
    console.log("🔓 [Auth] User signed out successfully");
  } catch (error) {
    console.error("❌ [Auth] Sign out error:", error);
    throw error;
  }
};