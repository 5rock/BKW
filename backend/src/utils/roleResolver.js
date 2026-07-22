/**
 * roleResolver.js
 *
 * Backend-only role assignment logic.
 * The frontend NEVER sends a role. This module decides roles
 * purely from backend configuration and DB flags.
 *
 * Priority order:
 *   1. ADMIN_EMAILS   → 'admin'
 *   2. SELLER_EMAILS  → 'seller'
 *   3. everyone else  → 'customer'
 */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const APPROVED_SELLER_EMAILS = (process.env.APPROVED_SELLER_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Resolve a user's role from their email.
 * @param {string} email
 * @returns {'admin' | 'seller' | 'customer'}
 */
const resolveRole = (email = '') => {
  const normalized = email.trim().toLowerCase();
  if (ADMIN_EMAILS.includes(normalized)) return 'admin';
  if (APPROVED_SELLER_EMAILS.includes(normalized)) return 'seller';
  return 'customer';
};

/**
 * Derive the boolean permission flags stored on the user record.
 * @param {string} role
 * @returns {{ isAdmin: boolean, isSeller: boolean }}
 */
const resolveFlags = (role) => ({
  isAdmin: role === 'admin',
  isSeller: role === 'admin' || role === 'seller',
});

module.exports = { resolveRole, resolveFlags };
