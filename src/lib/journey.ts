/**
 * Journey map — section definitions for scroll-driven navigation.
 *
 * Minimal, DOM-only. All 3D scene infrastructure removed.
 */

export const TOTAL_PAGES = 10; // page height = TOTAL_PAGES * 100vh

export const SECTIONS = [
  { id: "hero", label: "Home", range: [0.0, 0.1] },
  { id: "launch", label: "Deploy", range: [0.1, 0.19] },
  { id: "about", label: "About", range: [0.19, 0.34] },
  { id: "experience", label: "Work", range: [0.34, 0.5] },
  { id: "skills", label: "Systems", range: [0.5, 0.62] },
  { id: "projects", label: "Missions", range: [0.62, 0.8] },
  { id: "contact", label: "Contact", range: [0.8, 1.0] },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

/** Given a progress value (0..1), return the current section id. */
export function sectionAt(p: number): SectionId {
  for (const s of SECTIONS) {
    if (p <= s.range[1]) return s.id;
  }
  return "contact";
}

/** Progress within a section (0..1), clamped. */
export function sectionProgress(p: number, id: SectionId): number {
  const s = SECTIONS.find((x) => x.id === id)!;
  return Math.min(1, Math.max(0, (p - s.range[0]) / (s.range[1] - s.range[0])));
}

/** Scroll progress value to navigate to a section (entry point). */
export function sectionAnchor(id: SectionId): number {
  const s = SECTIONS.find((x) => x.id === id)!;
  if (id === "hero") return 0;
  if (id === "contact") return 1;
  return s.range[0] + (s.range[1] - s.range[0]) * 0.45;
}
