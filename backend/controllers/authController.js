const crypto = require('crypto');
const validator = require('validator');
const User = require('../models/User');
const { resolveRole } = require('../utils/roleResolver');
const { signAccessToken, signRefreshToken, verifyToken } = require('../utils/tokenUtils');
const { verifyFirebaseToken } = require('../utils/firebaseAdmin');

const normalizePhone = (phone = '') => {
  const value = String(phone).replace(/[^\d+]/g, '');
  if (!value) return undefined;
  return value.startsWith('+') ? value : `+${value}`;
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || null,
  avatar: user.avatar || null,
  role: user.role,
  isAdmin: user.role === 'admin',
  isSeller: user.role === 'admin' || user.role === 'seller',
  isVerified: Boolean(user.isVerified),
  provider: user.provider,
  firebaseUid: user.firebaseUid || null,
  createdAt: user.createdAt,
});

const sendAuthResponse = (res, statusCode, user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return res.status(statusCode).json({
    accessToken,
    refreshToken,
    token: accessToken,
    user: publicUser(user),
  });
};

const register = async (req, res, next) => {
  try {
    const name = validator.escape(String(req.body.name || '').trim());
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = normalizePhone(req.body.phone);
    const { password } = req.body;

    const existing = await User.findOne({
      $or: [{ email }, ...(phone ? [{ phone }] : [])],
    });

    if (existing?.email === email) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    if (phone && existing?.phone === phone) {
      return res.status(409).json({ message: 'An account with this mobile number already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: resolveRole(email),
      provider: 'email',
      avatar: req.body.avatar || null,
      isVerified: false,
    });

    return sendAuthResponse(res, 201, user);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const identifier = String(req.body.identifier || req.body.email || req.body.phone || '').trim();
    const { password } = req.body;
    const isEmail = validator.isEmail(identifier);
    const phone = normalizePhone(identifier);

    const user = await User.findOne(
      isEmail ? { email: identifier.toLowerCase() } : { phone }
    ).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const resolvedRole = resolveRole(user.email);
    if (user.role !== resolvedRole) {
      user.role = resolvedRole;
      await user.save({ validateBeforeSave: false });
    }

    return sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

const socialLogin = async (req, res, next) => {
  try {
    const { idToken, provider = 'firebase', phone } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    const decoded = await verifyFirebaseToken(idToken);
    if (!decoded.email) {
      return res.status(400).json({ message: 'Email is required from the social provider' });
    }

    const email = decoded.email.toLowerCase();
    const safeProvider = ['google', 'facebook', 'github'].includes(provider) ? provider : 'firebase';
    const normalizedPhone = normalizePhone(phone || decoded.phone_number);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: decoded.name || email.split('@')[0],
        email,
        phone: normalizedPhone,
        avatar: decoded.picture || null,
        role: resolveRole(email),
        provider: safeProvider,
        firebaseUid: decoded.uid,
        isVerified: Boolean(decoded.email_verified),
      });
    } else {
      user.firebaseUid = user.firebaseUid || decoded.uid;
      user.avatar = user.avatar || decoded.picture || null;
      user.provider = user.provider === 'email' ? safeProvider : user.provider;
      user.isVerified = user.isVerified || Boolean(decoded.email_verified);
      if (normalizedPhone && !user.phone) user.phone = normalizedPhone;
      await user.save({ validateBeforeSave: false });
    }

    return sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      // Production hook: send resetToken by email provider. Do not return it outside development.
      if (process.env.NODE_ENV !== 'production') {
        return res.json({
          message: 'Password reset token generated. Send this through your email service.',
          resetToken,
        });
      }
    }

    return res.json({ message: 'If an account exists, password reset instructions have been sent.' });
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or expired' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid session' });

    return res.json({ accessToken: signAccessToken(user) });
  } catch (error) {
    return next(error);
  }
};

const logout = (_req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  firebaseAuth: socialLogin,
  socialLogin,
  forgotPassword,
  resetPassword,
};
