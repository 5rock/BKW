import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Globe2 from 'lucide-react/dist/esm/icons/globe-2';
import PackageCheck from 'lucide-react/dist/esm/icons/package-check';
import Plane from 'lucide-react/dist/esm/icons/plane';
import Search from 'lucide-react/dist/esm/icons/search';
import Truck from 'lucide-react/dist/esm/icons/truck';
import Reveal from '@/components/ui/Reveal';
import PageHero from '@/components/ui/PageHero';
import { deliveryTimeline } from '@/constants/marketplace';

const cards = [
  [Truck, 'Standard Delivery', '3-5 business days with tracked handoff and verified seller dispatch.'],
  [Plane, 'Express Delivery', '24-48 hour priority delivery on eligible premium products.'],
  [Globe2, 'International Shipping', 'Insured worldwide shipping with customs visibility and country checks.'],
  [Search, 'Order Tracking', 'Real-time tracking events from verification through delivery.'],
];

const ShippingInfo = () => (
  <div className="theme-page min-h-screen">
    <PageHero eyebrow="Shipping Info" title="Premium delivery with visibility at every step." copy="From seller confirmation to final handoff, MarketX keeps shipping clear, insured, and beautifully trackable." image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2200&q=85" />
    <section className="luxury-shell grid gap-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([Icon, title, copy], index) => (
        <Reveal key={title} delay={index * 0.05} className="theme-card rounded-[1.5rem] p-6">
          <Icon className="h-7 w-7 text-amber-800 dark:text-amber-300" />
          <h2 className="mt-5 text-xl font-black">{title}</h2>
          <p className="theme-muted mt-3 text-sm leading-7">{copy}</p>
        </Reveal>
      ))}
    </section>
    <section className="luxury-shell grid gap-8 pb-16 lg:grid-cols-[0.9fr_1.1fr]">
      <Reveal className="theme-card rounded-[2rem] p-7">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-[#7a4f28] dark:text-amber-300/95">Delivery timeline</p>
        <div className="mt-8 space-y-5">
          {deliveryTimeline.map((step, index) => <div key={step} className="flex items-center gap-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-amber-500 text-sm font-black text-white shadow-sm dark:bg-amber-300 dark:text-black dark:shadow-none">{index + 1}</span><p className="font-bold text-[#3d3835]/90 dark:theme-muted">{step}</p></div>)}
        </div>
      </Reveal>
      <Reveal className="relative overflow-hidden rounded-[2rem] border border-black/[0.07] p-7 dark:border-white/10">
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#fffdfb] via-[#f7efe4] to-[#ebe0d4] dark:hidden" aria-hidden />
        <div className="pointer-events-none absolute inset-0 z-0 hidden bg-[radial-gradient(circle_at_top_right,rgba(245,197,82,0.18),transparent_20rem),rgba(255,255,255,0.06)] dark:block" aria-hidden />
        <div className="relative z-10">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#7a4f28] dark:text-amber-300/95">Country availability</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {['United States', 'India', 'United Kingdom', 'UAE', 'Singapore', 'France', 'Japan', 'Australia'].map((country) => <div key={country} className="theme-card flex items-center gap-3 rounded-2xl p-4 text-sm font-black"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> {country}</div>)}
          </div>
          <div className="mt-6 rounded-2xl border border-amber-800/12 bg-amber-600/[0.07] p-5 dark:border-amber-200/20 dark:bg-amber-200/10">
            <PackageCheck className="h-6 w-6 text-amber-800 dark:text-amber-200" />
            <p className="theme-text mt-3 font-black leading-relaxed">Shipping charges are calculated by seller location, product value, delivery speed, and insurance tier.</p>
          </div>
        </div>
      </Reveal>
    </section>
  </div>
);

export default ShippingInfo;
