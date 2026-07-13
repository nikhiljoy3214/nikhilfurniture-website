import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger to synchronize animations with Lenis smooth scrolling
gsap.registerPlugin(ScrollTrigger);

export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 1. Accessibility Check: Respect system 'prefers-reduced-motion' setting
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      console.log('Smooth scrolling bypassed: user prefers reduced motion.');
      return;
    }

    // 2. Initialize Lenis with a luxurious, high-end feel
    const lenis = new Lenis({
      duration: 1.2,                                             // Smooth elegant speed
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),   // Exponential ease-out
      smoothWheel: true,
      syncTouch: false,                                          // Preserve mobile native inertial physics
    });

    lenisRef.current = lenis;

    // 3. Keep GSAP ScrollTrigger in sync with the smooth scroll instance
    lenis.on('scroll', ScrollTrigger.update);

    // 4. Connect Lenis to the GSAP Ticker for a unified 60 FPS animation loop
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // 5. Global listener for lazy-loaded media assets to recalculate scroll heights
    const handleImageLoad = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener('load', handleImageLoad, true); // Capture load events of images

    // 6. Observe DOM resizing (React Query additions, accordion expansions) to prevent alignment drift
    let rafId: number;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (lenisRef.current) {
          lenisRef.current.resize();
        }
        ScrollTrigger.refresh();
      });
    });
    resizeObserver.observe(document.body);

    // 7. Cleanup everything on unmount
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('load', handleImageLoad, true);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // 8. Handle navigation changes: snap to top instantly and recalculate trigger points
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    // Give React render loop a moment to mount the page DOM, then refresh GSAP triggers
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 80);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
