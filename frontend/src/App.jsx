import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SellerDashboard from './pages/SellerDashboard';

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
    <Chatbot />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Login — no layout */}
            <Route path="/login" element={<LoginPage />} />

            {/* All other pages — with Navbar + Footer */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/products" element={<Layout><ProductListingPage /></Layout>} />
            <Route path="/products/:id" element={<Layout><ProductDetailsPage /></Layout>} />
            <Route path="/cart" element={<Layout><CartPage /></Layout>} />
            <Route
              path="/seller"
              element={
                <ProtectedRoute requireSeller>
                  <Layout><SellerDashboard /></Layout>
                </ProtectedRoute>
              }
            />
            {/* 404 fallback */}
            <Route path="*" element={
              <Layout>
                <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
                  <span className="material-symbols-outlined text-7xl text-gray-200">search_off</span>
                  <h2 className="text-3xl font-bold text-gray-400">404 — Page Not Found</h2>
                  <a href="/" className="text-primary hover:underline font-semibold">Go Home</a>
                </div>
              </Layout>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
