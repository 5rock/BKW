import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const Spinner = () => (
  <div className="theme-page flex min-h-screen items-center justify-center">
    <div className="flex animate-fade-in flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
      <p className="text-sm font-medium text-gray-400">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({
  children,
  requireSeller = false,
  requireAdmin = false,
  requireVerified = false,
}) => {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const isSeller = useAuthStore((s) => s.isSeller);
  const location = useLocation();

  if (loading) return <Spinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireVerified && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (requireSeller && !isSeller) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (user.isBlocked) {
    return (
      <div className="theme-page flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">
          <span className="material-symbols-outlined mb-4 block text-6xl text-red-400">block</span>
          <h2 className="theme-text mb-2 text-2xl font-bold">Account Suspended</h2>
          <p className="theme-muted text-sm">
            Your account has been suspended. Please contact{' '}
            <a href="mailto:support@goldmarket.com" className="text-amber-600 underline">
              support@goldmarket.com
            </a>.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
