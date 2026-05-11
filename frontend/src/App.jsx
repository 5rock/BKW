import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';

// ── Lazy-loaded pages (code splitting)
const HomePage            = lazy(() => import('./pages/HomePage'));
const ProductListingPage  = lazy(() => import('./pages/ProductListingPage'));
const ProductDetailsPage  = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage            = lazy(() => import('./pages/CartPage'));
const SellerDashboard     = lazy(() => import('./pages/SellerDashboard'));

// ── Auth pages (separate bundle)
const LoginPage           = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage          = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage  = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const VerifyEmailPage     = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ResetPasswordPage   = lazy(() => import('./pages/auth/ResetPasswordPage'));

// ── Page loading skeleton
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading…</p>
    </div>
  </div>
);

// ── Layout wrapper (Navbar + Footer + Chatbot)
const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
    <Chatbot />
  </div>
);

// ── 404 page
const NotFound = () => (
  <Layout>
    <div className="min-h-[70vh] flex items-center justify-center flex-col gap-4 text-center p-6">
      <span className="material-symbols-outlined text-8xl text-gray-200 dark:text-gray-800">search_off</span>
      <h1 className="text-4xl font-bold text-gray-300 dark:text-gray-600">404</h1>
      <p className="text-gray-500 dark:text-gray-400 text-lg">This page doesn't exist.</p>
      <a
        href="/"
        className="mt-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
      >
        Back to Home
      </a>
    </div>
  </Layout>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
              },
            }}
          />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Auth pages (no Navbar/Footer) ── */}
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/signup"          element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-email"    element={<VerifyEmailPage />} />
              <Route path="/reset-password"  element={<ResetPasswordPage />} />

              {/* ── Public pages ── */}
              <Route path="/"            element={<Layout><HomePage /></Layout>} />
              <Route path="/products"    element={<Layout><ProductListingPage /></Layout>} />
              <Route path="/products/:id" element={<Layout><ProductDetailsPage /></Layout>} />

              {/* ── Authenticated pages ── */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Layout><CartPage /></Layout>
                  </ProtectedRoute>
                }
              />

              {/* ── Seller-only pages (backend flag: isSeller) ── */}
              <Route
                path="/seller"
                element={
                  <ProtectedRoute requireSeller>
                    <Layout><SellerDashboard /></Layout>
                  </ProtectedRoute>
                }
              />

              {/* ── 404 ── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
