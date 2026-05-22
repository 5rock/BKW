import { memo, useEffect, useRef, useState } from 'react';

/**
 * Reveal — CSS-only scroll-reveal animation.
 *
 * WHY: Replacing `motion.div` with a native IntersectionObserver + CSS
 * transition removes Framer Motion from the critical render path for
 * every section on the page. The animation is indistinguishable visually
 * but costs zero JS execution time during the initial load.
 *
 * Respects `prefers-reduced-motion` for accessibility.
 */
const Reveal = memo(({
  children,
  className = '',
  delay = 0,
  y = 24,
  as: Component = 'div',
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Skip animation if user prefers reduced motion
    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisible(true);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '-60px 0px', threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: visible
          ? `opacity 0.65s ease, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s`
          : 'none',
        willChange: visible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </Component>
  );
});

Reveal.displayName = 'Reveal';

export default Reveal;
