import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/app/routes/ProtectedRoute';
import ErrorBoundary from '@/app/providers/ErrorBoundary';
import ThemeInitializer from '@/app/providers/ThemeInitializer';

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
  <div className="theme-page flex min-h-screen items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-amber-400/20 border-t-amber-400" />
        <div
          className="absolute inset-1.5 animate-spin rounded-full border-4 border-amber-200/10 border-b-amber-200"
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
        />
      </div>
      <p className="text-sm font-bold tracking-wide text-gray-500 dark:text-white/40">
        Loading experience...
      </p>
    </div>
  </div>
);

/* ─── Shared page shell (Navbar + Footer + Chatbot) ─────────────────────── */

const Layout = ({ children }) => (
  <div className="theme-page flex min-h-screen flex-col">
    {/* Navbar suspense: tiny placeholder div maintains scroll-offset */}
    <Suspense fallback={<div className="h-20" aria-hidden />}>
      <Navbar />
    </Suspense>
    <main className="flex-1">{children}</main>
    <Suspense fallback={null}>
      <Footer />
    </Suspense>
    {/* Chatbot code loads only after first user interaction. */}
    <Suspense fallback={null}>
      <ChatbotLauncher />
    </Suspense>
  </div>
);

/* ─── 404 page ───────────────────────────────────────────────────────────── */

const NotFound = () => (
  <Layout>
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="theme-text text-5xl font-black">404</h1>
      <p className="theme-muted text-lg">This page does not exist.</p>
      <Link
        to="/"
        className="rounded-full bg-amber-300 px-6 py-3 font-black text-black transition-colors hover:bg-amber-200"
      >
        Back to Home
      </Link>
    </div>
  </Layout>
);

/* ─── App root ───────────────────────────────────────────────────────────── */

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeInitializer />
        <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: 'var(--color-panel-strong)',
                  color: 'var(--color-text)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  fontSize: '14px',
                  fontWeight: '700',
                  backdropFilter: 'blur(20px)',
                },
                success: { iconTheme: { primary: '#fbbf24', secondary: '#000' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />

            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth routes — no Layout shell (no Navbar/Footer) */}
                <Route path="/login"           element={<LoginPage />} />
                <Route path="/signup"          element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-email"    element={<VerifyEmailPage />} />
                <Route path="/reset-password"  element={<ResetPasswordPage />} />

                {/* Main app routes */}
                <Route path="/"                    element={<Layout><HomePage /></Layout>} />
                <Route path="/products"            element={<Layout><ProductListingPage /></Layout>} />
                <Route path="/category/:category"  element={<Layout><ProductListingPage /></Layout>} />
                <Route path="/products/:id"        element={<Layout><ProductDetailsPage /></Layout>} />
                <Route path="/cart"                element={<Layout><CartPage /></Layout>} />
                <Route path="/wishlist"            element={<Layout><WishlistPage /></Layout>} />
                <Route path="/about"               element={<Layout><About /></Layout>} />
                <Route path="/shipping-info"       element={<Layout><ShippingInfo /></Layout>} />
                <Route path="/returns"             element={<Layout><Returns /></Layout>} />
                <Route path="/contact"             element={<Layout><Contact /></Layout>} />

                {/* Protected customer routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Layout><CheckoutPage /></Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Layout><OrderHistoryPage /></Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <Layout><OrderDetailsPage /></Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Seller routes — gated */}
                <Route
                  path="/seller"
                  element={
                    <ProtectedRoute requireSeller>
                      <Layout><SellerDashboard /></Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seller/products/new"
                  element={
                    <ProtectedRoute requireSeller>
                      <Layout><ProductUploadPage /></Layout>
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
