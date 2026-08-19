import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/app/routes/ProtectedRoute';
import ErrorBoundary from '@/app/providers/ErrorBoundary';
import ThemeInitializer from '@/app/providers/ThemeInitializer';
import PageTransition from '@/components/ui/PageTransition';

// ─── Persistent layout components ──────────────────────────────────────────
const Navbar  = lazy(() => import('@/components/ui/Navbar'));
const Footer  = lazy(() => import('@/components/ui/Footer'));
const ChatbotLauncher = lazy(() => import('@/features/ai/components/ChatbotLauncher'));

// ─── Route-level pages (code-split per route) ──────────────────────────────
const HomePage           = lazy(() => import('@/app/routes/HomePage'));
const ProductListingPage = lazy(() => import('@/features/products/pages/ProductListingPage'));
const ProductDetailsPage = lazy(() => import('@/features/products/pages/ProductDetailsPage'));
const CartPage           = lazy(() => import('@/features/cart/pages/CartPage'));
const SellerDashboard    = lazy(() => import('@/features/seller/pages/SellerDashboard'));
const ProductUploadPage  = lazy(() => import('@/features/seller/pages/ProductUploadPage'));
const WishlistPage       = lazy(() => import('@/features/products/pages/WishlistPage'));
const CheckoutPage       = lazy(() => import('@/features/checkout/pages/CheckoutPage'));
const OrderHistoryPage   = lazy(() => import('@/features/orders/pages/OrderHistoryPage'));
const OrderDetailsPage   = lazy(() => import('@/features/orders/pages/OrderDetailsPage'));
const AdminDashboard     = lazy(() => import('@/features/admin/pages/AdminDashboard'));
const About              = lazy(() => import('@/app/routes/About'));
const ShippingInfo       = lazy(() => import('@/app/routes/ShippingInfo'));
const Returns            = lazy(() => import('@/app/routes/Returns'));
const Contact            = lazy(() => import('@/app/routes/Contact'));

// ─── Auth pages (smallest possible initial JS) ─────────────────────────────
const LoginPage          = lazy(() => import('@/features/auth/pages/LoginPage'));
const SignupPage         = lazy(() => import('@/features/auth/pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const VerifyEmailPage    = lazy(() => import('@/features/auth/pages/VerifyEmailPage'));
const ResetPasswordPage  = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));

/* ─── Page-level loading spinner ─────────────────────────────────────────── */
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-bg-primary">
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border border-color-gold/30 border-t-color-gold" />
        <div
          className="absolute inset-2 animate-[spin_2s_ease-in-out_infinite_reverse] rounded-full border border-color-gold/10 border-b-color-gold/60"
        />
        <div className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-color-gold animate-pulse" />
      </div>
    </div>
  </div>
);

/* ─── Shared page shell (Navbar + Footer + Chatbot) ─────────────────────── */
const Layout = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-bg-primary text-text-primary">
    <Suspense fallback={<div className="h-20" aria-hidden />}>
      <Navbar />
    </Suspense>
    <main className="flex-1">{children}</main>
    <Suspense fallback={null}>
      <Footer />
    </Suspense>
    <Suspense fallback={null}>
      <ChatbotLauncher />
    </Suspense>
  </div>
);

/* ─── 404 page ───────────────────────────────────────────────────────────── */
const NotFound = () => (
  <Layout>
    <PageTransition>
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="text-display text-8xl text-color-gold">404</h1>
        <p className="text-text-secondary text-sm uppercase tracking-widest font-bold">This page does not exist.</p>
        <Link to="/" className="luxury-button mt-4">
          Return to Showroom
        </Link>
      </div>
    </PageTransition>
  </Layout>
);

/* ─── Animated Routes Wrapper ───────────────────────────────────────────── */
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth routes — no Layout shell (no Navbar/Footer) */}
        <Route path="/login"           element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup"          element={<PageTransition><SignupPage /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
        <Route path="/verify-email"    element={<PageTransition><VerifyEmailPage /></PageTransition>} />
        <Route path="/reset-password"  element={<PageTransition><ResetPasswordPage /></PageTransition>} />

        {/* Main app routes */}
        <Route path="/"                    element={<Layout><PageTransition><HomePage /></PageTransition></Layout>} />
        <Route path="/products"            element={<Layout><PageTransition><ProductListingPage /></PageTransition></Layout>} />
        <Route path="/category/:category"  element={<Layout><PageTransition><ProductListingPage /></PageTransition></Layout>} />
        <Route path="/products/:id"        element={<Layout><PageTransition><ProductDetailsPage /></PageTransition></Layout>} />
        <Route path="/cart"                element={<Layout><PageTransition><CartPage /></PageTransition></Layout>} />
        <Route path="/wishlist"            element={<Layout><PageTransition><WishlistPage /></PageTransition></Layout>} />
        <Route path="/about"               element={<Layout><PageTransition><About /></PageTransition></Layout>} />
        <Route path="/shipping-info"       element={<Layout><PageTransition><ShippingInfo /></PageTransition></Layout>} />
        <Route path="/returns"             element={<Layout><PageTransition><Returns /></PageTransition></Layout>} />
        <Route path="/contact"             element={<Layout><PageTransition><Contact /></PageTransition></Layout>} />

        {/* Protected customer routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Layout><PageTransition><CheckoutPage /></PageTransition></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Layout><PageTransition><OrderHistoryPage /></PageTransition></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <Layout><PageTransition><OrderDetailsPage /></PageTransition></Layout>
            </ProtectedRoute>
          }
        />

        {/* Seller routes — gated */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute requireSeller>
              <Layout><PageTransition><SellerDashboard /></PageTransition></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products/new"
          element={
            <ProtectedRoute requireSeller>
              <Layout><PageTransition><ProductUploadPage /></PageTransition></Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <Layout><PageTransition><AdminDashboard /></PageTransition></Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

import { initAuth } from '@/store/authStore';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import { useEffect } from 'react';

// Initialize Firebase Auth listener immediately
initAuth();

/* ─── App root ───────────────────────────────────────────────────────────── */
function App() {
  const user = useAuthStore((s) => s.user);
  const loadCart = useCartStore((s) => s.loadCart);

  useEffect(() => {
    loadCart();
  }, [user, loadCart]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeInitializer />
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#050505',
              color: '#F8F5ED',
              border: '1px solid rgba(201, 162, 39, 0.3)',
              borderRadius: '2rem',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              backdropFilter: 'blur(10px)',
              padding: '16px 24px',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
            },
            success: { iconTheme: { primary: '#C9A227', secondary: '#050505' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#050505' } },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
