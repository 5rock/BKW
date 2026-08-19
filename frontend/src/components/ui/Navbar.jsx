import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, Heart, User, ShoppingBag, Menu, X, Home, Sparkles } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';

const navItems = [
  { label: 'Collections', to: '/category/Collections' },
  { label: 'Jewelry', to: '/category/Jewelry' },
  { label: 'Gold', to: '/category/Gold' },
  { label: 'Watches', to: '/category/Watches' },
  { label: 'About', to: '/about' },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCartStore((s) => s.cartCount);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = pathname === '/';
  const navBg = scrolled || !isHome ? 'bg-surface-primary/95 backdrop-blur-xl border-b border-surface-border' : 'bg-transparent border-b border-transparent';
  
  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${navBg}`}>
        <div className="luxury-shell">
          <div className="flex h-24 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 z-50">
              <span className="text-display text-2xl tracking-widest text-text-primary uppercase font-bold">
                GoldMarket
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center space-x-10 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) => 
                    `text-xs tracking-[0.2em] uppercase font-sans font-medium transition-colors duration-300 relative group
                    ${isActive ? 'text-color-gold' : 'text-text-primary hover:text-color-gold'}`
                  }
                >
                  {item.label}
                  <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-color-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </NavLink>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6">
              <button aria-label="Search" className="text-text-primary hover:text-color-gold transition-colors duration-300">
                <Search size={20} strokeWidth={1.5} />
              </button>
              <Link to="/wishlist" aria-label="Wishlist" className="text-text-primary hover:text-color-gold transition-colors duration-300">
                <Heart size={20} strokeWidth={1.5} />
              </Link>
              <Link to={user ? '/profile' : '/login'} aria-label="Account" className="text-text-primary hover:text-color-gold transition-colors duration-300">
                <User size={20} strokeWidth={1.5} />
              </Link>
              <Link to="/cart" aria-label="Bag" className="text-text-primary hover:text-color-gold transition-colors duration-300 relative">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-color-gold text-bg-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-text-primary z-50"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mobile Fullscreen Menu */}
        <div className={`fixed inset-0 bg-bg-primary z-40 transition-transform duration-500 ease-in-out flex flex-col justify-center px-8 md:hidden ${menuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <nav className="flex flex-col space-y-8 text-center mt-12">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                to={item.to} 
                onClick={() => setMenuOpen(false)}
                className="text-display text-4xl text-text-primary hover:text-color-gold transition-colors duration-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Premium Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-surface-primary/95 backdrop-blur-xl border-t border-surface-border pb-safe">
        <div className="flex items-center justify-around h-16 px-4">
          <Link to="/" className="flex flex-col items-center justify-center w-full h-full text-text-primary hover:text-color-gold transition-colors duration-300">
            <Home size={20} strokeWidth={1.5} />
            <span className="text-[10px] mt-1 uppercase tracking-wider">Home</span>
          </Link>
          <Link to="/search" className="flex flex-col items-center justify-center w-full h-full text-text-primary hover:text-color-gold transition-colors duration-300">
            <Search size={20} strokeWidth={1.5} />
            <span className="text-[10px] mt-1 uppercase tracking-wider">Search</span>
          </Link>
          <Link to="/cart" className="flex flex-col items-center justify-center w-full h-full text-text-primary hover:text-color-gold transition-colors duration-300 relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute top-2 right-1/4 bg-color-gold text-bg-primary text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-[10px] mt-1 uppercase tracking-wider">Bag</span>
          </Link>
          <Link to={user ? '/profile' : '/login'} className="flex flex-col items-center justify-center w-full h-full text-text-primary hover:text-color-gold transition-colors duration-300">
            <User size={20} strokeWidth={1.5} />
            <span className="text-[10px] mt-1 uppercase tracking-wider">Account</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
