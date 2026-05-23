import { lazy, Suspense, useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';

const Chatbot = lazy(() => import('./Chatbot'));

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
        className="fixed bottom-20 right-4 z-[55] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-2xl transition-transform active:scale-95 sm:bottom-6 sm:right-6"
        aria-label="Open shopping assistant"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 rounded-full bg-black px-1.5 py-0.5 text-[10px] font-black text-white">
          AI
        </span>
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
