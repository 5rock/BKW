/**
 * ProtectedRoute.jsx  (refactored)
 *
 * Wraps any route that requires authentication.
 *
 * Props:
 *   requireSeller  — gate to isSeller (backend-set flag)
 *   requireAdmin   — gate to isAdmin  (backend-set flag)
 *   requireVerified — gate to emailVerified
 *
 * Permission flags come from the backend via AuthContext.
 * The frontend never decides roles.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Spinner = () => (
  <div className="theme-page flex min-h-screen items-center justify-center">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm font-medium">Loading…</p>
    </motion.div>
  </div>
);

const ProtectedRoute = ({
  children,
  requireSeller   = false,
  requireAdmin    = false,
  requireVerified = false,
}) => {
  const { user, loading, isAdmin, isSeller } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;

  // Not logged in → redirect to login, remembering the intended route
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Email verification wall
  if (requireVerified && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Seller gate — uses backend-set isSeller flag
  if (requireSeller && !isSeller) {
    return <Navigate to="/" replace />;
  }

  // Admin gate — uses backend-set isAdmin flag
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Blocked account
  if (user.isBlocked) {
    return (
      <div className="theme-page flex min-h-screen items-center justify-center p-6">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-red-400 mb-4 block">block</span>
          <h2 className="theme-text mb-2 text-2xl font-bold">Account Suspended</h2>
          <p className="theme-muted text-sm">
            Your account has been suspended. Please contact{' '}
            <a href="mailto:support@goldmarket.com" className="text-amber-600 underline">support@goldmarket.com</a>.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
