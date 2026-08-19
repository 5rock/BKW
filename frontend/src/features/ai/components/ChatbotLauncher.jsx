import { lazy, Suspense, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const Chatbot = lazy(() => import('@/features/ai/components/Chatbot'));

const ChatbotLauncher = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return undefined;

    const load = () => setReady(true);
    window.addEventListener('pointerdown', load, { once: true, passive: true });
    window.addEventListener('keydown', load, { once: true });

    return () => {
      window.removeEventListener('pointerdown', load);
      window.removeEventListener('keydown', load);
    };
  }, [ready]);

  if (!ready) {
    return (
      <button
        type="button"
        onClick={() => setReady(true)}
        className="fixed bottom-20 right-4 z-[55] flex items-center justify-center w-14 h-14 rounded-full bg-surface-primary border border-surface-border text-color-gold shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-color-gold/20 sm:bottom-8 sm:right-8"
        aria-label="Open Private Concierge"
      >
        <Sparkles size={22} className="relative z-10" />
        <span className="absolute inset-0 rounded-full border border-color-gold/30 animate-[ping_3s_ease-in-out_infinite]" />
      </button>
    );
  }

  return (
    <Suspense fallback={null}>
      <Chatbot />
    </Suspense>
  );
};

export default ChatbotLauncher;
