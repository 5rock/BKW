import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Check,
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

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const clearAll = useNotificationStore((s) => s.clearAll);

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
  const forceDarkHeroMode = !scrolled && isHomePage;

  return (
    <>
      <motion.header
        initial={{ y: -90 }}
        animate={{ y: 0 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          forceDarkHeroMode
            ? 'bg-gradient-to-b from-black/40 dark:from-black/80 to-transparent'
            : 'bg-[#f4ece4]/85 dark:bg-[#050505]/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-3xl'
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
                <p className={`text-xl font-black tracking-tight transition-colors duration-300 ${forceDarkHeroMode ? 'text-white' : 'text-gray-950 dark:text-white'}`}>GoldMarket</p>
                <p className={`text-[10px] font-bold uppercase tracking-[0.34em] transition-colors duration-300 ${forceDarkHeroMode ? 'text-amber-300/90' : 'text-amber-600 dark:text-amber-200/80'}`}>MarketX</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className={`hidden items-center rounded-full border px-2 py-2 backdrop-blur-xl lg:flex transition-colors duration-300 ${forceDarkHeroMode ? 'border-white/10 bg-white/[0.055]' : 'border-black/[0.12] dark:border-white/10 bg-black/[0.06] dark:bg-white/[0.055]'}`}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-bold transition ${forceDarkHeroMode
                      ? isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/72 hover:bg-white/10 hover:text-white'
                      : isActive 
                        ? 'bg-amber-600 text-white dark:bg-white dark:text-black shadow-lg shadow-amber-600/10' 
                        : 'text-gray-800 dark:text-white/72 hover:bg-black/[0.05] dark:hover:bg-white/10 hover:text-amber-700 dark:hover:text-white'
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
              className={`hidden min-w-[260px] flex-1 max-w-md items-center rounded-full border px-4 py-2.5 backdrop-blur-xl md:flex transition-colors duration-300 ${forceDarkHeroMode ? 'border-white/10 bg-white/[0.07]' : 'border-black/[0.12] dark:border-white/10 bg-black/[0.05] dark:bg-white/[0.07]'}`}
            >
              <Search className={`h-4 w-4 transition-colors duration-300 ${forceDarkHeroMode ? 'text-amber-300' : 'text-amber-700 dark:text-amber-200'}`} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search luxury drops..."
                className={`w-full bg-transparent px-3 text-sm outline-none transition-colors duration-300 ${forceDarkHeroMode ? 'text-white placeholder:text-white/42' : 'text-gray-950 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/42'}`}
              />
              <PackageSearch className={`h-4 w-4 transition-colors duration-300 ${forceDarkHeroMode ? 'text-white/35' : 'text-gray-500 dark:text-white/35'}`} />
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <DarkModeToggle />

              {/* Notification Bell */}
              <div className="relative hidden sm:block" data-dropdown>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifOpen((v) => !v);
                    setUserOpen(false);
                  }}
                  className={`relative rounded-full border p-2.5 transition-colors duration-300 ${forceDarkHeroMode ? 'border-white/10 bg-white/[0.06] text-white/75 hover:bg-white/10 hover:text-amber-200' : 'border-black/[0.12] dark:border-white/10 bg-black/[0.05] dark:bg-white/[0.06] text-gray-800 dark:text-white/75 hover:bg-black/[0.08] dark:hover:bg-white/10 hover:text-amber-700 dark:hover:text-amber-200'}`}
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
                      className="absolute right-0 mt-3 w-80 overflow-hidden rounded-[2rem] border border-black/5 dark:border-white/10 bg-[#f4ece4] dark:bg-[#0b0b0c]/95 shadow-2xl shadow-black/20 dark:shadow-black/50 backdrop-blur-2xl"
                      data-dropdown
                    >
                      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 p-5">
                        <div>
                          <p className="font-black text-gray-950 dark:text-white">Notifications</p>
                          {unreadCount > 0 && (
                            <p className="text-xs font-bold text-gray-400 dark:text-white/40">{unreadCount} unread</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="rounded-xl p-2 text-gray-500 transition hover:bg-black/5 hover:text-amber-700 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-amber-200"
                              title="Mark all as read"
                            >
                              <CheckCheck className="h-4 w-4" />
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button
                              onClick={clearAll}
                              className="rounded-xl p-2 text-gray-500 transition hover:bg-black/5 hover:text-red-500 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-red-300"
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
                            <Bell className="mx-auto h-8 w-8 text-gray-300 dark:text-white/20" />
                            <p className="mt-3 text-sm text-gray-400 dark:text-white/40">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.slice(0, 20).map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => markAsRead(notif.id)}
                              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-black/[0.03] dark:hover:bg-white/5 ${
                                !notif.read ? 'bg-amber-600/[0.02] dark:bg-amber-200/[0.03]' : ''
                              }`}
                            >
                              <span className="mt-0.5 text-lg">{NOTIF_ICONS[notif.type] || '💎'}</span>
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-bold ${notif.read ? 'text-gray-400 dark:text-white/60' : 'text-gray-950 dark:text-white'}`}>
                                  {notif.title}
                                </p>
                                {notif.message && (
                                  <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-white/40">{notif.message}</p>
                                )}
                                <p className="mt-1 text-[11px] font-bold text-gray-400 dark:text-white/30">{timeAgo(notif.createdAt)}</p>
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
                className={`hidden rounded-full border p-2.5 transition-colors duration-300 sm:block ${forceDarkHeroMode ? 'border-white/10 bg-white/[0.06] text-white/75 hover:bg-white/10 hover:text-amber-200' : 'border-black/[0.12] dark:border-white/10 bg-black/[0.05] dark:bg-white/[0.06] text-gray-800 dark:text-white/75 hover:bg-black/[0.08] dark:hover:bg-white/10 hover:text-amber-700 dark:hover:text-amber-200'}`}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className={`relative rounded-full border p-2.5 transition-colors duration-300 ${forceDarkHeroMode ? 'border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/10 hover:text-amber-200' : 'border-black/[0.12] dark:border-white/10 bg-black/[0.05] dark:bg-white/[0.06] text-gray-800 dark:text-white/80 hover:bg-black/[0.08] dark:hover:bg-white/10 hover:text-amber-700 dark:hover:text-amber-200'}`}
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
                    className={`flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-3 transition-colors duration-300 ${forceDarkHeroMode ? 'border-white/10 bg-white/[0.06] text-white hover:bg-white/10' : 'border-black/[0.12] dark:border-white/10 bg-black/[0.05] dark:bg-white/[0.06] text-gray-950 dark:text-white hover:bg-black/[0.08] dark:hover:bg-white/10'}`}
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
                        className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-[#f4ece4] dark:bg-[#0b0b0c]/95 shadow-2xl shadow-black/20 dark:shadow-black/50 backdrop-blur-2xl"
                        data-dropdown
                      >
                        <div className="border-b border-black/5 dark:border-white/10 p-5">
                          <p className="truncate font-black text-gray-950 dark:text-white">{user.name || 'GoldMarket member'}</p>
                          <p className="truncate text-sm font-bold text-gray-400 dark:text-white/50">{user.email}</p>
                        </div>
                        <div className="p-3">
                          {isSeller && (
                            <Link
                              to="/seller"
                              onClick={() => setUserOpen(false)}
                              className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-white/80 hover:bg-black/[0.03] dark:hover:bg-white/10 hover:text-amber-600 dark:hover:text-amber-200"
                            >
                              <LayoutDashboard className="h-4 w-4 text-amber-600 dark:text-amber-200" /> Seller Dashboard
                            </Link>
                          )}
                          <Link
                            to="/profile"
                            onClick={() => setUserOpen(false)}
                            className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-white/80 hover:bg-black/[0.03] dark:hover:bg-white/10 hover:text-amber-600 dark:hover:text-amber-200"
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
                  className={`hidden rounded-full px-5 py-2.5 text-sm font-black transition hover:scale-105 active:scale-95 sm:inline-flex ${forceDarkHeroMode ? 'bg-white text-black hover:bg-amber-100' : 'bg-amber-600 dark:bg-white text-white dark:text-black'}`}
                >
                  Sign in
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(true)}
                className={`rounded-full border p-2.5 md:hidden transition-colors duration-300 ${forceDarkHeroMode ? 'border-white/10 bg-white/[0.06] text-white' : 'border-black/[0.12] dark:border-white/10 bg-black/[0.05] dark:bg-white/[0.06] text-gray-800 dark:text-white'}`}
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
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden"
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 260 }}
              className="ml-auto flex h-full w-[88%] max-w-sm flex-col border-l border-black/5 dark:border-white/10 bg-[#f4ece4] dark:bg-[#070707] p-6 shadow-2xl shadow-black/40"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-lg font-black text-gray-950 dark:text-white">MarketX Menu</span>
                <button onClick={() => setMenuOpen(false)} className="rounded-full bg-black/5 dark:bg-white/10 p-2.5 text-gray-600 dark:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form
                onSubmit={submitSearch}
                className="mb-6 flex items-center rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.07] px-4 py-3.5"
              >
                <Search className="h-4 w-4 text-amber-600 dark:text-amber-200" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search marketplace"
                  className="w-full bg-transparent px-3 text-sm text-gray-950 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/40"
                />
              </form>
              <div className="space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-2xl px-5 py-3.5 font-bold text-gray-600 dark:text-white/78 hover:bg-black/[0.03] dark:hover:bg-white/10 hover:text-amber-600 dark:hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                ))}
                {!user && (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="mt-6 block rounded-full bg-amber-600 dark:bg-amber-300 px-5 py-4 text-center font-black text-white dark:text-black shadow-lg shadow-amber-600/10"
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
      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-[2rem] border border-black/5 dark:border-white/10 bg-[#f4ece4]/90 dark:bg-black/75 p-2 shadow-2xl shadow-black/20 dark:shadow-black/50 backdrop-blur-2xl sm:hidden">
        {[
          { to: '/', icon: Home, label: 'Home' },
          { to: '/products', icon: Sparkles, label: 'Shop' },
          { to: '/wishlist', icon: Heart, label: 'Saved' },
          { to: '/cart', icon: ShoppingBag, label: 'Cart' },
        ].map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-black text-gray-500 dark:text-white/70 active:bg-black/5 dark:active:bg-white/10"
          >
            <Icon className="h-5 w-5 text-amber-600 dark:text-amber-200" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
