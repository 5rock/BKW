import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, Camera, Bell, Heart, ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, logout, isSeller } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-background-dark/80 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-800'
          : 'bg-white dark:bg-background-dark border-b border-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 lg:gap-8">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 180 }} 
              transition={{ duration: 0.3 }}
              className="w-10 h-10 bg-gradient-to-br from-brand-yellow to-brand-red rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"
            >
              M
            </motion.div>
            <span className="text-2xl font-black tracking-tight text-text-light dark:text-text-dark hidden sm:block">
              Market<span className="text-brand-red">X</span>
            </span>
          </Link>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-2xl hidden md:block relative">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand-red transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-24 py-3 border border-gray-200 dark:border-gray-700 rounded-full leading-5 bg-gray-50 dark:bg-gray-800/50 text-text-light dark:text-text-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                <button type="button" className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                  <Mic className="h-4 w-4" />
                </button>
                <button type="button" className="p-1.5 text-gray-400 hover:text-brand-yellow hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <DarkModeToggle />
            
            <button className="hidden sm:flex p-2 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-red rounded-full border-2 border-white dark:border-background-dark"></span>
            </button>

            <Link to="/wishlist" className="hidden sm:flex p-2 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative group">
              <Heart className="h-6 w-6 group-hover:text-brand-red transition-colors" />
            </Link>

            <Link to="/cart" className="p-2 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative group">
              <ShoppingCart className="h-6 w-6 group-hover:text-brand-yellow transition-colors" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-brand-red text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-transparent focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-yellow to-brand-red flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden lg:block text-text-light dark:text-text-dark max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right"
                    >
                      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                        <p className="font-semibold text-text-light dark:text-text-dark truncate">{user.name}</p>
                        <p className="text-sm text-text-muted-light dark:text-text-muted-dark truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        {isSeller && (
                          <Link
                            to="/seller"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-text-light dark:text-text-dark rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 text-brand-yellow" />
                            Seller Dashboard
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-text-light dark:text-text-dark rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          My Profile
                        </Link>
                      </div>
                      <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-brand-red rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 bg-text-light dark:bg-white text-white dark:text-text-light px-5 py-2.5 rounded-full font-medium hover:scale-105 active:scale-95 transition-transform shadow-md hover:shadow-lg"
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu & Search */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-text-light dark:text-text-dark focus:ring-2 focus:ring-brand-yellow"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl gap-2 active:scale-95 transition-transform">
                  <LayoutDashboard className="h-6 w-6 text-brand-yellow" />
                  <span className="text-sm font-medium text-text-light dark:text-text-dark">Categories</span>
                </Link>
                {isSeller && (
                  <Link to="/seller" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl gap-2 active:scale-95 transition-transform">
                    <LayoutDashboard className="h-6 w-6 text-brand-yellow" />
                    <span className="text-sm font-medium text-text-light dark:text-text-dark">Seller</span>
                  </Link>
                )}
                {!user && (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl gap-2 active:scale-95 transition-transform">
                    <User className="h-6 w-6 text-brand-yellow" />
                    <span className="text-sm font-medium text-text-light dark:text-text-dark">Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
