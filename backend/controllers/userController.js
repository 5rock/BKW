/**
 * userController.js  (refactored)
 *
 * Handles user profile operations only.
 * Authentication (register/login) has moved to authController.js.
 *
 * GET  /api/users/me          — get own profile
 * PUT  /api/users/me          — update own profile (name, avatar)
 */

const { readDB, writeDB } = require('../utils/db');

/** GET /api/users/me */
const getMe = (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ message: 'Account suspended' });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      verifiedSeller: user.verifiedSeller,
      emailVerified: user.emailVerified,
      avatar: user.avatar || null,
      provider: user.provider || 'email',
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/** PUT /api/users/me */
const updateMe = (req, res) => {
  try {
    const { name, avatar } = req.body;
    const db = readDB();
    const idx = db.users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });

    // Only allow updating safe fields — not role/isAdmin/isSeller
    if (name) db.users[idx].name = name.trim();
    if (avatar) db.users[idx].avatar = avatar;
    db.users[idx].updatedAt = new Date().toISOString();
    writeDB(db);

    res.json({ message: 'Profile updated', user: db.users[idx] });
  } catch (err) {
    console.error('updateMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMe, updateMe };
