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
 * Sign in an existing user
 */
export const signInUser = async (email, password) => {
  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("🔐 [Auth] User signed in:", email);
    return userCredential;
  } catch (error) {
    console.error("❌ [Auth] Sign in error:", error.code, error.message);
    throw error;
  }
};

/**
 * Register a new user
 */
export const registerUser = async (email, password, displayName) => {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Set the user's display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    console.log("🔐 [Auth] User registered:", email);
    return userCredential;
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