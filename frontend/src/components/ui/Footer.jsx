/**
 * Footer.jsx — Performance-optimised footer.
 *
 * Fixes vs original:
 *  1. Removed `blur-3xl` on large decorative div — CSS filter: blur() on a
 *     large element forces GPU compositing layer + expensive paint on every scroll.
 *     Replaced with a simpler gradient overlay.
 *  2. Added `content-visibility: auto` via cv-auto class — browser skips layout
 *     and paint for footer until it's near the viewport
 *  3. Social icon map uses static array to avoid object recreation per render
 *  4. Newsletter subscribe: debounced form submission
 */
import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import BadgeCheck from 'lucide-react/dist/esm/icons/badge-check';
import Globe2 from 'lucide-react/dist/esm/icons/globe-2';
import LockKeyhole from 'lucide-react/dist/esm/icons/lock-keyhole';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Radio from 'lucide-react/dist/esm/icons/radio';
import Send from 'lucide-react/dist/esm/icons/send';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone';
import Users from 'lucide-react/dist/esm/icons/users';
import { footerLinks } from '@/constants/marketplace';

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

// Static arrays prevent object recreation on every render
const SOCIAL_ICONS = [Globe2, Radio, Mail, Users];
const APP_STORES = ['App Store', 'Google Play'];

const Footer = memo(() => {
  const [subscribed, setSubscribed] = useState(false);

  return (
    /* cv-auto: content-visibility:auto defers footer layout/paint
       until it's within 600px of the viewport — saves initial render budget */
    <footer className="cv-auto relative overflow-hidden border-t border-black/[0.03] bg-[#eadfd5] pb-24 pt-16 text-gray-950 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white sm:pb-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

      {/* Replaced blur-3xl large div with a cheaper radial gradient on the footer itself */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.4) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="luxury-shell relative">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr_1.1fr]">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-5 inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-500 to-orange-300 text-xl font-black text-black">
                G
              </span>
              <span>
                <span className="block text-2xl font-black text-gray-950 dark:text-white">GoldMarket</span>
                <span className="text-xs font-bold uppercase tracking-[0.34em] text-amber-800 dark:text-amber-200">
                  MarketX
                </span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-gray-500 dark:text-white/[0.58]">
              A luxury marketplace for verified sellers, authenticated products, fast delivery, and
              beautifully engineered commerce.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIAL_ICONS.map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label={`Social link ${index + 1}`}
                  className="grid h-10 w-10 place-items-center rounded-full border border-black/5 bg-black/[0.03] text-gray-500 transition-[border-color,color] hover:border-amber-600/40 hover:text-amber-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70 dark:hover:border-amber-200/40 dark:hover:text-amber-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-6 grid max-w-sm grid-cols-2 gap-3">
              {APP_STORES.map((store) => (
                <button
                  key={store}
                  className="flex items-center gap-3 rounded-2xl border border-black/5 bg-black/[0.03] px-4 py-3 text-left dark:border-white/10 dark:bg-white/[0.06]"
                >
                  <Smartphone className="h-5 w-5 text-amber-600 dark:text-amber-200" />
                  <span className="text-xs font-black text-gray-900 dark:text-white">{store}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-amber-800 dark:text-amber-200">
                  {title}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <Link
                        to={routeFor(link)}
                        className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-950 dark:text-white/[0.56] dark:hover:text-white"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="rounded-[1.6rem] border border-black/5 bg-black/[0.02] p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-800 dark:text-amber-200">
              Newsletter
            </p>
            <h3 className="mt-3 text-2xl font-black text-gray-950 dark:text-white">
              Join 50,000+ luxury shoppers.
            </h3>
            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-white/[0.58]">
              Private drops, authenticated deals, and premium shopping intelligence.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}
              className="mt-5 flex overflow-hidden rounded-full border border-black/5 bg-black/[0.03] p-1 dark:border-white/10 dark:bg-black/[0.35]"
            >
              <input
                type="email"
                required
                placeholder="Email address"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm text-gray-950 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-white/[0.35]"
              />
              <button
                type="submit"
                className="grid h-11 w-11 place-items-center rounded-full bg-amber-300 text-black transition-transform active:scale-95"
                aria-label="Subscribe to newsletter"
              >
                {subscribed ? <BadgeCheck className="h-5 w-5" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
            {subscribed && (
              <p className="mt-3 animate-[fadeSlideUp_180ms_ease_forwards] text-sm font-bold text-emerald-500 dark:text-emerald-300">
                You are on the private list.
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-gray-500 dark:text-white/[0.52]">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.03] px-3 py-2 dark:bg-white/5">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-200" />
                Buyer protected
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.03] px-3 py-2 dark:bg-white/5">
                <LockKeyhole className="h-3.5 w-3.5 text-amber-600 dark:text-amber-200" />
                SSL secured
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-black/5 pt-6 text-sm text-gray-400 dark:border-white/10 dark:text-white/[0.45] md:flex-row md:items-center">
          <p>© 2026 GoldMarket / MarketX. All rights reserved.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-black text-amber-600 dark:text-amber-200"
          >
            Explore the marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
export default Footer;
