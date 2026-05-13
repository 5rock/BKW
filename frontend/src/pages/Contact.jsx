import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import Reveal from '../components/animations/Reveal';
import PageHero from '../components/ui/PageHero';
import { supportChannels } from '../constants/marketplace';

const Contact = () => (
  <div className="min-h-screen bg-[#050505] text-white">
    <PageHero eyebrow="Contact & Support" title="Concierge support for premium marketplace moments." copy="Reach us through chat, email, phone, or our global support hubs. Every request is routed for speed and context." image="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2200&q=85" />
    <section className="luxury-shell grid gap-4 py-16 md:grid-cols-3">
      {supportChannels.map((channel, index) => {
        const Icon = channel.icon;
        return <Reveal key={channel.title} delay={index * 0.06} className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6"><Icon className="h-7 w-7 text-amber-200" /><h2 className="mt-5 text-xl font-black">{channel.title}</h2><p className="mt-3 text-sm leading-7 text-white/52">{channel.copy}</p></Reveal>;
      })}
    </section>
    <section className="luxury-shell grid gap-8 pb-16 lg:grid-cols-[1fr_0.9fr]">
      <Reveal className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">Contact form</p>
        <form className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="Name" className="rounded-2xl border border-white/10 bg-black/28 px-4 py-4 text-white outline-none placeholder:text-white/35 focus:border-amber-200/50" />
            <input type="email" placeholder="Email" className="rounded-2xl border border-white/10 bg-black/28 px-4 py-4 text-white outline-none placeholder:text-white/35 focus:border-amber-200/50" />
          </div>
          <input placeholder="Order ID or topic" className="rounded-2xl border border-white/10 bg-black/28 px-4 py-4 text-white outline-none placeholder:text-white/35 focus:border-amber-200/50" />
          <textarea rows={6} placeholder="How can we help?" className="resize-none rounded-2xl border border-white/10 bg-black/28 px-4 py-4 text-white outline-none placeholder:text-white/35 focus:border-amber-200/50" />
          <motion.button whileTap={{ scale: 0.98 }} className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-300 px-6 py-4 font-black text-black"><Send className="h-4 w-4" /> Send request</motion.button>
        </form>
      </Reveal>
      <div className="grid gap-4">
        {[
          [MessageCircle, 'Live chat', 'Average response under 90 seconds.'],
          [Mail, 'support@goldmarket.example', 'Priority email support for order issues.'],
          [Phone, '+1 800 MARKETX', 'Phone support for premium delivery exceptions.'],
        ].map(([Icon, title, copy]) => <Reveal key={title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6"><Icon className="h-6 w-6 text-amber-200" /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm text-white/52">{copy}</p></Reveal>)}
        <Reveal className="relative min-h-52 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(245,197,82,0.20),transparent_14rem),#090909] p-6">
          <MapPin className="h-6 w-6 text-amber-200" />
          <h3 className="mt-4 font-black">Global support map</h3>
          <p className="mt-2 text-sm text-white/52">New York, London, Dubai, Mumbai, Singapore, Paris.</p>
          <div className="absolute bottom-5 right-5 rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-xs font-black text-amber-100">Google Maps ready</div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default Contact;
