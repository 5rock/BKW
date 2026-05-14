import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'react-phone-input-2/lib/style.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductListingPage = lazy(() => import('./pages/ProductListingPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const ProductUploadPage = lazy(() => import('./pages/seller/ProductUploadPage'));
const WishlistPage = lazy(() => import('./pages/products/WishlistPage'));
const About = lazy(() => import('./pages/About'));
const ShippingInfo = lazy(() => import('./pages/ShippingInfo'));
const Returns = lazy(() => import('./pages/Returns'));
const Contact = lazy(() => import('./pages/Contact'));

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

const PageLoader = () => (
  <div className="theme-page flex min-h-screen items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-amber-400/20 border-t-amber-400" />
        <div className="absolute inset-1.5 animate-spin rounded-full border-4 border-amber-200/10 border-b-amber-200" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      <p className="text-sm font-bold tracking-wide text-gray-500 dark:text-white/40">Loading experience...</p>
    </div>
  </div>
);

const Layout = ({ children }) => (
  <div className="theme-page flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
    <Chatbot />
  </div>
);

const NotFound = () => (
  <Layout>
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="theme-text text-5xl font-black">404</h1>
      <p className="theme-muted text-lg">This page does not exist.</p>
      <Link to="/" className="rounded-full bg-amber-300 px-6 py-3 font-black text-black transition-colors hover:bg-amber-200">
        Back to Home
      </Link>
    </div>
  </Layout>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ErrorBoundary>
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
                success: {
                  iconTheme: { primary: '#fbbf24', secondary: '#000' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
              }}
            />

            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/products" element={<Layout><ProductListingPage /></Layout>} />
                <Route path="/category/:category" element={<Layout><ProductListingPage /></Layout>} />
                <Route path="/products/:id" element={<Layout><ProductDetailsPage /></Layout>} />
                <Route path="/cart" element={<Layout><CartPage /></Layout>} />
                <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
                <Route path="/about" element={<Layout><About /></Layout>} />
                <Route path="/shipping-info" element={<Layout><ShippingInfo /></Layout>} />
                <Route path="/returns" element={<Layout><Returns /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />

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
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
