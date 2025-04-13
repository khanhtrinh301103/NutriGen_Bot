// frontend/src/api/adminAPI/adminAPI.js
import { getAuth } from "firebase/auth";
import { isAdminUser } from "../authService";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { getUserStats } from "./UserManagement";

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
 * Get recipe statistics from Firestore
 * @returns {Object} Recipe statistics
 */
async function getRecipeStats() {
  try {
    console.log("📊 [Admin] Fetching recipe statistics");
    
    // Get total recipes
    const recipesCollectionRef = collection(db, "recipes");
    const recipesSnapshot = await getDocs(recipesCollectionRef);
    const totalRecipes = recipesSnapshot.size;
    
    // Get recipe searches (you'll need to implement this based on your data structure)
    // For example, if you store search history in a separate collection
    const searchesCollectionRef = collection(db, "searchHistory");
    const searchesSnapshot = await getDocs(searchesCollectionRef);
    const recipeSearches = searchesSnapshot.size;
    
    return {
      totalRecipes,
      recipeSearches
    };
  } catch (error) {
    console.error("❌ [Admin] Error fetching recipe stats:", error);
    console.log("❌ [Admin] Using default values for recipe stats");
    return {
      totalRecipes: 0,
      recipeSearches: 0
    };
  }
}

/**
 * Generate user registration trend data
 * @param {Array} users - Array of user objects
 * @returns {Array} User registration trend data
 */
function generateUserTrendData(users) {
  try {
    console.log("📈 [Admin] Generating user trend data");
    
    // Initialize result array for the last 7 days
    const result = [];
    const today = new Date();
    
    // Create date labels and initialize counts for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      result.push({
        date: dateString,
        count: 0
      });
    }
    
    // Count users registered on each day
    users.forEach(user => {
      if (user.createdAt) {
        const createdDate = new Date(user.createdAt);
        
        // Check if the user was created in the last 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          
          if (createdDate.getDate() === date.getDate() &&
              createdDate.getMonth() === date.getMonth() &&
              createdDate.getFullYear() === date.getFullYear()) {
            result[i].count++;
            break;
          }
        }
      }
    });
    
    console.log("✅ [Admin] Successfully generated user trend data:", result);
    return result;
  } catch (error) {
    console.error("❌ [Admin] Error generating user trend data:", error);
    return [];
  }
}

/**
 * Get user distribution data (by status and role)
 * @param {Array} users - Array of user objects
 * @returns {Object} User distribution data
 */
function getUserDistributionData(users) {
  try {
    console.log("📊 [Admin] Generating user distribution data");
    
    // Initialize counts
    const statusData = [
      { name: 'Active', value: 0 },
      { name: 'Inactive', value: 0 }
    ];
    
    const roleData = [
      { name: 'User', value: 0 },
      { name: 'Admin', value: 0 }
    ];
    
    // Count users by status and role
    users.forEach(user => {
      // Count by status
      if (user.status === 'active') {
        statusData[0].value++;
      } else {
        statusData[1].value++;
      }
      
      // Count by role
      if (user.role === 'admin') {
        roleData[1].value++;
      } else {
        roleData[0].value++;
      }
    });
    
    console.log("✅ [Admin] Successfully generated user distribution data");
    return {
      statusData,
      roleData
    };
  } catch (error) {
    console.error("❌ [Admin] Error generating user distribution data:", error);
    return {
      statusData: [],
      roleData: []
    };
  }
}

/**
 * Get admin dashboard statistics and chart data from Firestore
 * @returns {Object} Admin dashboard statistics and chart data
 */
export const getAdminStats = async () => {
  try {
    console.log("📊 [Admin] Fetching admin statistics");
    
    // Get user statistics
    const userStats = await getUserStats();
    
    // Get recipe statistics
    const recipeStats = await getRecipeStats();
    
    // Get all users for generating chart data
    const usersCollectionRef = collection(db, "user");
    const usersSnapshot = await getDocs(usersCollectionRef);
    
    const users = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email || "No Email",
        status: userData.status || "active",
        role: userData.role || "user",
        createdAt: userData.createdAt || null
      });
    });
    
    // Generate chart data
    const userTrendData = generateUserTrendData(users);
    const userDistribution = getUserDistributionData(users);
    
    // Combine all stats and chart data
    const adminStats = {
      totalUsers: userStats.totalUsers,
      activeUsers: userStats.activeUsers,
      newUsersToday: userStats.newUsersToday,
      totalRecipes: recipeStats.totalRecipes,
      recipeSearches: recipeStats.recipeSearches,
      userTrendData: userTrendData,
      userStatusData: userDistribution.statusData,
      userRoleData: userDistribution.roleData
    };
    
    console.log("✅ [Admin] Successfully fetched admin statistics and chart data");
    return adminStats;
  } catch (error) {
    console.error("❌ [Admin] Error fetching admin stats:", error);
    
    // Return default stats in case of error
    console.log("❌ [Admin] Using default values for admin stats");
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalRecipes: 0,
      recipeSearches: 0,
      newUsersToday: 0,
      userTrendData: [],
      userStatusData: [],
      userRoleData: []
    };
  }
};