// frontend/src/api/adminAPI.js
import { getAuth } from "firebase/auth";
import { isAdminUser } from "../authService";

/**
 * Check if the current user has admin privileges
 * @returns {boolean} True if user is admin, false otherwise
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

/**
 * Get admin dashboard statistics
 * This is a placeholder function that would fetch actual data from backend
 */
export const getAdminStats = async () => {
  try {
    console.log("📊 [Admin] Fetching admin statistics");
    // In a real implementation, this would fetch data from your backend
    return {
      totalUsers: 120,
      activeUsers: 85,
      totalRecipes: 540,
      recipeSearches: 1250,
      newUsersToday: 5
    };
  } catch (error) {
    console.error("❌ [Admin] Error fetching admin stats:", error);
    throw error;
  }
};