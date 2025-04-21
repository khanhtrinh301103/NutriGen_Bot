// backend/functions/admin/index.js
const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('./adminUtils');
const { getDashboardStats } = require('./adminStats');

// All routes in this file require admin access
router.use(verifyAdmin);

// Get admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('[AdminAPI] Error in /admin/stats:', error);
    res.status(500).json({ error: 'Failed to get admin statistics' });
  }
});

// Add more admin routes here

module.exports = router;