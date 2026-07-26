"use client";

import { motion, Variants } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { useScrollRaf } from "@/lib/scroll";

function smoothstep(p: number, a: number, b: number): number {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, x: -4 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

type LineProps = {
  text: string;
  delay: number;
  className?: string;
};

function BootLine({ text, delay, className = "" }: LineProps) {
  return (
    <motion.p
      variants={item}
      initial="hidden"
      animate="show"
      transition={{ delay: delay / 1000 }}
      className={`font-mono text-[10px] sm:text-xs tracking-[0.1em] text-[#33ff00] ${className}`}
    >
      {">"} {text}
    </motion.p>
  );
}

export default function HeroOverlay() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const lines = [
      { text: "loading kernel modules...", delay: 200 },
      { text: "mounting filesystems... [OK]", delay: 600 },
      { text: "initializing graphics... [OK]", delay: 1000 },
      { text: "loading profile... [OK]", delay: 1400 },
      { text: "", delay: 1800 },
      { text: "S. SAI DINESH", delay: 2200, className: "text-lg sm:text-xl font-bold text-center" },
      { text: "Robotics Engineer — Aerial Robotics & Autonomous Systems", delay: 2800, className: "text-xs sm:text-sm text-center opacity-70" },
      { text: "", delay: 3400 },
      { text: "system ready. scroll to explore.", delay: 4000, className: "text-center italic opacity-70" },
    ];

    let lineIndex = 0;
    const showNextLine = () => {
      if (lineIndex < lines.length) {
        setVisibleLines(prev => prev + 1);
        lineIndex++;
        const nextDelay = lines[lineIndex]?.delay || 400;
        setTimeout(showNextLine, Math.max(60, nextDelay - (lines[lineIndex - 1]?.delay || 0)));
      }
    };
    setTimeout(showNextLine, 300);
  }, []);

  useScrollRaf((p) => {
    const el = rootRef.current;
    if (!el) return;
    const t = smoothstep(p, 0.02, 0.15);
    el.style.opacity = String(1 - t);
    el.style.transform = `translateY(${-30 * t}px)`;
    el.style.visibility = t >= 0.999 ? "hidden" : "visible";
  });

  const lines = [
    { text: "loading kernel modules...", delay: 200 },
    { text: "mounting filesystems... [OK]", delay: 600 },
    { text: "initializing graphics... [OK]", delay: 1000 },
    { text: "loading profile... [OK]", delay: 1400 },
    { text: "", delay: 1800 },
    { text: "S. SAI DINESH", delay: 2200, className: "text-lg sm:text-xl font-bold text-center" },
    {
      text: "Robotics Engineer — Aerial Robotics & Autonomous Systems",
      delay: 2800,
      className: "text-xs sm:text-sm text-center opacity-70",
    },
    { text: "", delay: 3400 },
    { text: "system ready. scroll to explore.", delay: 4000, className: "text-center italic opacity-70" },
  ];

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-10 will-change-transform flex items-center justify-center bg-[#0a0a0a]"
    >
      <div className="max-w-2xl w-full mx-4 border border-[#33ff00] bg-[#0a0a0a] p-5 sm:p-6 font-mono shadow-[0_0_30px_rgba(51,255,0,0.15)]">
        {/* Terminal title bar */}
        <div className="mb-4 flex items-center gap-2 border-b border-[#33ff00]/40 pb-2">
          <div className="w-3 h-3 rounded-full bg-[#33ff00]" />
          <div className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70">
            user@portfolio:~$ ./init.sh
          </div>
        </div>

        {/* Boot sequence lines */}
        <div className="space-y-1 sm:space-y-2">
          {lines.slice(0, visibleLines).map((line, i) => (
            <BootLine key={i} {...line} />
          ))}
          {visibleLines < lines.length && (
            <span className="inline-block w-2 h-4 bg-[#33ff00] animate-blink align-middle" />
          )}
        </div>

        {/* Blinking cursor */}
        {visibleLines >= lines.length && (
          <div className="mt-4 flex items-center gap-1">
            <span className="inline-block w-2 h-4 bg-[#33ff00] animate-blink" />
            <span className="text-[10px] sm:text-xs text-[#33ff00]/60">_</span>
          </div>
        )}
      </div>
    </div>
  );
}
