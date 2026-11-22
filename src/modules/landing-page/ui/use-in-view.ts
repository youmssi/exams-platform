"use client";

import { useEffect, useRef, useState } from "react";

/** True once the element has entered the viewport (sections reveal themselves once). */
export function useInView<T extends Element>(threshold = 0.1) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/** Fade-and-rise classes shared by every section. */
export const reveal = (inView: boolean, from = "translate-y-8") =>
  `transition-all duration-700 ${inView ? "translate-x-0 translate-y-0 opacity-100" : `${from} opacity-0`}`;
