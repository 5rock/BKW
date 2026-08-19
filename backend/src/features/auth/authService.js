const authRepo = require('./authRepository');
const { resolveRole } = require('../../utils/roleResolver');
const { verifyFirebaseToken } = require('../../utils/firebaseAdmin');

const normalizePhone = (phone = '') => {
  const value = String(phone).replace(/[^\d+]/g, '');
  if (!value) return undefined;
  return value.startsWith('+') ? value : `+${value}`;
};

class AuthService {
  async register({ name, email, phone, password, avatar }) {
    const normalizedPhone = normalizePhone(phone);
    
    // Check existing
    const existing = await authRepo.findByEmail(email);
    if (existing) {
      const err = new Error('An account with this email already exists');
      err.status = 409;
      throw err;
    }

    if (normalizedPhone) {
      const existingPhone = await authRepo.findByPhone(normalizedPhone);
      if (existingPhone) {
        const err = new Error('An account with this mobile number already exists');
        err.status = 409;
        throw err;
      }
    }

    const userData = {
      name,
      email,
      phone: normalizedPhone,
      password,
      role: resolveRole(email),
      provider: 'email',
      avatar: avatar || null,
      isVerified: false,
    };

    return authRepo.create(userData);
  }

  async login({ identifier, password }) {
    const isEmail = identifier.includes('@');
    const normalizedPhone = normalizePhone(identifier);
    
    let user = isEmail 
      ? await authRepo.findByEmail(identifier.toLowerCase())
      : await authRepo.findByPhone(normalizedPhone);

    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const resolvedRole = resolveRole(user.email);
    if (user.role !== resolvedRole) {
      user.role = resolvedRole;
      await authRepo.save(user);
    }

    return user;
  }

  async socialLogin({ idToken, provider, phone }) {
    if (!idToken) {
      const err = new Error('Firebase ID token is required');
      err.status = 400;
      throw err;
    }

    const decoded = await verifyFirebaseToken(idToken);
    if (!decoded.email) {
      const err = new Error('Email is required from the social provider');
      err.status = 400;
      throw err;
    }

    const email = decoded.email.toLowerCase();
    const safeProvider = ['google', 'facebook', 'github'].includes(provider) ? provider : 'firebase';
    const normalizedPhone = normalizePhone(phone || decoded.phone_number);

    let user = await authRepo.findByEmail(email);
    if (!user) {
      user = await authRepo.create({
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
      await authRepo.save(user);
    }

    return user;
  }

  async generateResetToken(email) {
    const user = await authRepo.findByEmail(email);
    if (!user) return null;

    const resetToken = user.createPasswordResetToken();
    await authRepo.save(user);
    return resetToken;
  }

  async resetPassword(hashedToken, newPassword) {
    const user = await authRepo.findByResetToken(hashedToken, Date.now());
    if (!user) {
      const err = new Error('Password reset token is invalid or expired');
      err.status = 400;
      throw err;
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await authRepo.save(user);
    
    return user;
  }
}

module.exports = new AuthService();
