/**
 * useIntersection — Reusable IntersectionObserver hook.
 *
 * Returns true once the target element enters the viewport.
 * One-shot by default (disconnects after first intersection).
 *
 * @param {object} options
 * @param {string}  options.rootMargin - Margin around viewport (default '100px 0px')
 * @param {number}  options.threshold  - Intersection ratio trigger (default 0)
 * @param {boolean} options.once       - Disconnect after first intersection (default true)
 *
 * @example
 * const ref = useRef(null);
 * const visible = useIntersection(ref, { rootMargin: '200px 0px' });
 */
import { useEffect, useRef, useState } from 'react';

const useIntersection = (
  ref,
  { rootMargin = '100px 0px', threshold = 0, once = true } = {}
) => {
  const [intersecting, setIntersecting] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    if (intersecting && once) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setIntersecting(true);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIntersecting(false);
        }
      },
      { rootMargin, threshold }
    );

    observerRef.current = observer;
    observer.observe(node);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, once]);

  return intersecting;
};

export default useIntersection;
