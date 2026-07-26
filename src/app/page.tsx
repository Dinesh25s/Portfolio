"use client";

import { useEffect, useState } from "react";
import { initSmoothScroll, scrollToSection } from "@/lib/scroll";
import { useUIStore } from "@/lib/store";
import { PROJECTS, EXPERIENCE, PROFILE, SITE_URL, SKILLS } from "@/lib/data";
import Navbar from "@/components/dom/Navbar";
import ProjectModal from "@/components/dom/ProjectModal";
import HeroBackground from "@/components/dom/HeroBackground";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

const TABS = ["ALL", "AERIAL", "AUTONOMY", "VISION", "EMBEDDED", "SIMULATION"] as const;

export default function Home() {
  const [fontsReady, setFontsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("ALL");
  const setSelectedProject = useUIStore((s) => s.setSelectedProject);

  useEffect(() => {
    const cleanup = initSmoothScroll();
    let alive = true;
    document.fonts.ready.then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
      cleanup();
    };
  }, []);

  const filteredProjects = activeTab === "ALL"
    ? PROJECTS
    : PROJECTS.filter(p => {
        const tags = p.tags.map(t => t.toLowerCase());
        switch (activeTab) {
          case "AERIAL":
            return tags.includes("uav") || tags.includes("drone") || tags.includes("jetson") || tags.includes("px4") || tags.includes("ardupilot") || p.meta.toLowerCase().includes("aerial");
          case "AUTONOMY":
            return tags.includes("mpc") || tags.includes("pid") || tags.includes("ekf") || tags.includes("sensor fusion") || tags.includes("state estimation") || tags.includes("trajectory") || tags.includes("path planning");
          case "VISION":
            return tags.includes("opencv") || tags.includes("yolo") || tags.includes("cv") || tags.includes("apriltag") || tags.includes("slam") || tags.includes("detection") || tags.includes("tracking");
          case "EMBEDDED":
            return tags.includes("jetson") || tags.includes("raspberry") || tags.includes("embedded") || tags.includes("linux") || tags.includes("c++") || tags.includes("python");
          case "SIMULATION":
            return tags.includes("gazebo") || tags.includes("sitl") || tags.includes("hitl") || tags.includes("carmaker") || tags.includes("simulation") || tags.includes("monte carlo");
          default:
            return true;
        }
      });

  return (
    <main className="relative min-h-screen">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 bg-dot-pattern opacity-30 pointer-events-none" aria-hidden />

      {/* Fixed Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroBackground />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          <div className="mb-4">
            <span className="section-label">{PROFILE.status}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            {PROFILE.name}
          </h1>
          <p className="text-xl md:text-2xl text-[#9aa0a6] mb-8 max-w-2xl mx-auto leading-relaxed">
            Building <span className="text-[#00b4d8]">autonomous aerial systems</span> that operate reliably in contested, GPS-denied, and dynamic environments.
          </p>
          <p className="text-base text-[#6b7280] mb-12 max-w-xl mx-auto">
            Robotics Software Engineer specializing in sensor fusion, flight control, and defense-grade UAS. Currently at Arka Aerospace developing interception drones with multi-sensor fusion and MPC trajectory tracking.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button type="button" onClick={() => scrollToSection('projects')} className="btn-primary">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              View My Work
            </button>
            <button type="button" onClick={() => scrollToSection('experience')} className="btn-secondary">
              Explore Experience
            </button>
            <button type="button" onClick={() => scrollToSection('contact')} className="btn-secondary">
              Get In Touch
            </button>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[#4a5568]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="section-label">01 // THE ENGINEER</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">
              Engineering <span className="text-[#00b4d8]">intelligent machines</span> that move through the real world
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <p className="text-lg leading-relaxed text-[#9aa0a6] mb-6">
                {PROFILE.about.lead}
              </p>
              <p className="text-base leading-relaxed text-[#6b7280] mb-6">
                {PROFILE.about.p2}
              </p>
              <p className="text-base leading-relaxed text-[#6b7280]">
                {PROFILE.about.p3}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-[#121821] p-6 border border-[#2d3748]">
                <h4 className="font-mono text-sm text-[#00b4d8] uppercase tracking-wider mb-4">Core Competencies</h4>
                <div className="flex flex-wrap gap-2">
                  {["Aerial Robotics", "Sensor Fusion", "State Estimation", "Trajectory Planning", "Flight Control", "Embedded AI", "Computer Vision", "Real-Time Systems"].map(skill => (
                    <span key={skill} className="px-3 py-1 text-xs font-mono bg-[#1a202a] border border-[#2d3748] text-[#9aa0a6]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#121821] p-4 border border-[#2d3748]">
                  <div className="text-3xl font-bold text-[#00b4d8] mb-1">3+</div>
                  <div className="text-sm text-[#6b7280]">Years Experience</div>
                </div>
                <div className="bg-[#121821] p-4 border border-[#2d3748]">
                  <div className="text-3xl font-bold text-[#00b4d8] mb-1">6</div>
                  <div className="text-sm text-[#6b7280]">Major Projects</div>
                </div>
                <div className="bg-[#121821] p-4 border border-[#2d3748]">
                  <div className="text-3xl font-bold text-[#00b4d8] mb-1">10+</div>
                  <div className="text-sm text-[#6b7280]">Technologies</div>
                </div>
                <div className="bg-[#121821] p-4 border border-[#2d3748]">
                  <div className="text-3xl font-bold text-[#00b4d8] mb-1">100%</div>
                  <div className="text-sm text-[#6b7280]">Autonomous Focus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-24 px-4 relative border-t border-[#2d3748]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="section-label">02 // OPERATIONS LOG</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-2">Professional Flight Path</h2>
            <p className="text-[#9aa0a6]">Career trajectory in aerial robotics and autonomous systems</p>
          </div>

          <div className="space-y-8">
            {EXPERIENCE.map((job, idx) => (
              <div key={job.company} className="relative pl-8 border-l-2 border-[#2d3748]">
                {/* Timeline dot */}
                <div className="absolute -left-[8px] top-0 w-4 h-4 rounded-full bg-[#00b4d8] border-2 border-[#0a0f14]" />

                <div className={`${idx === 0 ? 'opacity-100' : 'opacity-80'} transition-opacity hover:opacity-100`}>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="font-mono text-xs text-[#00b4d8]">{job.range}</span>
                    <span className="text-sm text-[#6b7280]">•</span>
                    <span className="text-sm text-[#9aa0a6]">{job.location}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                  <div className="text-lg text-[#00b4d8] mb-4">@{job.company}</div>
                  <p className="text-[#9aa0a6] mb-4 leading-relaxed">{job.blurb}</p>

                  <ul className="space-y-3">
                    {job.points.map(point => (
                      <li key={point} className="flex gap-3 text-sm text-[#9aa0a6]">
                        <span className="mt-1 flex-shrink-0">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="2" fill="currentColor" className="text-[#00b4d8]" />
                          </svg>
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 px-4 relative border-t border-[#2d3748]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="section-label">03 // SYSTEMS ONLINE</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-2">Engineering Stack</h2>
            <p className="text-[#9aa0a6]">Technologies and frameworks powering autonomous systems</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SKILLS.map((skill, idx) => (
              <div key={skill.name} className="bg-[#121821] p-6 border border-[#2d3748] hover:border-[#00b4d8] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#1a202a] border border-[#2d3748] text-sm font-mono text-[#00b4d8]">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3 className="font-semibold text-lg">{skill.name}</h3>
                </div>
                <p className="font-mono text-sm text-[#9aa0a6] leading-relaxed">{skill.items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 px-4 relative border-t border-[#2d3748]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="section-label">04 // MISSION ARCHIVE</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">Active Missions</h2>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all border ${
                    activeTab === tab
                      ? 'bg-[#00b4d8] text-[#0a0f14] border-[#00b4d8]'
                      : 'bg-transparent text-[#9aa0a6] border-[#2d3748] hover:border-[#00b4d8]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} onClick={() => setSelectedProject(project.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 relative border-t border-[#2d3748]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="section-label">05 // MISSION BRIEFING</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6">
            Let&apos;s Build <span className="text-[#00b4d8]">Autonomous Systems</span>
          </h2>
          <p className="text-lg text-[#9aa0a6] mb-12 max-w-2xl mx-auto leading-relaxed">
            Open to opportunities in aerial robotics, autonomous systems, and embedded AI.
            Whether you have a project in mind or want to discuss engineering challenges,
            reach out directly.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
            <a href={`mailto:${PROFILE.email}`} className="btn-primary w-full sm:w-auto">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m22 7-10 5L2 7" />
              </svg>
              {PROFILE.email}
            </a>
            <a href={PROFILE.socials.github} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full sm:w-auto">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.17-.02-2.12-3.338.724-4.042-1.61-4.042-1.61-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.73.12 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.66.41.36.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.21.69.8.57C19.56 21.94 23.5 17.55 23.5 12.3c0-6.61-5.37-12-12-12"/>
              </svg>
              GitHub
            </a>
            <a href={PROFILE.socials.linkedin} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full sm:w-auto">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
              </svg>
              LinkedIn
            </a>
            <a href={PROFILE.resume} target="_blank" className="btn-secondary w-full sm:w-auto">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Resume
            </a>
          </div>

          <p className="font-mono text-xs text-[#6b7280]">
            © 2026 S. SAI DINESH · ROBOTICS ENGINEER · AERIAL ROBOTICS · AUTONOMOUS SYSTEMS
          </p>
        </div>
      </section>

      {/* Project Modal */}
      <ProjectModal />

      {/* Footer spacer */}
      <div className="h-32" />
    </main>
  );
}

function ProjectCard({ project, onClick }: { project: typeof PROJECTS[0]; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-[#121821] border border-[#2d3748] hover:border-[#00b4d8] transition-all overflow-hidden"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`View project: ${project.title}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs text-[#00b4d8]">{project.meta.split('·')[0].trim()}</span>
          {project.featured && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#1a202a] border border-[#2d3748] text-[#9aa0a6]">FEATURED</span>
          )}
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-[#00b4d8] transition-colors">{project.title}</h3>
        <p className="text-sm text-[#9aa0a6] mb-4 italic">{project.tagline}</p>
        <p className="text-sm text-[#6b7280] mb-6 line-clamp-3 leading-relaxed">{project.description}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.slice(0, 4).map(tag => (
            <span key={tag} className="px-2 py-1 text-[10px] font-mono bg-[#1a202a] border border-[#2d3748] text-[#8a94a6]">
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="px-2 py-1 text-[10px] font-mono text-[#6b7280]">+{project.tags.length - 4} more</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#2d3748]">
          <span className="text-sm font-mono text-[#00b4d8] group-hover:underline">VIEW_DETAILS →</span>
        </div>
      </div>
    </div>
  );
}
