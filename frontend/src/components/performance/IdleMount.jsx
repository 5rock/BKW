import { useEffect, useState } from 'react';

const IdleMount = ({ children, timeout = 1800, fallback = null }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return undefined;

    const run = () => setReady(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout });
      return () => window.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(run, Math.min(timeout, 1200));
    return () => window.clearTimeout(id);
  }, [ready, timeout]);

  return ready ? children : fallback;
};

export default IdleMount;
