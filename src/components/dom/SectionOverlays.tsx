"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ARCHIVE_URL, EXPERIENCE, PROFILE, PROJECTS } from "@/lib/data";
import { useScrollRaf } from "@/lib/scroll";
import { useUIStore } from "@/lib/store";

/* ------------------------------------------------------------------ */
/* Scroll envelope helpers                                            */
/* ------------------------------------------------------------------ */

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function envelope(p: number, a0: number, a1: number, b0: number, b1: number): number {
  return smoothstep(a0, a1, p) * (1 - smoothstep(b0, b1, p));
}

function applyPanel(
  el: HTMLDivElement | null,
  last: { current: number },
  alpha: number,
  transform: (a: number) => string
) {
  if (!el) return;
  if (Math.abs(alpha - last.current) < 0.0008) return;
  last.current = alpha;
  el.style.opacity = alpha.toFixed(4);
  el.style.transform = transform(alpha);
  el.style.visibility = alpha < 0.02 ? "hidden" : "visible";
}

const HIDDEN = {
  opacity: 0,
  visibility: "hidden" as const,
  willChange: "opacity, transform" as const,
};

/* ------------------------------------------------------------------ */
/* Reusable panel shell                                               */
/* ------------------------------------------------------------------ */

interface PanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

function Panel({ title, children, className = "", interactive = false }: PanelProps) {
  return (
    <div
      className={`border border-[#1f521f] bg-[#0a0a0a] ${interactive ? "pointer-events-auto" : ""} ${className}`}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-1 border-b border-[#33ff00]/40">
        <div className="w-3 h-3 rounded-full bg-[#33ff00]" />
        <div className="font-mono text-[10px] text-[#33ff00]/70">{title}</div>
      </div>
      {/* Content */}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small components                                                   */
/* ------------------------------------------------------------------ */

function TechBadge({ children }: { children: ReactNode }) {
  return (
    <span className="border border-[#1f521f] px-2 py-1 text-[10px] uppercase font-mono text-[#33ff00]">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */

export default function SectionOverlays() {
  const aboutRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const lastAbout = useRef(-1);
  const lastExperience = useRef(-1);
  const lastSkills = useRef(-1);
  const lastProjects = useRef(-1);
  const lastContact = useRef(-1);

  useScrollRaf((p) => {
    applyPanel(aboutRef.current, lastAbout, envelope(p, 0.205, 0.235, 0.315, 0.34), (a) => `translateX(${(-40 * (1 - a)).toFixed(2)}px)`);
    applyPanel(experienceRef.current, lastExperience, envelope(p, 0.355, 0.39, 0.475, 0.5), (a) => `translateX(${(40 * (1 - a)).toFixed(2)}px)`);
    applyPanel(skillsRef.current, lastSkills, envelope(p, 0.51, 0.54, 0.595, 0.62), (a) => `translateY(${(-18 * (1 - a)).toFixed(2)}px)`);
    applyPanel(projectsRef.current, lastProjects, envelope(p, 0.635, 0.665, 0.775, 0.8), (a) => `translateX(${(-28 * (1 - a)).toFixed(2)}px)`);
    applyPanel(contactRef.current, lastContact, smoothstep(0.82, 0.875, p), (a) => `translateX(${(40 * (1 - a)).toFixed(2)}px)`);
  });

  /* ---------------- experience tabs ---------------- */
  const [activeJob, setActiveJob] = useState(0);
  const job = EXPERIENCE[activeJob];

  /* ---------------- projects hover chip ---------------- */
  const hoveredId = useUIStore((s) => s.hoveredProject);
  const hovered = hoveredId ? (PROJECTS.find((pr) => pr.id === hoveredId) ?? null) : null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* ============ 01 // THE ENGINEER ============ */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <div
          ref={aboutRef}
          style={HIDDEN}
          className="ml-4 sm:ml-6 w-[480px] max-w-[calc(100vw-3rem)] lg:ml-16"
        >
          <Panel title="01 // THE ENGINEER">
            <h2 className="font-mono text-[18px] leading-[1.2] text-[#f0f0f0]">
              Building <span className="text-[#33ff00]">autonomous aerial systems</span>
            </h2>

            <p className="mt-4 text-[13px] leading-relaxed text-[#cccccc]">{PROFILE.about.lead}</p>

            <p className="mt-3 text-[12px] leading-relaxed text-[#888888]">{PROFILE.about.p2}</p>
            <p className="mt-3 text-[12px] leading-relaxed text-[#888888]">{PROFILE.about.p3}</p>

            {/* Core Competencies */}
            <div className="mt-6">
              <p className="font-mono text-[10px] mb-2 text-[#33ff00]">CORE COMPETENCIES</p>
              <div className="flex flex-wrap gap-2">
                {["Aerial Robotics", "Sensor Fusion", "State Estimation", "Trajectory Planning", "Flight Control", "Embedded AI"].map((skill) => (
                  <TechBadge key={skill}>{skill}</TechBadge>
                ))}
              </div>
            </div>

            {/* Credentials */}
            <div className="mt-6 pt-3 border-t border-[#33ff00]/20">
              <p className="font-mono text-[10px] mb-2 text-[#33ff00]">CREDENTIALS</p>
              <ul className="space-y-2">
                {PROFILE.about.credentials.map((cred) => (
                  <li key={cred} className="flex items-center gap-2 text-[12px] text-[#cccccc]">
                    <span className="text-[#33ff00]">[+]</span>
                    <span>{cred}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Status line */}
            <div className="mt-6 font-mono text-[10px] text-[#cccccc]">
              <span className="text-[#888888]">STATUS:</span> <span className="text-[#33ff00]">Active</span>
              <span className="mx-2 text-[#333333]">|</span>
              <span className="text-[#888888]">LOCATION:</span> <span className="text-[#cccccc]">Hyderabad</span>
              <span className="mx-2 text-[#333333]">|</span>
              <span className="text-[#888888]">AVAILABILITY:</span> <span className="text-[#33ff00]">Open</span>
            </div>
          </Panel>
        </div>
      </div>

      {/* ============ 02 // OPERATIONS LOG ============ */}
      <div className="absolute inset-y-0 right-0 flex items-center">
        <div
          ref={experienceRef}
          style={HIDDEN}
          className="mr-4 sm:mr-6 w-[580px] max-w-[calc(100vw-3rem)] lg:mr-24"
        >
          <Panel title="02 // OPERATIONS LOG" interactive>
            {/* Company Selector */}
            <div className="flex gap-2 mt-1">
              {EXPERIENCE.map((j, i) => (
                <button
                  key={j.company}
                  type="button"
                  onClick={() => setActiveJob(i)}
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase transition-all border ${
                    i === activeJob
                      ? "border-[#33ff00] text-[#33ff00] bg-[#33ff00]/10"
                      : "border-[#1f521f] text-[#888888] hover:border-[#33ff00]/60 hover:text-[#cccccc]"
                  }`}
                >
                  {j.company.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Role & Company */}
            <div className="mt-4">
              <h3 className="font-mono text-[20px] font-bold text-[#f0f0f0]">{job.title}</h3>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-[#33ff00] font-mono text-sm">@ {job.company}</span>
                <span className="text-[#666666] text-sm">·</span>
                <span className="text-[#888888] font-mono text-sm">{job.range}</span>
              </div>
              <p className="mt-1 text-[12px] text-[#888888]">{job.location}</p>
            </div>

            {/* Blurb */}
            <p className="mt-4 text-[13px] leading-relaxed text-[#cccccc]">{job.blurb}</p>

            <div className="mt-4 border-t border-[#33ff00]/20" />

            {/* Points */}
            <ul
              key={activeJob}
              onWheel={(e) => e.stopPropagation()}
              className="mt-4 max-h-[240px] space-y-3 overflow-y-auto pr-2 font-mono text-[12px] text-[#aaaaaa]"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(51,255,0,0.3) transparent" }}
            >
              {job.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-[#33ff00]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2L2 8l8 8 8-8-8-6zm0 3l5 4-5 4-5-4 5-4z" />
                    </svg>
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* Navigation dots */}
            <div className="mt-5 flex justify-center gap-2">
              {EXPERIENCE.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveJob(i)}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    i === activeJob ? "bg-[#33ff00] shadow-[0_0_8px_rgba(51,255,0,0.6)]" : "bg-[#1f521f]"
                  }`}
                />
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* ============ 03 // SYSTEMS ONLINE ============ */}
      <div className="absolute inset-x-0 top-24 flex justify-center">
        <div ref={skillsRef} style={HIDDEN} className="px-6 text-center">
          <div className="mb-3">
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#33ff00]">03 // SYSTEMS ONLINE</span>
          </div>
          <h2 className="font-mono text-[24px] font-bold text-[#f0f0f0]">Engineering Stack Loaded</h2>
          <p className="mt-3 font-mono text-[10px] tracking-[0.35em] text-[#888888] animate-pulse-green">
            SCROLL TO INSPECT MODULES
          </p>
        </div>
      </div>

      {/* ============ 04 // MISSION ARCHIVE ============ */}
      <div className="absolute left-4 sm:left-6 top-24 lg:left-16">
        <div ref={projectsRef} style={HIDDEN}>
          <Panel title="04 // MISSION ARCHIVE">
            <h2 className="font-mono text-[24px] font-bold text-[#f0f0f0]">Active Missions</h2>
            <p className="mt-2 font-mono text-[10px] flex items-center gap-2 text-[#33ff00]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#33ff00] animate-pulse-green" />
              SELECT A MISSION TO INSPECT
            </p>
            <a
              href={ARCHIVE_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] text-[#888888] hover:text-[#33ff00] transition-colors"
            >
              <span>Explore GitHub Archive</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
          </Panel>
        </div>
      </div>

      {/* target-locked hint chip */}
      <div className="absolute bottom-10 right-10">
        <AnimatePresence mode="wait">
          {hovered && (
            <motion.div
              key={hovered.id}
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="border border-[#33ff00] bg-[#0a0a0a] px-4 py-2"
            >
              <span className="h-2 w-2 rotate-45 bg-[#33ff00]" />
              <span className="ml-2 font-mono text-[10px] uppercase text-[#33ff00]">
                Target Locked // {hovered.title}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============ 05 // MISSION BRIEFING ============ */}
      <div className="absolute inset-y-0 right-0 flex items-center">
        <div
          ref={contactRef}
          style={HIDDEN}
          className="mr-4 sm:mr-6 w-[460px] max-w-[calc(100vw-3rem)] lg:mr-24"
        >
          <Panel title="05 // MISSION BRIEFING" interactive>
            <h2 className="font-mono text-[24px] font-bold leading-[1.1] text-[#f0f0f0]">
              Let&apos;s build <span className="text-[#33ff00]">autonomous</span> systems.
            </h2>

            <p className="mt-4 text-[13px] leading-relaxed text-[#cccccc]">
              Open to opportunities in aerial robotics, autonomous systems, and embedded AI.
              Whether you have a project in mind or want to discuss engineering challenges,
              reach out directly.
            </p>

            {/* Email CTA */}
            <a
              href={`mailto:${PROFILE.email}`}
              className="mt-7 block w-full rounded border border-[#33ff00] py-3 text-center font-mono text-base font-semibold tracking-wide text-[#33ff00] hover:bg-[#33ff00] hover:text-black transition-colors"
            >
              {PROFILE.email}
              <span className="ml-2">→</span>
            </a>

            <p className="mt-3 text-center font-mono text-[9px] tracking-[0.2em] text-[#666666]">
              Opens mail app · Reply within 24h
            </p>

            <div className="mt-6 border-t border-[#33ff00]/20" />

            {/* Social Links */}
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <a
                  href={PROFILE.socials.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[#888888] hover:text-[#33ff00] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.66.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.8.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                  </svg>
                  <span className="font-mono text-xs">GitHub</span>
                </a>
                <a
                  href={PROFILE.socials.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[#888888] hover:text-[#33ff00] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
                  </svg>
                  <span className="font-mono text-xs">LinkedIn</span>
                </a>
              </div>
              <a
                href={PROFILE.resume}
                target="_blank"
                className="flex items-center gap-2 border border-[#1f521f] px-3 py-1 font-mono text-[10px] text-[#888888] hover:border-[#33ff00] hover:text-[#33ff00] transition-colors"
              >
                Resume
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
            </div>

            <p className="mt-6 pt-4 border-t border-[#33ff00]/20 font-mono text-[9px] tracking-[0.12em] text-[#555555] text-center">
              © 2026 S. SAI DINESH · ROBOTICS ENGINEER · AERIAL ROBOTICS · AUTONOMOUS SYSTEMS
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
