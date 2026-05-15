import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotificationStore } from '../store/notificationStore';
import DarkModeToggle from './DarkModeToggle';

const navItems = [
  { label: 'Collections', to: '/products' },
  { label: 'About', to: '/about' },
  { label: 'Shipping', to: '/shipping-info' },
  { label: 'Returns', to: '/returns' },
  { label: 'Contact', to: '/contact' },
];

const timeAgo = (ts) => {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

const NOTIF_ICONS = {
  cart: '🛒',
  wishlist: '❤️',
  flash_sale: '⚡',
  success: '✅',
  error: '❌',
  info: '💎',
};

const getInitialDarkMode = () => {
  const saved = localStorage.getItem('goldmarket_theme');
  if (saved) return saved === 'dark';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, logout, isSeller } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cartBounce, setCartBounce] = useState(false);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const clearAll = useNotificationStore((s) => s.clearAll);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('theme-transition');
    html.classList.toggle('dark', darkMode);
    html.classList.toggle('light', !darkMode);
    html.style.colorScheme = darkMode ? 'dark' : 'light';
    localStorage.setItem('goldmarket_theme', darkMode ? 'dark' : 'light');
    const timeout = setTimeout(() => html.classList.remove('theme-transition'), 360);
    return () => clearTimeout(timeout);
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Bounce cart badge when count changes
  useEffect(() => {
    if (cartCount > 0) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 600);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  const submitSearch = (event) => {
    event.preventDefault();
    const value = search.trim();
    if (value) navigate(`/products?search=${encodeURIComponent(value)}`);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserOpen(false);
    navigate('/');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    if (!notifOpen && !userOpen) return;
    const handler = (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        setNotifOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [notifOpen, userOpen]);

  const isHomePage = pathname === '/';
  const elevated = scrolled || !isHomePage;
  const navbarTheme = darkMode
    ? 'border-white/10 bg-[#0a0a0a]/90 text-white shadow-[0_18px_55px_rgba(0,0,0,0.32)]'
    : 'border-black/10 bg-[#f5efe7]/90 text-black shadow-[0_18px_55px_rgba(78,56,36,0.08)]';
  const pillSurface = darkMode
    ? 'border-white/10 bg-white/[0.07] text-white shadow-black/20 hover:bg-white/10'
    : 'border-black/10 bg-white/60 text-black shadow-black/[0.035] hover:bg-white/90';
  const dropdownSurface = darkMode
    ? 'border-white/10 bg-[#0a0a0a]/95 text-white shadow-black/55'
    : 'border-black/10 bg-[#f5efe7]/95 text-black shadow-black/15';
  const mutedText = darkMode ? 'text-white/62' : 'text-gray-600';
  const softText = darkMode ? 'text-white/42' : 'text-gray-500';
  const iconAccent = darkMode ? 'text-amber-200' : 'text-amber-700';
  const actionButton = `border p-2.5 transition-all duration-300 ${pillSurface} ${
    darkMode ? 'hover:text-amber-200' : 'hover:text-amber-800'
  }`;
  const menuLink = `flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
    darkMode ? 'text-white/80 hover:bg-white/10 hover:text-amber-200' : 'text-gray-600 hover:bg-[#3d2f26]/[0.035] hover:text-amber-700'
  }`;

  return (
    <>
      <motion.header
        initial={{ y: -90 }}
        animate={{ y: 0 }}
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${navbarTheme} ${
          elevated ? 'shadow-lg' : 'shadow-none'
        }`}
      >
        <div className="luxury-shell">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="group flex items-center gap-3" aria-label="GoldMarket home">
              <motion.div
                whileHover={{ rotate: 12, scale: 1.05 }}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-500 to-orange-300 text-lg font-black text-black shadow-[0_0_40px_rgba(245,197,82,0.35)]"
              >
                G
              </motion.div>
              <div className="leading-none">
                <p className="text-xl font-black tracking-tight transition-colors duration-300">GoldMarket</p>
                <p className={`text-[10px] font-bold uppercase tracking-[0.34em] transition-colors duration-300 ${iconAccent}`}>MarketX</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className={`hidden items-center rounded-full border px-2 py-2 shadow-sm backdrop-blur-xl transition-all duration-300 lg:flex ${pillSurface}`}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${isActive
                      ? darkMode
                        ? 'bg-white text-black shadow-lg shadow-white/10'
                        : 'bg-amber-700 text-white shadow-lg shadow-amber-700/15'
                      : darkMode
                        ? 'text-white/72 hover:bg-white/10 hover:text-white'
                        : 'text-gray-700 hover:bg-[#3d2f26]/[0.045] hover:text-amber-800'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Search */}
            <form
              onSubmit={submitSearch}
              className={`hidden min-w-[260px] max-w-md flex-1 items-center rounded-full border px-4 py-2.5 shadow-sm backdrop-blur-xl transition-all duration-300 md:flex ${
                darkMode ? 'border-white/10 bg-[#111111]/85 text-white shadow-black/20' : 'border-black/10 bg-white/75 text-black shadow-black/[0.03]'
              }`}
            >
              <Search className={`h-4 w-4 transition-colors duration-300 ${iconAccent}`} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search luxury drops..."
                className={`w-full bg-transparent px-3 text-sm outline-none transition-colors duration-300 ${darkMode ? 'text-white placeholder:text-white/42' : 'text-black placeholder:text-gray-500'}`}
              />
              <PackageSearch className={`h-4 w-4 transition-colors duration-300 ${softText}`} />
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <DarkModeToggle darkMode={darkMode} onToggle={() => setDarkMode((value) => !value)} />

              {/* Notification Bell */}
              <div className="relative hidden sm:block" data-dropdown>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifOpen((v) => !v);
                    setUserOpen(false);
                  }}
                  className={`relative rounded-full ${actionButton}`}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      className={`absolute right-0 mt-3 w-80 overflow-hidden rounded-[2rem] border shadow-2xl backdrop-blur-2xl transition-all duration-300 ${dropdownSurface}`}
                      data-dropdown
                    >
                      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 p-5">
                        <div>
                          <p className="font-black">Notifications</p>
                          {unreadCount > 0 && (
                            <p className={`text-xs font-bold ${softText}`}>{unreadCount} unread</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className={`rounded-xl p-2 transition-all duration-300 ${softText} ${darkMode ? 'hover:bg-white/10 hover:text-amber-200' : 'hover:bg-[#3d2f26]/[0.04] hover:text-amber-700'}`}
                              title="Mark all as read"
                            >
                              <CheckCheck className="h-4 w-4" />
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button
                              onClick={clearAll}
                              className={`rounded-xl p-2 transition-all duration-300 ${softText} ${darkMode ? 'hover:bg-white/10 hover:text-red-300' : 'hover:bg-[#3d2f26]/[0.04] hover:text-red-500'}`}
                              title="Clear all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className={`mx-auto h-8 w-8 ${softText}`} />
                            <p className={`mt-3 text-sm ${softText}`}>No notifications yet</p>
                          </div>
                        ) : (
                          notifications.slice(0, 20).map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => markAsRead(notif.id)}
                              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-all duration-300 ${
                                darkMode ? 'hover:bg-white/[0.06]' : 'hover:bg-[#3d2f26]/[0.03]'
                              } ${!notif.read ? (darkMode ? 'bg-amber-200/[0.03]' : 'bg-amber-600/[0.025]') : ''
                              }`}
                            >
                              <span className="mt-0.5 text-lg">{NOTIF_ICONS[notif.type] || '💎'}</span>
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-bold ${notif.read ? softText : ''}`}>
                                  {notif.title}
                                </p>
                                {notif.message && (
                                  <p className={`mt-0.5 truncate text-xs ${softText}`}>{notif.message}</p>
                                )}
                                <p className={`mt-1 text-[11px] font-bold ${softText}`}>{timeAgo(notif.createdAt)}</p>
                              </div>
                              {!notif.read && (
                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

               {/* Wishlist */}
              <Link
                to="/wishlist"
                className={`hidden rounded-full sm:block ${actionButton}`}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className={`relative rounded-full ${actionButton}`}
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: cartBounce ? [1, 1.3, 1] : 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-amber-300 px-1 text-[10px] font-black text-black"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative hidden sm:block" data-dropdown>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserOpen((v) => !v);
                      setNotifOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-3 transition-all duration-300 ${pillSurface}`}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-sm font-black text-black">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-24 truncate text-sm font-bold">{user.name?.split(' ')[0] || 'Account'}</span>
                  </button>
                  <AnimatePresence>
                    {userOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        className={`absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl transition-all duration-300 ${dropdownSurface}`}
                        data-dropdown
                      >
                        <div className="border-b border-black/5 dark:border-white/10 p-5">
                          <p className="truncate font-black">{user.name || 'GoldMarket member'}</p>
                          <p className={`truncate text-sm font-bold ${softText}`}>{user.email}</p>
                        </div>
                        <div className="p-3">
                          {isSeller && (
                            <Link
                              to="/seller"
                              onClick={() => setUserOpen(false)}
                              className={menuLink}
                            >
                              <LayoutDashboard className="h-4 w-4 text-amber-600 dark:text-amber-200" /> Seller Dashboard
                            </Link>
                          )}
                          <Link
                            to="/profile"
                            onClick={() => setUserOpen(false)}
                            className={menuLink}
                          >
                            <User className="h-4 w-4" /> Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-bold text-red-500 hover:bg-red-500/5"
                          >
                            <LogOut className="h-4 w-4" /> Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`hidden rounded-full px-5 py-2.5 text-sm font-black shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 sm:inline-flex ${
                    darkMode ? 'bg-white text-black shadow-white/10 hover:bg-amber-100' : 'bg-amber-700 text-white shadow-amber-700/15 hover:bg-amber-800'
                  }`}
                >
                  Sign in
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(true)}
                className={`rounded-full md:hidden ${actionButton}`}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#0a0a0a]/70 backdrop-blur-sm md:hidden"
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 260 }}
              className={`ml-auto flex h-full w-[88%] max-w-sm flex-col border-l p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 ${dropdownSurface}`}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-lg font-black">MarketX Menu</span>
                <button onClick={() => setMenuOpen(false)} className={`rounded-full p-2.5 ${pillSurface}`}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form
                onSubmit={submitSearch}
                className={`mb-6 flex items-center rounded-2xl border px-4 py-3.5 transition-all duration-300 ${
                  darkMode ? 'border-white/10 bg-[#111111]/85' : 'border-black/10 bg-white/75'
                }`}
              >
                <Search className={`h-4 w-4 ${iconAccent}`} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search marketplace"
                  className={`w-full bg-transparent px-3 text-sm outline-none ${darkMode ? 'text-white placeholder:text-white/40' : 'text-black placeholder:text-gray-500'}`}
                />
              </form>
              <div className="space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`block rounded-2xl px-5 py-3.5 font-bold transition-all duration-300 ${
                      darkMode ? 'text-white/78 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-[#3d2f26]/[0.035] hover:text-amber-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {!user && (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className={`mt-6 block rounded-full px-5 py-4 text-center font-black shadow-lg transition-all duration-300 ${
                      darkMode ? 'bg-white text-black shadow-white/10 hover:bg-amber-100' : 'bg-amber-700 text-white shadow-amber-700/15 hover:bg-amber-800'
                    }`}
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className={`fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-[2rem] border p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:hidden ${dropdownSurface}`}>
        {[
          { to: '/', icon: Home, label: 'Home' },
          { to: '/products', icon: Sparkles, label: 'Shop' },
          { to: '/wishlist', icon: Heart, label: 'Saved' },
          { to: '/cart', icon: ShoppingBag, label: 'Cart' },
        ].map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-black transition-all duration-300 ${
              darkMode ? 'text-white/70 active:bg-white/10' : 'text-gray-600 active:bg-[#3d2f26]/[0.04]'
            }`}
          >
            <Icon className={`h-5 w-5 ${iconAccent}`} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
