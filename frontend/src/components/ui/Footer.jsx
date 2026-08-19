import { memo } from 'react';
import { Link } from 'react-router-dom';
import { footerLinks } from '@/constants/marketplace';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Camera from 'lucide-react/dist/esm/icons/camera';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Globe from 'lucide-react/dist/esm/icons/globe';

const routeFor = (label) => {
  switch (label) {
    case 'About Us': return '/about';
    case 'Shipping Info': return '/shipping-info';
    case 'Returns & Refunds': return '/returns';
    case 'Contact Us':
    case 'Live Support':
    case 'FAQs': return '/contact';
    default: return '/products';
  }
};

const SOCIAL_ICONS = [
  { icon: Camera, href: '#' },
  { icon: Globe, href: '#' },
  { icon: MessageCircle, href: '#' },
];

const Footer = memo(() => {
  return (
    <footer className="bg-bg-primary pt-24 pb-12 sm:pb-24 border-t border-surface-border">
      <div className="luxury-shell">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-start">
            <Link to="/" className="text-display text-3xl font-bold tracking-widest text-text-primary uppercase mb-6">
              GoldMarket
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs mb-8">
              A curated digital showroom for verified luxury jewelry, timepieces, and bullion. Designed for the modern collector.
            </p>
            <div className="flex gap-4">
              {SOCIAL_ICONS.map((Social, index) => {
                const Icon = Social.icon;
                return (
                  <a
                    key={index}
                    href={Social.href}
                    className="w-10 h-10 rounded-full border border-surface-border flex items-center justify-center text-text-secondary hover:text-color-gold hover:border-color-gold transition-colors duration-300"
                  >
                    <Icon size={16} strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="font-sans font-medium uppercase tracking-[0.2em] text-xs text-text-primary mb-6">
                  {title}
                </h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link}>
                      <Link
                        to={routeFor(link)}
                        className="text-sm text-text-secondary hover:text-color-gold transition-colors duration-300"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Column */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-sans font-medium uppercase tracking-[0.2em] text-xs text-text-primary mb-6">
              The List
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Join our private list for early access to exceptional pieces and editorial features.
            </p>
            <form className="relative" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-transparent border-b border-surface-border py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-color-gold transition-colors duration-300 pr-10"
              />
              <button 
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-text-secondary hover:text-color-gold transition-colors duration-300"
              >
                <ArrowRight size={16} strokeWidth={1.5} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-8 border-t border-surface-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted uppercase tracking-widest font-sans">
          <p>&copy; {new Date().getFullYear()} GoldMarket. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
export default Footer;
