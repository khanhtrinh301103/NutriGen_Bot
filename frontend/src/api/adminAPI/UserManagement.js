// frontend/src/api/adminAPI/UserManagement.js
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  getDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  deleteUser, 
  updatePassword,
  listUsers,
  getUser
} from 'firebase/auth';

// Get all users from Firestore
export const getAllUsers = async () => {
  try {
    console.log("👥 [Admin] Fetching all users from Firestore");
    
    // Get all users from the users collection
    const usersCollectionRef = collection(db, "user");
    const usersSnapshot = await getDocs(usersCollectionRef);
    
    // Process users data
    const users = [];
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Get user authentication data if possible
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("No admin user is currently logged in");
        }
        
        // In a real Firebase Admin SDK implementation, you would use admin.auth().getUser()
        // But in client-side code, we'll just use the Firestore data and auth if available
        
        users.push({
          id: userDoc.id,
          name: userData.fullName || userData.displayName || "Unknown User",
          email: userData.email || "No Email",
          status: userData.status || "active",
          role: userData.role || "user",
          lastLogin: userData.lastLogin || "Never",
          createdAt: userData.createdAt || null,
          updatedAt: userData.updatedAt || null,
          healthProfile: userData.healthProfile || null,
          // Add any other fields you need
        });
      } catch (error) {
        console.error(`❌ [Admin] Error getting auth data for user ${userDoc.id}:`, error);
        // Still add the user with available Firestore data
        users.push({
          id: userDoc.id,
          name: userData.fullName || userData.displayName || "Unknown User",
          email: userData.email || "No Email",
          status: userData.status || "active",
          role: userData.role || "user",
          lastLogin: userData.lastLogin || "Never",
          createdAt: userData.createdAt || null,
          updatedAt: userData.updatedAt || null,
        });
      }
    }
    
    console.log(`✅ [Admin] Successfully fetched ${users.length} users`);
    return users;
  } catch (error) {
    console.error("❌ [Admin] Error fetching users:", error);
    throw error;
  }
};

// Get a specific user by ID
export const getUserById = async (userId) => {
  try {
    console.log(`🔍 [Admin] Fetching user with ID: ${userId}`);
    
    // Get user from Firestore
    const userDocRef = doc(db, "user", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      console.error(`❌ [Admin] User with ID ${userId} not found`);
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const userData = userDocSnap.data();
    
    // Return user data
    const user = {
      id: userId,
      name: userData.fullName || userData.displayName || "Unknown User",
      email: userData.email || "No Email",
      status: userData.status || "active",
      role: userData.role || "user",
      lastLogin: userData.lastLogin || "Never",
      createdAt: userData.createdAt || null,
      updatedAt: userData.updatedAt || null,
      healthProfile: userData.healthProfile || null,
      savedRecipes: userData.savedRecipes || [],
      // Add any other fields you need
    };
    
    console.log(`✅ [Admin] Successfully fetched user: ${user.name} (${user.email})`);
    return user;
  } catch (error) {
    console.error(`❌ [Admin] Error fetching user with ID ${userId}:`, error);
    throw error;
  }
};

// Delete a user
export const deleteUserAccount = async (userId) => {
  try {
    console.log(`🗑️ [Admin] Deleting user with ID: ${userId}`);
    
    // Delete user from Firestore
    const userDocRef = doc(db, "user", userId);
    
    // Check if user exists first
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      console.error(`❌ [Admin] User with ID ${userId} not found`);
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Don't allow deletion of admin users
    const userData = userDocSnap.data();
    if (userData.email === "admin@gmail.com") {
      console.error("❌ [Admin] Cannot delete admin user");
      throw new Error("Cannot delete admin user");
    }
    
    // Delete user document from Firestore
    await deleteDoc(userDocRef);
    
    // Note: Deleting users from Firebase Auth requires the Admin SDK
    // In a real admin interface, you would use admin.auth().deleteUser(uid)
    console.log("⚠️ [Admin] Auth record deletion requires admin SDK - only Firestore record deleted");
    
    console.log(`✅ [Admin] Successfully deleted user ${userId}`);
    return true;
  } catch (error) {
    console.error(`❌ [Admin] Error deleting user ${userId}:`, error);
    throw error;
  }
};

// Change user status (active/inactive)
export const changeUserStatus = async (userId, status) => {
  try {
    console.log(`🔄 [Admin] Changing status for user ${userId} to ${status}`);
    
    // Update user status in Firestore
    const userDocRef = doc(db, "user", userId);
    await updateDoc(userDocRef, {
      status: status,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`✅ [Admin] Successfully updated status for user ${userId} to ${status}`);
    return true;
  } catch (error) {
    console.error(`❌ [Admin] Error changing status for user ${userId}:`, error);
    throw error;
  }
};

// Get user statistics
export const getUserStats = async () => {
  try {
    console.log("📊 [Admin] Fetching user statistics");
    
    const usersCollectionRef = collection(db, "user");
    const usersSnapshot = await getDocs(usersCollectionRef);
    
    const totalUsers = usersSnapshot.size;
    
    // Count active users
    let activeUsers = 0;
    let newUsersToday = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      
      // Count active users
      if (userData.status === "active") {
        activeUsers++;
      }
      
      // Count new users created today
      if (userData.createdAt) {
        const createdDate = new Date(userData.createdAt);
        if (createdDate >= today) {
          newUsersToday++;
        }
      }
    });
    
    const stats = {
      totalUsers,
      activeUsers,
      newUsersToday
    };
    
    console.log("✅ [Admin] User statistics:", stats);
    return stats;
  } catch (error) {
    console.error("❌ [Admin] Error fetching user statistics:", error);
    throw error;
  }
};

// Search users by name or email
export const searchUsers = async (searchTerm) => {
  try {
    console.log(`🔍 [Admin] Searching users with term: ${searchTerm}`);
    
    // Get all users (in a real app with many users, you'd want to implement server-side filtering)
    const users = await getAllUsers();
    
    // Filter users based on search term
    const filteredUsers = users.filter(user => {
      const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || emailMatch;
    });
    
    console.log(`✅ [Admin] Found ${filteredUsers.length} users matching search term`);
    return filteredUsers;
  } catch (error) {
    console.error(`❌ [Admin] Error searching users:`, error);
    throw error;
  }
};

// Filter users by status
export const filterUsersByStatus = async (status) => {
  try {
    console.log(`🔍 [Admin] Filtering users by status: ${status}`);
    
    // Get all users
    const users = await getAllUsers();
    
    // Filter by status if not 'all'
    if (status === 'all') {
      return users;
    }
    
    const filteredUsers = users.filter(user => user.status === status);
    
    console.log(`✅ [Admin] Found ${filteredUsers.length} users with status ${status}`);
    return filteredUsers;
  } catch (error) {
    console.error(`❌ [Admin] Error filtering users by status:`, error);
    throw error;
  }
};

// Filter users by role
export const filterUsersByRole = async (role) => {
  try {
    console.log(`🔍 [Admin] Filtering users by role: ${role}`);
    
    // Get all users
    const users = await getAllUsers();
    
    // Filter by role if not 'all'
    if (role === 'all') {
      return users;
    }
    
    const filteredUsers = users.filter(user => user.role === role);
    
    console.log(`✅ [Admin] Found ${filteredUsers.length} users with role ${role}`);
    return filteredUsers;
  } catch (error) {
    console.error(`❌ [Admin] Error filtering users by role:`, error);
    throw error;
  }
};