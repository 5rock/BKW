const express = require('express');
const { protect, requireAdmin } = require('../../middleware/authMiddleware');
const { getAdminStats, getAllUsers, updateUserRole } = require('./adminController');

const router = express.Router();

// All admin routes are protected and// Base middleware for all admin routes
router.use(protect, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
