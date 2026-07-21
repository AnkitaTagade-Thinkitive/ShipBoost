import { useEffect, useRef, useState } from "react";

/**
 * Tiny IntersectionObserver hook for scroll-triggered entrance animations.
 * Zero dependencies — keeps the landing page lightweight.
 *
 * Returns a ref to attach to the target and a boolean that flips to `true` the
 * first time the element scrolls into view (then stays true — one-shot). On the
 * server, and where IntersectionObserver is unavailable, it defaults to visible
 * so content is never hidden.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  rootMargin = "0px 0px -12% 0px",
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
