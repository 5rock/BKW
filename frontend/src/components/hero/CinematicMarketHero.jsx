import { useEffect, useId, useRef } from 'react';
import { Link } from 'react-router-dom';
import Hls from 'hls.js';
import { ArrowRight } from 'lucide-react';

const MUX_HLS = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

/**
 * Full-viewport cinematic hero for GoldMarket — video backdrop, no duplicate nav
 * (global Navbar handles navigation). Luxury e-commerce messaging only.
 */
const CinematicMarketHero = () => {
  const videoRef = useRef(null);
  const glowId = useId().replace(/:/g, '');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(MUX_HLS);
      hls.attachMedia(video);
      void video.play().catch(() => {});
      return () => {
        hls.destroy();
      };
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = MUX_HLS;
      void video.play().catch(() => {});
    }

    return undefined;
  }, []);

  return (
    <section
      className="relative isolate min-h-screen w-full overflow-hidden bg-[#070b0a] text-white"
      aria-label="GoldMarket hero"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-60"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="pointer-events-none absolute inset-0 z-[1] market-hero-scrim" aria-hidden />

      <div className="pointer-events-none absolute inset-0 z-[2] hidden lg:block" aria-hidden>
        <div className="absolute bottom-0 left-1/4 top-0 w-px bg-gradient-to-b from-transparent via-white/10 to-white/10" />
        <div className="absolute bottom-0 left-1/2 top-0 w-px bg-gradient-to-b from-transparent via-white/10 to-white/10" />
        <div className="absolute bottom-0 left-3/4 top-0 w-px bg-gradient-to-b from-transparent via-white/10 to-white/10" />
      </div>

      <svg
        className="pointer-events-none absolute left-1/2 top-0 z-[3] w-[min(140%,80rem)] -translate-x-1/2"
        style={{ filter: 'blur(25px)' }}
        viewBox="0 0 1200 320"
        aria-hidden
      >
        <defs>
          <radialGradient id={`market-glow-${glowId}`} cx="50%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#b45309" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1c1917" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="600" cy="120" rx="520" ry="100" fill={`url(#market-glow-${glowId})`} />
      </svg>

      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-[1200px] flex-col justify-center px-4 py-28 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-5 py-2.5 font-jakarta text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300/95 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Verified luxury marketplace
          </p>

          <h1 className="mt-8 font-sans font-extrabold uppercase leading-[1.02] tracking-tight text-white [font-size:clamp(2.8rem,8vw,5.5rem)]">
            Discover rare luxury<span className="text-amber-400">.</span>
          </h1>

          <p className="mt-6 max-w-xl font-sans text-base leading-8 text-white/65 sm:text-lg sm:leading-9">
            Shop authenticated jewelry, watches, and premium goods with Apple-level polish, Stripe-grade confidence, and global delivery you can track from vault to doorstep.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-8 py-4 font-sans text-sm font-bold uppercase tracking-wide text-[#1a1206] shadow-lg shadow-amber-900/25 transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
            >
              Shop collections
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            <Link
              to="/products?sort=top_rated"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-4 font-sans text-sm font-bold uppercase tracking-wide text-white/80 backdrop-blur-xl transition hover:border-amber-400/30 hover:bg-white/[0.08] hover:text-white"
            >
              Explore collection
            </Link>
          </div>

          <div className="mt-14 flex items-center gap-8 border-t border-white/[0.06] pt-8">
            <div>
              <p className="text-2xl font-black text-white">50K+</p>
              <p className="mt-1 text-xs font-bold text-white/40">Verified buyers</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-2xl font-black text-white">12K+</p>
              <p className="mt-1 text-xs font-bold text-white/40">Premium products</p>
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            <div className="hidden sm:block">
              <p className="text-2xl font-black text-white">99.8%</p>
              <p className="mt-1 text-xs font-bold text-white/40">Authenticity rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CinematicMarketHero;
