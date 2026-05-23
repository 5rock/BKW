import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Globe2, LockKeyhole, Mail, Radio, Send, ShieldCheck, Smartphone, Users } from 'lucide-react';
import { footerLinks } from '../constants/marketplace';

const routeFor = (label) => {
  const routes = {
    'About Us': '/about',
    'Shipping Info': '/shipping-info',
    'Returns & Refunds': '/returns',
    'Contact Us': '/contact',
    'Live Support': '/contact',
    FAQs: '/contact',
  };
  return routes[label] || '/products';
};

const Footer = () => {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="relative overflow-hidden border-t border-black/[0.03] bg-[#eadfd5] pb-24 pt-16 text-gray-950 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white sm:pb-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
      <div className="absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />

      <div className="luxury-shell relative">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr_1.1fr]">
          <div>
            <Link to="/" className="mb-5 inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-500 to-orange-300 text-xl font-black text-black">G</span>
              <span>
                <span className="block text-2xl font-black text-gray-950 dark:text-white">GoldMarket</span>
                <span className="text-xs font-bold uppercase tracking-[0.34em] text-amber-800 dark:text-amber-200">MarketX</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-gray-500 dark:text-white/[0.58]">
              A luxury marketplace for verified sellers, authenticated products, fast delivery, and beautifully engineered commerce.
            </p>
            <div className="mt-6 flex gap-3">
              {[Globe2, Radio, Mail, Users].map((Icon, index) => (
                <a key={index} href="#" className="grid h-10 w-10 place-items-center rounded-full border border-black/5 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.06] text-gray-500 dark:text-white/70 transition hover:border-amber-600/40 dark:hover:border-amber-200/40 hover:text-amber-600 dark:hover:text-amber-200">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-6 grid max-w-sm grid-cols-2 gap-3">
              {['App Store', 'Google Play'].map((store) => (
                <button key={store} className="flex items-center gap-3 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.06] px-4 py-3 text-left">
                  <Smartphone className="h-5 w-5 text-amber-600 dark:text-amber-200" />
                  <span className="text-xs font-black text-gray-900 dark:text-white">{store}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-amber-800 dark:text-amber-200">{title}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <Link to={routeFor(link)} className="text-sm font-semibold text-gray-500 dark:text-white/[0.56] transition hover:text-gray-950 dark:hover:text-white">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-[1.6rem] border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.06] p-5 backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-800 dark:text-amber-200">Newsletter</p>
            <h3 className="mt-3 text-2xl font-black text-gray-950 dark:text-white">Join 50,000+ luxury shoppers.</h3>
            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-white/[0.58]">Private drops, authenticated deals, and premium shopping intelligence.</p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSubscribed(true);
              }}
              className="mt-5 flex overflow-hidden rounded-full border border-black/5 dark:border-white/10 bg-black/[0.03] dark:bg-black/[0.35] p-1"
            >
              <input type="email" required placeholder="Email address" className="min-w-0 flex-1 bg-transparent px-4 text-sm text-gray-950 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/[0.35]" />
              <button className="grid h-11 w-11 place-items-center rounded-full bg-amber-300 text-black transition-transform active:scale-95" aria-label="Subscribe">
                {subscribed ? <BadgeCheck className="h-5 w-5" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
            {subscribed && <p className="mt-3 animate-[fadeSlideUp_180ms_ease_forwards] text-sm font-bold text-emerald-300">You are on the private list.</p>}
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-gray-500 dark:text-white/[0.52]">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.03] dark:bg-white/5 px-3 py-2"><ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-200" /> Buyer protected</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.03] dark:bg-white/5 px-3 py-2"><LockKeyhole className="h-3.5 w-3.5 text-amber-600 dark:text-amber-200" /> SSL secured</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-black/5 dark:border-white/10 pt-6 text-sm text-gray-400 dark:text-white/[0.45] md:flex-row md:items-center">
          <p>© 2026 GoldMarket / MarketX. All rights reserved.</p>
          <Link to="/products" className="inline-flex items-center gap-2 font-black text-amber-600 dark:text-amber-200">
            Explore the marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
