import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
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
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import DarkModeToggle from './DarkModeToggle';

const navItems = [
  { label: 'Collections', to: '/products' },
  { label: 'About', to: '/about' },
  { label: 'Shipping', to: '/shipping-info' },
  { label: 'Returns', to: '/returns' },
  { label: 'Contact', to: '/contact' },
];

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, logout, isSeller } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  return (
    <>
      <motion.header
        initial={{ y: -90 }}
        animate={{ y: 0 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'border-b border-white/10 bg-black/72 shadow-2xl shadow-black/30 backdrop-blur-2xl' : 'bg-gradient-to-b from-black/70 to-transparent'
        }`}
      >
        <div className="luxury-shell">
          <div className="flex h-20 items-center justify-between gap-4">
            <Link to="/" className="group flex items-center gap-3" aria-label="GoldMarket home">
              <motion.div whileHover={{ rotate: 12, scale: 1.05 }} className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-500 to-orange-300 text-lg font-black text-black shadow-[0_0_40px_rgba(245,197,82,0.35)]">
                G
              </motion.div>
              <div className="leading-none">
                <p className="text-xl font-black tracking-tight text-white">GoldMarket</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-amber-200/80">MarketX</p>
              </div>
            </Link>

            <nav className="hidden items-center rounded-full border border-white/10 bg-white/[0.055] px-2 py-2 backdrop-blur-xl lg:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-bold transition ${isActive ? 'bg-white text-black' : 'text-white/72 hover:bg-white/10 hover:text-white'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <form onSubmit={submitSearch} className="hidden min-w-[260px] flex-1 max-w-md items-center rounded-full border border-white/10 bg-white/[0.07] px-4 py-2.5 backdrop-blur-xl md:flex">
              <Search className="h-4 w-4 text-amber-200" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search luxury drops..."
                className="w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/42"
              />
              <PackageSearch className="h-4 w-4 text-white/35" />
            </form>

            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <button className="hidden rounded-full border border-white/10 bg-white/[0.06] p-2.5 text-white/75 transition hover:text-amber-200 sm:block" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <Link to="/wishlist" className="hidden rounded-full border border-white/10 bg-white/[0.06] p-2.5 text-white/75 transition hover:text-amber-200 sm:block" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Link>
              <Link to="/cart" className="relative rounded-full border border-white/10 bg-white/[0.06] p-2.5 text-white/80 transition hover:text-amber-200" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-amber-300 px-1 text-[10px] font-black text-black">
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </Link>

              {user ? (
                <div className="relative hidden sm:block">
                  <button onClick={() => setUserOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pl-2 pr-3 text-white transition hover:bg-white/10">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-yellow-600 text-sm font-black text-black">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-24 truncate text-sm font-bold">{user.name?.split(' ')[0] || 'Account'}</span>
                  </button>
                  <AnimatePresence>
                    {userOpen && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.96 }} className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0c]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
                        <div className="border-b border-white/10 p-4">
                          <p className="truncate font-black text-white">{user.name || 'GoldMarket member'}</p>
                          <p className="truncate text-sm text-white/50">{user.email}</p>
                        </div>
                        <div className="p-2">
                          {isSeller && <Link to="/seller" onClick={() => setUserOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold text-white/80 hover:bg-white/10"><LayoutDashboard className="h-4 w-4 text-amber-200" /> Seller Dashboard</Link>}
                          <Link to="/profile" onClick={() => setUserOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold text-white/80 hover:bg-white/10"><User className="h-4 w-4" /> Profile</Link>
                          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-bold text-red-300 hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Sign out</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden rounded-full bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-amber-100 sm:inline-flex">Sign in</Link>
              )}

              <button onClick={() => setMenuOpen(true)} className="rounded-full border border-white/10 bg-white/[0.06] p-2.5 text-white md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden">
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }} className="ml-auto flex h-full w-[88%] max-w-sm flex-col border-l border-white/10 bg-[#070707] p-5">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-lg font-black text-white">MarketX Menu</span>
                <button onClick={() => setMenuOpen(false)} className="rounded-full bg-white/10 p-2 text-white"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={submitSearch} className="mb-5 flex items-center rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
                <Search className="h-4 w-4 text-amber-200" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search marketplace" className="w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40" />
              </form>
              <div className="space-y-2">
                {navItems.map((item) => <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="block rounded-2xl px-4 py-3 font-bold text-white/78 hover:bg-white/10">{item.label}</Link>)}
                {!user && <Link to="/login" onClick={() => setMenuOpen(false)} className="block rounded-2xl bg-amber-300 px-4 py-3 font-black text-black">Sign in</Link>}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-[1.4rem] border border-white/10 bg-black/75 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:hidden">
        {[
          { to: '/', icon: Home, label: 'Home' },
          { to: '/products', icon: Sparkles, label: 'Shop' },
          { to: '/wishlist', icon: Heart, label: 'Saved' },
          { to: '/cart', icon: ShoppingBag, label: 'Cart' },
        ].map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-white/70 active:bg-white/10">
            <Icon className="h-5 w-5 text-amber-200" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
