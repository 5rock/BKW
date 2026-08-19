import { memo, useEffect, useRef, useState } from 'react';

/**
 * LazyWhenVisible — renders children only when the placeholder enters the viewport.
 *
 * Uses a single IntersectionObserver instance per mount; disconnects immediately
 * once visible to avoid ongoing observation overhead.
 *
 * rootMargin defaults to 200px so content starts loading just before it's needed.
 * Callers can override this (e.g. '0px' for truly lazy sections).
 */
const LazyWhenVisible = memo(({
  children,
  fallback = null,
  rootMargin = '200px 0px',
  className = '',
  as: Component = 'div',
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already visible — nothing to observe
    if (visible) return undefined;

    const node = ref.current;
    if (!node) return undefined;

    // SSR / old browser fallback — mount immediately
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // One-shot — clean up immediately
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
    // rootMargin is intentionally excluded from deps:
    // changing it after mount would create a new observer for no user-visible gain.
     
  }, [visible]);

  return (
    <Component ref={ref} className={className}>
      {visible ? children : fallback}
    </Component>
  );
});

LazyWhenVisible.displayName = 'LazyWhenVisible';

export default LazyWhenVisible;
