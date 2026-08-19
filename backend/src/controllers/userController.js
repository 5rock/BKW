const User = require('../models/User');
const { isMockMode } = require('../utils/connectDB');
const { mockModel } = require('../utils/db');

const MockUser = mockModel('users');

/** GET /api/users/me */
const getMe = async (req, res, next) => {
  try {
    const Model = isMockMode() ? MockUser : User;
    const user = await Model.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ message: 'Account suspended' });

    res.json({
      id: user.id || user._id,
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
    next(err);
  }
};

/** PUT /api/users/me */
const updateMe = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const Model = isMockMode() ? MockUser : User;
    const user = await Model.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Only allow updating safe fields
    if (name) user.name = name.trim();
    if (avatar) {
      try {
        const parsed = new URL(avatar);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
          user.avatar = avatar;
        }
      } catch {
        // Ignore invalid URL
      }
    }
    
    if (isMockMode()) {
      await MockUser.save(user);
    } else {
      await user.save();
    }

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe };
