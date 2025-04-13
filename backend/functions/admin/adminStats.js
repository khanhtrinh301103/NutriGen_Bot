// backend/functions/admin/adminStats.js
/**
 * Functions to get admin statistics
 */

const admin = require('firebase-admin');

/**
 * Get dashboard statistics for admin
 */
const getDashboardStats = async () => {
  try {
    console.log('[AdminStats] Getting dashboard statistics');
    
    // Example of how to get user count
    const userSnapshot = await admin.firestore().collection('users').count().get();
    const totalUsers = userSnapshot.data().count;
    
    // These would be replaced with actual database queries
    // in a production environment
    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: Math.floor((totalUsers || 100) * 0.7), // Example calculation
      totalRecipes: 540, // Example static value
      recipeSearches: 1250, // Example static value
      newUsersToday: 5 // Example static value
    };
    
    return stats;
  } catch (error) {
    console.error('[AdminStats] Error getting dashboard stats:', error);
    throw error;
  }
};

module.exports = {
  getDashboardStats
};