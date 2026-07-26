"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PROJECTS } from "@/lib/data";
import { useUIStore } from "@/lib/store";

export default function ProjectModal() {
  const selectedProject = useUIStore((s) => s.selectedProject);
  const setSelectedProject = useUIStore((s) => s.setSelectedProject);

  const project = selectedProject ? (PROJECTS.find(p => p.id === selectedProject) ?? null) : null;

  useEffect(() => {
    if (!selectedProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProject(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProject, setSelectedProject]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[#0a0f14]/90 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-[#121821] border border-[#2d3748] shadow-2xl flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#2d3748] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-xs text-[#00b4d8]">MISSION</span>
                <span className="text-[#6b7280]">•</span>
                <span className="font-mono text-xs text-[#9aa0a6]">{project.id.toUpperCase().replace(/-/g, '_')}</span>
              </div>
              <h2 className="text-2xl font-bold text-[#e8eaed]">{project.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="p-2 text-[#6b7280] hover:text-[#e8eaed] transition-colors"
              aria-label="Close mission"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[#6b7280]">TIMELINE:</span>
                <span className="font-mono text-[#9aa0a6]">{project.meta}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#6b7280]">TAGLINE:</span>
                <span className="text-[#00b4d8] italic">{project.tagline}</span>
              </div>
            </div>

            {/* Mission Brief */}
            <section>
              <h3 className="text-lg font-semibold text-[#e8eaed] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00b4d8]" />
                MISSION BRIEF
              </h3>
              <p className="text-[#9aa0a6] leading-relaxed">{project.description}</p>
            </section>

            {/* System Architecture */}
            <section>
              <h3 className="text-lg font-semibold text-[#e8eaed] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00b4d8]" />
                SYSTEM ARCHITECTURE
              </h3>
              <div className="bg-[#0a0f14] p-4 border border-[#2d3748] rounded">
                <div className="flex flex-wrap justify-center items-center gap-2 font-mono text-xs text-[#9aa0a6]">
                  <span className="px-3 py-2 bg-[#1a202a] border border-[#2d3748]">Sensors</span>
                  <span className="text-[#4a5568]">→</span>
                  <span className="px-3 py-2 bg-[#1a202a] border border-[#2d3748]">Perception</span>
                  <span className="text-[#4a5568]">→</span>
                  <span className="px-3 py-2 bg-[#1a202a] border border-[#2d3748]">State Estimation</span>
                  <span className="text-[#4a5568]">→</span>
                  <span className="px-3 py-2 bg-[#1a202a] border border-[#2d3748]">Planning</span>
                  <span className="text-[#4a5568]">→</span>
                  <span className="px-3 py-2 bg-[#1a202a] border border-[#2d3748]">Control</span>
                  <span className="text-[#4a5568]">→</span>
                  <span className="px-3 py-2 bg-[#1a202a] border border-[#2d3748] text-[#00b4d8]">Actuation</span>
                </div>
              </div>
            </section>

            {/* Technology Stack */}
            <section>
              <h3 className="text-lg font-semibold text-[#e8eaed] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00b4d8]" />
                TECHNOLOGY STACK
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 text-xs font-mono bg-[#1a202a] border border-[#2d3748] text-[#9aa0a6]">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Key Contributions */}
            <section>
              <h3 className="text-lg font-semibold text-[#e8eaed] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00b4d8]" />
                KEY CONTRIBUTIONS
              </h3>
              <ul className="space-y-3">
                {project.description.split('.').filter(s => s.trim()).slice(0, 5).map((sentence, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-[#9aa0a6]">
                    <span className="mt-1 flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="2" fill="currentColor" className="text-[#00b4d8]" />
                      </svg>
                    </span>
                    <span className="leading-relaxed">{sentence.trim()}.</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Results */}
            {!project.link && (
              <section>
                <h3 className="text-lg font-semibold text-[#e8eaed] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00b4d8]" />
                  OUTCOMES
                </h3>
                <p className="text-sm text-[#9aa0a6] leading-relaxed">
                  Successfully deployed and tested in real-world environments. System demonstrated reliable performance under varying conditions and met all autonomy requirements.
                </p>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#2d3748] flex items-center justify-between bg-[#0a0f14]">
            <span className="font-mono text-xs text-[#6b7280]">MISSION_ID: {project.id.toUpperCase()}</span>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-mono border border-[#2d3748] hover:border-[#00b4d8] hover:text-[#00b4d8] text-[#9aa0a6] transition-colors"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.17-.02-2.12-3.338.724-4.042-1.61-4.042-1.61-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.73.12 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.66.41.36.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.21.69.8.57C19.56 21.94 23.5 17.55 23.5 12.3c0-6.61-5.37-12-12-12"/>
                </svg>
                VIEW SOURCE
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
