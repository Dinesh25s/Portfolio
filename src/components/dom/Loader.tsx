"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useUIStore } from "@/lib/store";

const MIN_SHOW_MS = 1400;
const FORCE_HIDE_MS = 9000;

const BOOT_LINES = [
  "BIOS DATE 01/01/26 15:23:00 VER 1.0.2",
  "CPU: QUANTUM CORE i9 @ 4.2GHz",
  "MEMORY: 640K OK",
  "DETECTING DRIVES...",
  "  /dev/sda - 2TB STORAGE UNIT",
  "  /dev/nvme - SYSTEM ROOT",
  "MOUNTING /home/portfolio...",
  "LOADING KERNEL MODULES... [OK]",
  "INITIALIZING GRAPHICS... [OK]",
  "STARTING NETWORK SERVICES... [OK]",
  "LOADING USER PROFILE... [OK]",
  "RUNNING STARTUP SCRIPTS...",
  "  - Setting terminal color scheme... [OK]",
  "  - Compiling shaders... [OK]",
  "  - Loading drone simulation... [OK]",
  "  - Calibrating sensors... [OK]",
  "SYSTEM READY.",
  "",
];

export default function Loader() {
  const setReady = useUIStore((s) => s.setReady);
  const ready = useUIStore((s) => s.ready);
  const [minElapsed, setMinElapsed] = useState(false);
  const [forced, setForced] = useState(false);
  const [gone, setGone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    // Show boot lines progressively
    let lineIndex = 0;
    const showNextLine = () => {
      if (lineIndex < BOOT_LINES.length) {
        setVisibleLines((prev) => prev + 1);
        lineIndex++;
        const delay = BOOT_LINES[lineIndex - 1]?.includes("[OK]") ? 120 : 80;
        setTimeout(showNextLine, delay);
      }
    };
    setTimeout(showNextLine, 400);
  }, []);

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Mark as ready when fonts are loaded
    const onFontsReady = () => setReady(true);
    if (document.fonts.ready) document.fonts.ready.then(onFontsReady);

    const onWindowLoad = () => setReady(true);
    window.addEventListener("load", onWindowLoad);

    const a = window.setTimeout(() => setMinElapsed(true), MIN_SHOW_MS);
    const b = window.setTimeout(() => setForced(true), FORCE_HIDE_MS);

    return () => {
      clearTimeout(a);
      clearTimeout(b);
      window.removeEventListener("load", onWindowLoad);
    };
  }, [setReady]);

  const complete = ready || forced;
  const hidden = (ready && minElapsed) || forced;

  useEffect(() => {
    if (!hidden) return;
    const t = window.setTimeout(() => setGone(true), 1000);
    return () => window.clearTimeout(t);
  }, [hidden]);

  if (gone) return null;

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0a0a]"
          aria-label="System booting"
        >
          <div className="flex flex-col items-center gap-6">
            {/* Terminal window */}
            <div className="w-full max-w-lg border border-[#33ff00] bg-[#0a0a0a] p-6 shadow-[0_0_40px_rgba(51,255,0,0.2)]">
              {/* Title bar */}
              <div className="mb-4 flex items-center gap-2 border-b border-[#33ff00]/40 pb-2">
                <div className="w-3 h-3 rounded-full bg-[#33ff00]" />
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#33ff00]/70">
                  BOOT_SEQUENCE.EXE
                </div>
              </div>

              {/* Boot output */}
              <div className="font-mono text-[10px] leading-relaxed text-[#33ff00] space-y-1 max-h-64 overflow-hidden">
                {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={line.includes("[OK]") ? "text-[#33ff00]" : line.includes("ERROR") ? "text-[#ff3333]" : line === "" ? "h-4" : ""}
                  >
                    {line || " "}
                  </motion.div>
                ))}
                {visibleLines < BOOT_LINES.length && (
                  <span className="inline-block w-2 h-4 bg-[#33ff00] animate-blink align-middle" />
                )}
              </div>
            </div>

            {/* Status line */}
            <div className="font-mono text-[10px] text-[#33ff00]/60">
              {complete ? "SYSTEM READY." : `LOADING... ${Math.round(progress)}%`}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
