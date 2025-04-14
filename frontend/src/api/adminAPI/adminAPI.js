// frontend/src/api/adminAPI/adminAPI.js
import { getAuth } from "firebase/auth";
import { isAdminUser } from "../authService";

/**
 * Check if the current user has admin privileges.
 * @returns {boolean} True if user is admin, false otherwise.
 */
export const checkAdminAccess = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.log("❌ [Admin] No user logged in");
    return false;
  }
  
  const isAdmin = isAdminUser(user);
  console.log(`🔑 [Admin] User ${user.email} admin status: ${isAdmin}`);
  return isAdmin;
};
