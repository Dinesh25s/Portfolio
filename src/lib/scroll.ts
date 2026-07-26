"use client";

import Lenis from "lenis";
import { useEffect, useState } from "react";

/**
 * Smooth scroll setup using Lenis
 */
let lenis: Lenis | null = null;

export function initSmoothScroll(): () => void {
  if (lenis) return () => {};

  lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  return () => {
    lenis?.destroy();
    lenis = null;
  };
}

/**
 * Scroll to a section by ID
 */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const navHeight = 64;
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight;

  if (lenis) {
    lenis.scrollTo(top, { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  } else {
    window.scrollTo({ top, behavior: "smooth" });
  }
}

/**
 * Track current visible section using IntersectionObserver
 */
export function useCurrentSection(): string {
  const [section, setSection] = useState("hero");

  useEffect(() => {
    const sectionIds = ["about", "experience", "skills", "projects", "contact"];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return section;
}
