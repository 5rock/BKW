import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import BadgeCheck from 'lucide-react/dist/esm/icons/badge-check';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import RefreshCcw from 'lucide-react/dist/esm/icons/refresh-ccw';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Reveal from '@/components/ui/Reveal';
import PageHero from '@/components/ui/PageHero';
import { returnSteps } from '@/constants/marketplace';

const faqs = ['How long does a refund take?', 'Can I exchange instead of returning?', 'What if an item is damaged?', 'How do I track my refund?'];

const Returns = () => (
  <div className="theme-page min-h-screen">
    <PageHero eyebrow="Returns & Refunds" title="A guided return flow that feels calm, fast, and fair." copy="MarketX makes eligibility, pickup, inspection, exchange, and refund status transparent from the first tap." image="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=2200&q=85" />
    <section className="luxury-shell grid gap-4 py-16 md:grid-cols-2 lg:grid-cols-4">
      {[
        [RotateCcw, 'Return Eligibility', 'Most eligible products can be returned within the seller policy window.'],
        [RefreshCcw, 'Refund Workflow', 'Refunds begin after pickup, inspection, and approval checkpoints.'],
        [BadgeCheck, 'Exchange Policy', 'Exchange options appear for size, color, or verified replacement inventory.'],
        [AlertTriangle, 'Damaged Items', 'Upload photos and get priority review for damaged or incorrect products.'],
      ].map(([Icon, title, copy], index) => <Reveal key={title} delay={index * 0.05} className="theme-card rounded-[1.5rem] p-6"><Icon className="h-7 w-7 text-amber-700 dark:text-amber-200" /><h2 className="mt-5 text-xl font-black">{title}</h2><p className="theme-muted mt-3 text-sm leading-7">{copy}</p></Reveal>)}
    </section>
    <section className="luxury-shell grid gap-8 pb-16 lg:grid-cols-[1.05fr_0.95fr]">
      <Reveal className="theme-card rounded-[2rem] p-7">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-[#7a4f28] dark:text-amber-300/95">Step-by-step return flow</p>
        <div className="mt-8 space-y-5">
          {returnSteps.map((step, index) => <div key={step} className="flex gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-500 text-sm font-black text-white shadow-sm dark:bg-amber-300 dark:text-black dark:shadow-none">{index + 1}</span><p className="pt-2 font-bold text-[#3d3835]/90 dark:theme-muted">{step}</p></div>)}
        </div>
      </Reveal>
      <Reveal className="relative overflow-hidden rounded-[2rem] border border-black/[0.07] p-7 dark:border-white/10">
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#fffdfb] via-[#f7efe4] to-[#ebe0d4] dark:hidden" aria-hidden />
        <div className="pointer-events-none absolute inset-0 z-0 hidden bg-[radial-gradient(circle_at_top,rgba(245,197,82,0.14),transparent_20rem),rgba(255,255,255,0.06)] dark:block" aria-hidden />
        <div className="relative z-10">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#7a4f28] dark:text-amber-300/95">FAQ accordion</p>
          <div className="mt-6 space-y-3">
            {faqs.map((faq) => <details key={faq} className="theme-card group rounded-2xl p-4"><summary className="theme-text flex cursor-pointer list-none items-center justify-between font-black">{faq}<ChevronDown className="h-4 w-4 shrink-0 text-amber-800 transition group-open:rotate-180 dark:text-amber-200" /></summary><p className="theme-muted mt-3 text-sm leading-7">Our support team and automated workflow show live status, required actions, and expected refund timing inside your account.</p></details>)}
          </div>
          <div className="mt-6 rounded-2xl border border-emerald-800/12 bg-emerald-600/[0.08] p-5 text-sm font-semibold leading-7 text-emerald-950 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-50">
            <ShieldCheck className="mb-2 h-5 w-5 text-emerald-800 dark:text-emerald-200" />
            Buyer protection applies when products differ from verified listing details.
          </div>
        </div>
      </Reveal>
    </section>
  </div>
);

export default Returns;
