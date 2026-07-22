import Mail from 'lucide-react/dist/esm/icons/mail';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Phone from 'lucide-react/dist/esm/icons/phone';
import Send from 'lucide-react/dist/esm/icons/send';
import { motion } from 'framer-motion';
import Reveal from '@/components/ui/Reveal';
import PageHero from '@/components/ui/PageHero';
import { supportChannels } from '@/constants/marketplace';

const Contact = () => (
  <div className="theme-page min-h-screen">
    <PageHero eyebrow="Contact & Support" title="Concierge support for premium marketplace moments." copy="Reach us through chat, email, phone, or our global support hubs. Every request is routed for speed and context." image="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2200&q=85" />
    <section className="luxury-shell grid gap-4 py-16 md:grid-cols-3">
      {supportChannels.map((channel, index) => {
        const Icon = channel.icon;
        return <Reveal key={channel.title} delay={index * 0.06} className="theme-card rounded-[1.5rem] p-6"><Icon className="h-7 w-7 text-amber-700 dark:text-amber-200" /><h2 className="mt-5 text-xl font-black">{channel.title}</h2><p className="theme-muted mt-3 text-sm leading-7">{channel.copy}</p></Reveal>;
      })}
    </section>
    <section className="luxury-shell grid gap-8 pb-16 lg:grid-cols-[1fr_0.9fr]">
      <Reveal className="theme-card rounded-[2rem] p-7">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-[#7a4f28] dark:text-amber-300/95">Contact form</p>
        <form className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="Name" className="theme-input rounded-2xl px-4 py-4" />
            <input type="email" placeholder="Email" className="theme-input rounded-2xl px-4 py-4" />
          </div>
          <input placeholder="Order ID or topic" className="theme-input rounded-2xl px-4 py-4" />
          <textarea rows={6} placeholder="How can we help?" className="theme-input resize-none rounded-2xl px-4 py-4" />
          <motion.button whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-300 px-6 py-4 font-black text-black"><Send className="h-4 w-4" /> Send request</motion.button>
        </form>
      </Reveal>
      <div className="grid gap-4">
        {[
          [MessageCircle, 'Live chat', 'Average response under 90 seconds.'],
          [Mail, 'support@goldmarket.example', 'Priority email support for order issues.'],
          [Phone, '+1 800 MARKETX', 'Phone support for premium delivery exceptions.'],
        ].map(([Icon, title, copy]) => <Reveal key={title} className="theme-card rounded-[1.5rem] p-6"><Icon className="h-6 w-6 text-amber-700 dark:text-amber-200" /><h3 className="mt-4 font-black">{title}</h3><p className="theme-muted mt-2 text-sm">{copy}</p></Reveal>)}
        <Reveal className="relative min-h-52 overflow-hidden rounded-[1.5rem] border border-black/[0.08] p-6 dark:border-white/10">
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#3a3028] via-[#1a1512] to-[#0c0a09] dark:hidden" aria-hidden />
          <div className="pointer-events-none absolute inset-0 z-0 hidden bg-[radial-gradient(circle_at_center,rgba(245,197,82,0.20),transparent_14rem),#090909] dark:block" aria-hidden />
          <div className="relative z-10">
            <MapPin className="h-6 w-6 text-amber-300 dark:text-amber-200" />
            <h3 className="mt-4 font-black text-white">Global support map</h3>
            <p className="mt-2 text-sm text-white/70">New York, London, Dubai, Mumbai, Singapore, Paris.</p>
          </div>
          <div className="absolute bottom-5 right-5 z-[2] rounded-full border border-amber-400/25 bg-amber-400/15 px-4 py-2 text-xs font-black text-amber-950 dark:border-amber-200/25 dark:bg-amber-200/12 dark:text-amber-50">Google Maps ready</div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default Contact;
