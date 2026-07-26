"use client";

import { useEffect, useState } from "react";
import { scrollToSection, useCurrentSection } from "@/lib/scroll";

const LINKS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const active = useCurrentSection();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0f14]/80 backdrop-blur-md border-b border-[#2d3748] shadow-lg"
          : "border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => scrollToSection("hero")}
            className="font-mono text-sm font-semibold text-[#e8eaed] hover:text-[#00b4d8] transition-colors"
          >
            S.SAI<span className="text-[#00b4d8]">.DEV</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {LINKS.map(link => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className={`text-sm font-medium transition-all relative ${
                  active === link.id
                    ? "text-[#00b4d8]"
                    : "text-[#9aa0a6] hover:text-[#e8eaed]"
                }`}
              >
                {link.label}
                {active === link.id && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#00b4d8]" />
                )}
              </button>
            ))}
          </nav>

          {/* Resume & Mobile Menu */}
          <div className="flex items-center gap-4">
            <a
              href="/Sarisa_Sai_Dinesh_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-mono border border-[#2d3748] hover:border-[#00b4d8] hover:text-[#00b4d8] text-[#9aa0a6] transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Resume
            </a>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 text-[#9aa0a6] hover:text-[#00b4d8]"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[#0a0f14] z-40 flex flex-col items-center justify-center gap-8"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <nav className="flex flex-col items-center gap-6">
            {LINKS.map(link => (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  scrollToSection(link.id);
                  setMobileOpen(false);
                }}
                className={`text-xl font-medium transition-colors ${
                  active === link.id
                    ? "text-[#00b4d8]"
                    : "text-[#9aa0a6] hover:text-[#e8eaed]"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
          <a
            href="/Sarisa_Sai_Dinesh_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-mono border border-[#2d3748] hover:border-[#00b4d8] hover:text-[#00b4d8] text-[#9aa0a6]"
            onClick={() => setMobileOpen(false)}
          >
            Resume
          </a>
        </div>
      )}
    </header>
  );
}
