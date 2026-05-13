import { CheckCircle2, Globe2, PackageCheck, Plane, Search, Truck } from 'lucide-react';
import Reveal from '../components/animations/Reveal';
import PageHero from '../components/ui/PageHero';
import { deliveryTimeline } from '../constants/marketplace';

const cards = [
  [Truck, 'Standard Delivery', '3-5 business days with tracked handoff and verified seller dispatch.'],
  [Plane, 'Express Delivery', '24-48 hour priority delivery on eligible premium products.'],
  [Globe2, 'International Shipping', 'Insured worldwide shipping with customs visibility and country checks.'],
  [Search, 'Order Tracking', 'Real-time tracking events from verification through delivery.'],
];

const ShippingInfo = () => (
  <div className="min-h-screen bg-[#050505] text-white">
    <PageHero eyebrow="Shipping Info" title="Premium delivery with visibility at every step." copy="From seller confirmation to final handoff, MarketX keeps shipping clear, insured, and beautifully trackable." image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2200&q=85" />
    <section className="luxury-shell grid gap-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([Icon, title, copy], index) => (
        <Reveal key={title} delay={index * 0.05} className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
          <Icon className="h-7 w-7 text-amber-200" />
          <h2 className="mt-5 text-xl font-black">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-white/52">{copy}</p>
        </Reveal>
      ))}
    </section>
    <section className="luxury-shell grid gap-8 pb-16 lg:grid-cols-[0.9fr_1.1fr]">
      <Reveal className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">Delivery timeline</p>
        <div className="mt-8 space-y-5">
          {deliveryTimeline.map((step, index) => <div key={step} className="flex items-center gap-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-amber-300 text-sm font-black text-black">{index + 1}</span><p className="font-bold text-white/74">{step}</p></div>)}
        </div>
      </Reveal>
      <Reveal className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(245,197,82,0.18),transparent_20rem),rgba(255,255,255,0.06)] p-7">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">Country availability</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {['United States', 'India', 'United Kingdom', 'UAE', 'Singapore', 'France', 'Japan', 'Australia'].map((country) => <div key={country} className="flex items-center gap-3 rounded-2xl bg-black/25 p-4 text-sm font-black text-white/75"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> {country}</div>)}
        </div>
        <div className="mt-6 rounded-2xl border border-amber-200/20 bg-amber-200/10 p-5">
          <PackageCheck className="h-6 w-6 text-amber-200" />
          <p className="mt-3 font-black">Shipping charges are calculated by seller location, product value, delivery speed, and insurance tier.</p>
        </div>
      </Reveal>
    </section>
  </div>
);

export default ShippingInfo;
