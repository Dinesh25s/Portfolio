"use client";

import { useEffect, useRef } from "react";

const CURSOR_SIZE = 18;
const BLINK_INTERVAL = 530;

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const fineRef = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    fineRef.current = fine;
    if (!fine) return;

    const html = document.documentElement;
    html.classList.add("custom-cursor-active");

    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;
    let visible = false;
    const smallDelay = 0.085;

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        if (cursorRef.current) cursorRef.current.style.opacity = "1";
      }
    };

    const tick = () => {
      // Lerp toward target position
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        cursorX += dx * smallDelay;
        cursorY += dy * smallDelay;
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
        }
      }
      requestAnimationFrame(tick);
    };

    setTimeout(() => {
      requestAnimationFrame(tick);
    }, 0);

    const onEnter = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "1";
    };
    const onLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseenter", onEnter);
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      html.classList.remove("custom-cursor-active");
    };
  }, []);

  // Use system cursor on coarse devices
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const set = () => {
      const fine = mq.matches;
      document.documentElement.classList.toggle("custom-cursor", fine);
      document.documentElement.classList.toggle("cursor-none", fine);
    };
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] will-change-transform"
      style={{
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
        opacity: 0,
        transform: "translate3d(-100px, -100px, 0)",
      }}
    >
      {/* Terminal block cursor */}
      <div
        className="h-full w-full bg-[#33ff00]"
        style={{
          animation: `blink ${BLINK_INTERVAL}ms steps(2) infinite`,
        }}
      />
    </div>
  );
}
