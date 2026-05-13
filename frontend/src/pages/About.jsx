import CountUpModule from 'react-countup';
import { motion } from 'framer-motion';
import { BadgeCheck, Compass, Crown, Gem, ShieldCheck, Sparkles } from 'lucide-react';
import Reveal from '../components/animations/Reveal';
import PageHero from '../components/ui/PageHero';
import { aboutStats, globalPresence } from '../constants/marketplace';

const CountUp = CountUpModule.default || CountUpModule;

const milestones = ['Founded as a verified luxury commerce studio', 'Launched seller authentication and buyer protection', 'Expanded global fulfilment hubs', 'Introduced MarketX premium discovery engine'];

const About = () => (
  <div className="min-h-screen bg-[#050505] text-white">
    <PageHero eyebrow="About GoldMarket" title="A luxury marketplace built on trust, taste, and speed." copy="GoldMarket / MarketX brings Apple-level polish, Stripe-grade confidence, and premium marketplace operations into one commerce experience." image="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=2200&q=85" />
    <section className="luxury-shell grid gap-8 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
      <Reveal>
        <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">Company Story</p>
        <h2 className="mt-4 text-4xl font-black text-white">Commerce should feel considered, secure, and quietly spectacular.</h2>
        <p className="mt-5 leading-8 text-white/58">We designed MarketX for shoppers who want premium discovery without marketplace chaos. Every interaction is tuned for clarity, every seller signal is visible, and every purchase is wrapped in protection.</p>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          [Crown, 'Mission', 'Make premium shopping feel effortless, transparent, and emotionally resonant.'],
          [Compass, 'Vision', 'Become the trusted operating layer for luxury marketplace commerce.'],
          [ShieldCheck, 'Trust', 'Verification, protection, and post-purchase confidence by default.'],
          [Sparkles, 'Experience', 'A polished UX that makes discovery feel cinematic and focused.'],
        ].map(([Icon, title, copy], index) => (
          <Reveal key={title} delay={index * 0.05} className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
            <Icon className="h-7 w-7 text-amber-200" />
            <h3 className="mt-5 text-xl font-black">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/52">{copy}</p>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="luxury-shell py-8">
      <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 sm:grid-cols-2 lg:grid-cols-4">
        {aboutStats.map((stat) => <div key={stat.label} className="rounded-[1.25rem] bg-black/30 p-5"><p className="text-4xl font-black"><CountUp end={stat.value} enableScrollSpy scrollSpyOnce />{stat.suffix}</p><p className="mt-2 text-sm font-bold text-white/50">{stat.label}</p></div>)}
      </div>
    </section>

    <section className="luxury-shell grid gap-8 py-16 lg:grid-cols-2">
      <Reveal className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">Timeline</p>
        <div className="mt-8 space-y-5">
          {milestones.map((item, index) => <div key={item} className="flex gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-300 text-sm font-black text-black">{index + 1}</span><p className="pt-2 font-bold text-white/74">{item}</p></div>)}
        </div>
      </Reveal>
      <Reveal className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(245,197,82,0.16),transparent_18rem),#090909] p-6">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">Global Presence</p>
        <div className="absolute inset-8 rounded-full border border-white/10 opacity-60" />
        <div className="absolute inset-16 rounded-full border border-white/10 opacity-40" />
        {globalPresence.map((point) => (
          <motion.div key={point.city} className="absolute" style={{ left: point.x, top: point.y }} animate={{ scale: [1, 1.18, 1] }} transition={{ repeat: Infinity, duration: 2.4 }}>
            <span className="block h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_24px_rgba(245,197,82,0.8)]" />
            <span className="mt-1 block whitespace-nowrap text-xs font-black text-white/70">{point.city}</span>
          </motion.div>
        ))}
      </Reveal>
    </section>

    <section className="luxury-shell pb-20">
      <Reveal className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-amber-200/10 to-white/[0.04] p-8 text-center">
        <Gem className="mx-auto h-10 w-10 text-amber-200" />
        <h2 className="mt-4 text-3xl font-black">Why choose us?</h2>
        <p className="mx-auto mt-3 max-w-2xl leading-8 text-white/58">Verified sellers, authenticated product flows, premium support, global delivery, and a UI built to help shoppers decide with confidence.</p>
      </Reveal>
    </section>
  </div>
);

export default About;
