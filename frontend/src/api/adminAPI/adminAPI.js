// frontend/src/api/adminAPI/adminAPI.js
import { getAuth } from "firebase/auth";
import { isAdminUser } from "../authService";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { getUserStats } from "./UserManagement";

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

/**
 * Get recipe statistics from Firestore.
 * Counts total recipes in "recipes" collection
 * and sums up the number of searches from all documents in "search_history".
 */
async function getRecipeStats() {
  try {
    console.log("📊 [Admin] Fetching recipe statistics");
    // Get total recipes
    const recipesCollectionRef = collection(db, "recipes");
    const recipesSnapshot = await getDocs(recipesCollectionRef);
    const totalRecipes = recipesSnapshot.size;
    
    // Instead of counting documents, we sum all searches in each document
    const searchesCollectionRef = collection(db, "search_history");
    const searchesSnapshot = await getDocs(searchesCollectionRef);

    let totalSearchCount = 0;
    searchesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.searches && Array.isArray(data.searches)) {
        totalSearchCount += data.searches.length; // add number of searches in this document
      }
    });

    const recipeSearches = totalSearchCount;

    console.log("✅ [Admin] Total recipes:", totalRecipes);
    console.log("✅ [Admin] Total recipe searches (across all docs):", recipeSearches);

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
 * Generate recipe search trend data by aggregating search events per day for the last 7 days.
 * @param {Array} searchEvents - Array of search events with a timestamp field.
 * @returns {Array} Recipe search trend data.
 */
function generateRecipeSearchTrend(searchEvents) {
  try {
    console.log("📈 [Admin] Generating recipe search trend data");
    const result = [];
    const today = new Date();
    // Initialize 7 days data
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      result.push({ date: dateString, count: 0 });
    }
    // Aggregate search count per day
    searchEvents.forEach(event => {
      if (event.timestamp) {
        const searchDate = new Date(event.timestamp);
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          if (
            searchDate.getDate() === date.getDate() &&
            searchDate.getMonth() === date.getMonth() &&
            searchDate.getFullYear() === date.getFullYear()
          ) {
            result[i].count++;
            break;
          }
        }
      }
    });
    console.log("✅ [Admin] Successfully generated recipe search trend data:", result);
    return result;
  } catch (error) {
    console.error("❌ [Admin] Error generating recipe search trend data:", error);
    return [];
  }
}

/**
 * Get popular keywords analysis from search_history collection.
 * Aggregates search terms from all documents.
 * @returns {Array} Array of objects with term and count.
 */
async function getPopularKeywords() {
  try {
    console.log("📊 [Admin] Fetching keyword analysis from search_history");
    const keywordsCollectionRef = collection(db, "search_history");
    const snapshot = await getDocs(keywordsCollectionRef);
    let keywordsCount = {};
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.searches && Array.isArray(data.searches)) {
        data.searches.forEach(search => {
          const term = search.term;
          if (term) {
            keywordsCount[term] = (keywordsCount[term] || 0) + 1;
          }
        });
      }
    });
    
    const popularKeywords = Object.entries(keywordsCount).map(([term, count]) => ({ term, count }));
    popularKeywords.sort((a, b) => b.count - a.count);
    console.log("✅ [Admin] Successfully fetched keyword analysis:", popularKeywords);
    return popularKeywords;
  } catch (error) {
    console.error("❌ [Admin] Error fetching keyword analysis:", error);
    return [];
  }
}

/**
 * Get admin dashboard statistics and chart data from Firestore.
 * @returns {Object} Admin dashboard statistics and chart data.
 */
export const getAdminStats = async () => {
  try {
    console.log("📊 [Admin] Fetching admin statistics");
    // Get user statistics.
    const userStats = await getUserStats();
    // Get recipe statistics.
    const recipeStats = await getRecipeStats();
    
    // Lấy tất cả người dùng để tạo dữ liệu biểu đồ
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
    const userTrendData = generateUserTrendData(users);
    const userDistribution = getUserDistributionData(users);
    
    // Lấy danh sách tất cả các search events từ collection search_history
    const searchEvents = [];
    const searchesSnapshot = await getDocs(collection(db, "search_history"));
    searchesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.searches && Array.isArray(data.searches)) {
        data.searches.forEach(search => {
          searchEvents.push(search);
        });
      }
    });
    const recipeSearchTrendData = generateRecipeSearchTrend(searchEvents);
    
    // Lấy phân tích từ khóa từ collection search_history
    const popularKeywords = await getPopularKeywords();
    
    const adminStats = {
      totalUsers: userStats.totalUsers,
      activeUsers: userStats.activeUsers, // Giữ nguyên nếu cần dùng
      newUsersToday: userStats.newUsersToday,
      totalRecipes: recipeStats.totalRecipes,
      recipeSearches: recipeStats.recipeSearches,
      recipeSearchTrendData, // Dữ liệu xu hướng tìm kiếm recipe trong 7 ngày
      popularKeywords,        // Dữ liệu phân tích từ khóa
      // Giữ lại dữ liệu phân tích người dùng khác (nếu cần)
      userTrendData,
      userStatusData: userDistribution.statusData,
      userRoleData: userDistribution.roleData
    };
    
    console.log("✅ [Admin] Successfully fetched admin statistics and chart data");
    return adminStats;
  } catch (error) {
    console.error("❌ [Admin] Error fetching admin stats:", error);
    console.log("❌ [Admin] Using default values for admin stats");
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalRecipes: 0,
      recipeSearches: 0,
      newUsersToday: 0,
      recipeSearchTrendData: [],
      popularKeywords: [],
      userTrendData: [],
      userStatusData: [],
      userRoleData: []
    };
  }
};

/**
 * Generate user registration trend data.
 * @param {Array} users - Array of user objects.
 * @returns {Array} User registration trend data.
 */
function generateUserTrendData(users) {
  try {
    console.log("📈 [Admin] Generating user trend data");
    const result = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      result.push({ date: dateString, count: 0 });
    }
    users.forEach(user => {
      if (user.createdAt) {
        const createdDate = new Date(user.createdAt);
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          if (
            createdDate.getDate() === date.getDate() &&
            createdDate.getMonth() === date.getMonth() &&
            createdDate.getFullYear() === date.getFullYear()
          ) {
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
 * Get user distribution data (by status and role).
 * @param {Array} users - Array of user objects.
 * @returns {Object} User distribution data.
 */
function getUserDistributionData(users) {
  try {
    console.log("📊 [Admin] Generating user distribution data");
    const statusData = [
      { name: "Active", value: 0 },
      { name: "Inactive", value: 0 }
    ];
    const roleData = [
      { name: "User", value: 0 },
      { name: "Admin", value: 0 }
    ];
    users.forEach(user => {
      if (user.status === "active") {
        statusData[0].value++;
      } else {
        statusData[1].value++;
      }
      if (user.role === "admin") {
        roleData[1].value++;
      } else {
        roleData[0].value++;
      }
    });
    console.log("✅ [Admin] Successfully generated user distribution data");
    return { statusData, roleData };
  } catch (error) {
    console.error("❌ [Admin] Error generating user distribution data:", error);
    return { statusData: [], roleData: [] };
  }
}
