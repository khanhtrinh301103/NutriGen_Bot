// backend/functions/admin/adminUtils.js
/**
 * Utility functions for admin operations
 */

/**
 * Check if a user is an admin
 * @param {string} email User email to check
 * @returns {boolean} True if user is admin, false otherwise
 */
const isAdmin = (email) => {
    console.log(`[AdminUtils] Checking if ${email} is admin`);
    return email === "admin@gmail.com";
  };
  
  /**
   * Middleware to verify admin access
   * Use this to protect admin-only endpoints
   */
  const verifyAdmin = (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      console.error('[AdminUtils] No authenticated user found');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!isAdmin(user.email)) {
      console.error(`[AdminUtils] User ${user.email} is not an admin`);
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    console.log(`[AdminUtils] Admin access granted for ${user.email}`);
    next();
  };
  
  module.exports = {
    isAdmin,
    verifyAdmin
  };