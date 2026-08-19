const authService = require('./authService');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/tokenUtils');
const User = require('../../models/User'); // Used for verify refresh logic temporarily

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

const sendAuthResponse = async (res, statusCode, user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const isProd = process.env.NODE_ENV === 'production';

  // Save refresh token to user
  if (!user.refreshTokens) user.refreshTokens = [];
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie('gm_access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('gm_refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(statusCode).json({
    message: 'Authenticated successfully',
    user: publicUser(user),
  });
};

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return await sendAuthResponse(res, 201, user);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const identifier = String(req.body.identifier || req.body.email || req.body.phone || '').trim();
    const { password } = req.body;
    
    const user = await authService.login({ identifier, password });
    return await sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

const socialLogin = async (req, res, next) => {
  try {
    const user = await authService.socialLogin(req.body);
    return await sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const resetToken = await authService.generateResetToken(email);

    if (resetToken && process.env.NODE_ENV !== 'production') {
      // In dev, use our mock email service
      const sendEmail = require('../../utils/sendEmail');
      await sendEmail({
        to: email,
        subject: 'Password Reset - GoldMarket',
        text: `Your password reset token is: ${resetToken}\nOr use link: http://localhost:5173/reset-password?token=${resetToken}`
      });
      return res.json({
        message: 'Password reset token generated and mock email sent. Check server console.',
        resetToken, // keeping it for frontend dev convenience
      });
    }

    return res.json({ message: 'If an account exists, password reset instructions have been sent.' });
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const crypto = require('node:crypto');
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await authService.resetPassword(hashedToken, req.body.password);
    return await sendAuthResponse(res, 200, user);
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.gm_refresh_token;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      // If token expired or invalid, we could check DB, but it's cryptographic failure
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user) return res.status(401).json({ message: 'Invalid session' });

    // Reuse detection
    const isTokenValid = user.refreshTokens.includes(refreshToken);
    if (!isTokenValid) {
      // Possible token theft / reuse! Clear ALL refresh tokens.
      user.refreshTokens = [];
      await user.save();
      return res.status(401).json({ message: 'Security alert: Invalid token reuse. Please log in again.' });
    }

    // Token is valid and exists in DB: Rotate token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    
    const accessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);
    
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    const isProd = process.env.NODE_ENV === 'production';
    
    res.cookie('gm_access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('gm_refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ message: 'Token refreshed' });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.gm_refresh_token;
    if (refreshToken) {
      // Optional: decode without verification to find user ID, or rely on protect middleware if applied
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(refreshToken);
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, {
            $pull: { refreshTokens: refreshToken }
          });
        }
      } catch (err) {
        console.error('[Logout] Token decode error:', err.message);
      }
    }

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = { httpOnly: true, secure: isProd, sameSite: 'strict' };
    res.clearCookie('gm_access_token', cookieOptions);
    res.clearCookie('gm_refresh_token', cookieOptions);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    return next(error);
  }
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
