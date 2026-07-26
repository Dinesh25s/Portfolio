"use client";

import { useRef } from "react";
import { SECTIONS, sectionAt, type SectionId } from "@/lib/journey";
import { scrollToSection, useCurrentSection, useScrollRaf } from "@/lib/scroll";

const LABELS = Object.fromEntries(SECTIONS.map((s) => [s.id, s.label])) as Record<SectionId, string>;

export default function HUDRail() {
  const current = useCurrentSection();

  const fillRef = useRef<HTMLDivElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);
  const secRef = useRef<HTMLSpanElement>(null);
  const cache = useRef({ fill: "", alt: "", vel: "", sec: "", lastText: 0 });

  useScrollRaf((p, v) => {
    const c = cache.current;

    const fill = p.toFixed(4);
    if (fill !== c.fill && fillRef.current) {
      c.fill = fill;
      fillRef.current.style.transform = `scaleY(${fill})`;
    }

    const now = performance.now();
    if (now - c.lastText < 120) return;
    c.lastText = now;

    const alt = `ALT +${(p * 420).toFixed(1)}M`;
    if (alt !== c.alt && altRef.current) {
      c.alt = alt;
      altRef.current.textContent = alt;
    }

    const vel = `VEL ${(Math.abs(v) * 2400).toFixed(0)} KM/H`;
    if (vel !== c.vel && velRef.current) {
      c.vel = vel;
      velRef.current.textContent = vel;
    }

    const sec = `${LABELS[sectionAt(p)]}`;
    if (sec !== c.sec && secRef.current) {
      c.sec = sec;
      secRef.current.textContent = sec;
    }
  });

  return (
    <div className="pointer-events-none fixed right-4 sm:right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-0 lg:flex">
      {/* Section navigation rail */}
      <div className="relative h-[200px] w-1 bg-[#1f521f] mb-4">
        {/* Progress fill */}
        <div
          ref={fillRef}
          className="absolute left-0 top-0 h-full w-full bg-[#33ff00]"
          style={{ transform: "scaleY(0)", transformOrigin: "top" }}
        />

        {/* Section ticks */}
        {SECTIONS.map((s) => {
          const active = current === s.id;
          const top = s.range[0] * 100;
          return (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to ${s.label}`}
              onClick={() => scrollToSection(s.id)}
              className="group relative left-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ top: `${top}%` }}
            >
              <span
                className={`h-2 w-2 rounded-full border transition-all ${
                  active
                    ? "border-[#33ff00] bg-[#33ff00] shadow-[0_0_8px_rgba(51,255,0,0.7)]"
                    : "border-[#1f521f] bg-[#0a0a0a] group-hover:border-[#33ff00]/60"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Live telemetry values */}
      <div className="text-right font-mono text-[10px] leading-tight space-y-1 text-[#888888]">
        <p ref={altRef} className="text-[#33ff00]">ALT +000.0M</p>
        <p ref={velRef} className="text-[#33ff00]">VEL 000 KM/H</p>
        <p ref={secRef} className="text-[#33ff00] uppercase tracking-wider">INIT</p>
      </div>
    </div>
  );
}
