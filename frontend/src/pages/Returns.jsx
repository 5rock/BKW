import { AlertTriangle, BadgeCheck, ChevronDown, RefreshCcw, RotateCcw, ShieldCheck } from 'lucide-react';
import Reveal from '../components/animations/Reveal';
import PageHero from '../components/ui/PageHero';
import { returnSteps } from '../constants/marketplace';

const faqs = ['How long does a refund take?', 'Can I exchange instead of returning?', 'What if an item is damaged?', 'How do I track my refund?'];

const Returns = () => (
  <div className="min-h-screen bg-[#050505] text-white">
    <PageHero eyebrow="Returns & Refunds" title="A guided return flow that feels calm, fast, and fair." copy="MarketX makes eligibility, pickup, inspection, exchange, and refund status transparent from the first tap." image="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=2200&q=85" />
    <section className="luxury-shell grid gap-4 py-16 md:grid-cols-2 lg:grid-cols-4">
      {[
        [RotateCcw, 'Return Eligibility', 'Most eligible products can be returned within the seller policy window.'],
        [RefreshCcw, 'Refund Workflow', 'Refunds begin after pickup, inspection, and approval checkpoints.'],
        [BadgeCheck, 'Exchange Policy', 'Exchange options appear for size, color, or verified replacement inventory.'],
        [AlertTriangle, 'Damaged Items', 'Upload photos and get priority review for damaged or incorrect products.'],
      ].map(([Icon, title, copy], index) => <Reveal key={title} delay={index * 0.05} className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6"><Icon className="h-7 w-7 text-amber-200" /><h2 className="mt-5 text-xl font-black">{title}</h2><p className="mt-3 text-sm leading-7 text-white/52">{copy}</p></Reveal>)}
    </section>
    <section className="luxury-shell grid gap-8 pb-16 lg:grid-cols-[1.05fr_0.95fr]">
      <Reveal className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">Step-by-step return flow</p>
        <div className="mt-8 space-y-5">
          {returnSteps.map((step, index) => <div key={step} className="flex gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-300 text-sm font-black text-black">{index + 1}</span><p className="pt-2 font-bold text-white/75">{step}</p></div>)}
        </div>
      </Reveal>
      <Reveal className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(245,197,82,0.14),transparent_20rem),rgba(255,255,255,0.06)] p-7">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">FAQ accordion</p>
        <div className="mt-6 space-y-3">
          {faqs.map((faq) => <details key={faq} className="group rounded-2xl border border-white/10 bg-black/25 p-4"><summary className="flex cursor-pointer list-none items-center justify-between font-black text-white">{faq}<ChevronDown className="h-4 w-4 text-amber-200 transition group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-7 text-white/52">Our support team and automated workflow show live status, required actions, and expected refund timing inside your account.</p></details>)}
        </div>
        <div className="mt-6 rounded-2xl bg-emerald-400/10 p-5 text-sm leading-7 text-emerald-100"><ShieldCheck className="mb-2 h-5 w-5" /> Buyer protection applies when products differ from verified listing details.</div>
      </Reveal>
    </section>
  </div>
);

export default Returns;
