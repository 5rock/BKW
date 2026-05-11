/**
 * authController.js  (new — replaces userController registration/login logic)
 *
 * POST /api/auth/register   — email/password signup (no role from body)
 * POST /api/auth/login      — email/password login
 * POST /api/auth/refresh    — issue new access token from refresh token
 * POST /api/auth/logout     — clear refresh token (stateless for now)
 * POST /api/auth/firebase   — validate Firebase ID token → issue JWT
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { readDB, writeDB } = require('../utils/db');
const { resolveRole, resolveFlags } = require('../utils/roleResolver');
const { signAccessToken, signRefreshToken, verifyToken } = require('../utils/tokenUtils');

/* ─── helpers ─────────────────────────────────────────────────────────────── */

/** Strip sensitive fields before sending user to client */
const sanitizeUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  isAdmin: u.isAdmin,
  isSeller: u.isSeller,
  verifiedSeller: u.verifiedSeller,
  emailVerified: u.emailVerified,
  avatar: u.avatar || null,
  provider: u.provider || 'email',
  createdAt: u.createdAt,
});

/* ─── POST /api/auth/register ─────────────────────────────────────────────── */
const register = async (req, res) => {
  try {
    // express-validator already ran — only name/email/password arrive here
    const { name, email, password } = req.body;

    const db = readDB();
    if (db.users.find((u) => u.email === email.toLowerCase())) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // ✅ Role is resolved ENTIRELY by backend — never from req.body
    const role = resolveRole(email);
    const { isAdmin, isSeller } = resolveFlags(role);

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = {
      id: `u${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      provider: 'email',
      firebaseUid: null,
      role,
      isAdmin,
      isSeller,
      verifiedSeller: false,
      isBlocked: false,
      emailVerified: false,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDB(db);

    const accessToken = signAccessToken(newUser);
    const refreshToken = signRefreshToken(newUser);

    res.status(201).json({
      accessToken,
      refreshToken,
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

/* ─── POST /api/auth/login ────────────────────────────────────────────────── */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const db = readDB();
    const user = db.users.find((u) => u.email === email.toLowerCase());

    // Generic message — don't reveal whether email exists
    if (!user || user.provider !== 'email') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'This account has been suspended. Contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Re-resolve role on every login — catches email list changes
    const role = resolveRole(user.email);
    const { isAdmin, isSeller } = resolveFlags(role);

    // Patch role flags if they changed
    if (user.role !== role) {
      user.role = role;
      user.isAdmin = isAdmin;
      user.isSeller = isSeller;
      user.updatedAt = new Date().toISOString();
      writeDB(db);
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({ accessToken, refreshToken, user: sanitizeUser(user) });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

/* ─── POST /api/auth/refresh ──────────────────────────────────────────────── */
const refresh = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = verifyToken(refreshToken);
    const db = readDB();
    const user = db.users.find((u) => u.id === decoded.id);
    if (!user || user.isBlocked) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    const accessToken = signAccessToken(user);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Refresh token expired — please log in again' });
  }
};

/* ─── POST /api/auth/logout ───────────────────────────────────────────────── */
const logout = (_req, res) => {
  // Stateless JWT — client deletes tokens. Future: invalidate refresh in DB/Redis.
  res.json({ message: 'Logged out successfully' });
};

/* ─── POST /api/auth/firebase ─────────────────────────────────────────────── */
/**
 * Called after a successful Firebase OAuth login (Google, Facebook, GitHub).
 * Client sends the Firebase ID token → we verify it → we issue our own JWT.
 *
 * For now we do a lightweight decode (no firebase-admin SDK required).
 * To fully verify, install firebase-admin and use admin.auth().verifyIdToken().
 */
const firebaseAuth = async (req, res) => {
  try {
    const { idToken, provider = 'google' } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    // ── Decode Firebase token (base64 payload — NOT verified in this version)
    // In production with firebase-admin installed, replace this with:
    //   const decoded = await admin.auth().verifyIdToken(idToken);
    let decoded;
    try {
      const payload = idToken.split('.')[1];
      decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    } catch {
      return res.status(400).json({ message: 'Invalid Firebase token format' });
    }

    const { email, name, picture, uid, email_verified } = decoded;
    if (!email) {
      return res.status(400).json({ message: 'Email not available from provider' });
    }

    const db = readDB();
    let user = db.users.find((u) => u.email === email.toLowerCase());

    if (!user) {
      // Auto-create account for OAuth users
      const role = resolveRole(email);
      const { isAdmin, isSeller } = resolveFlags(role);

      user = {
        id: `u${Date.now()}`,
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        passwordHash: null,
        provider,
        firebaseUid: uid,
        role,
        isAdmin,
        isSeller,
        verifiedSeller: false,
        isBlocked: false,
        emailVerified: email_verified || false,
        avatar: picture || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(user);
      writeDB(db);
    } else if (user.isBlocked) {
      return res.status(403).json({ message: 'Account suspended. Contact support.' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    res.json({ accessToken, refreshToken, user: sanitizeUser(user) });
  } catch (err) {
    console.error('firebaseAuth error:', err);
    res.status(500).json({ message: 'OAuth authentication failed' });
  }
};

module.exports = { register, login, refresh, logout, firebaseAuth };
