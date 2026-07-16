"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import {
  ExternalLink,
  FlaskConical,
  ChevronDown,
} from "lucide-react";

/* Inline GitHub SVG (lucide doesn't ship brand icons) */
function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/* ============================================
   Project Data
   ============================================ */

interface ProjectLink {
  label: string;
  href: string;
  icon: "github" | "external" | "research";
}

interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  achievements: string[];
  tags: string[];
  links: ProjectLink[];
  accent: "violet" | "emerald";
}

const PROJECTS: Project[] = [
  {
    id: "uel-genai",
    title: "UEL Generative AI Retrieval System",
    tagline: "Graduation Thesis & Published Research",
    description:
      "Enterprise-scale AI-powered document retrieval platform combining semantic search and LLMs to deliver accurate, context-aware answers from university knowledge bases.",
    achievements: [
      "PDF ingestion pipeline: parsing → chunking → embeddings → semantic search",
      "REST APIs (Django) + conversational AI interface (Angular)",
      "Improved answer accuracy via prompt engineering & retrieval optimization",
      "Published research paper",
    ],
    tags: ["LangChain", "OpenAI GPT", "Pinecone", "Django", "Angular", "RAG"],
    links: [
      { label: "Frontend", href: "https://github.com/mataza060503/UEL_GenAI", icon: "github" },
      { label: "Backend", href: "https://github.com/mataza060503/UEL_GenAI_BE", icon: "github" },
      { label: "Research", href: "https://ebl.vnuhcmjournal.com.vn/index.php/ebl/article/view/1597", icon: "research" },
    ],
    accent: "violet",
  },
  {
    id: "wms",
    title: "Warehouse Management System Modernization",
    tagline: "React + Flutter + RFID",
    description:
      "Modernized a legacy WMS with a React web dashboard and a Flutter mobile app featuring real-time RFID barcode scanning for inventory operations.",
    achievements: [
      "Cross-platform mobile RFID barcode scanning",
      "Real-time stock synchronization across web & mobile",
      "Role-based dashboards for warehouse operators & managers",
    ],
    tags: ["React", "Flutter", "RFID", "REST API"],
    links: [],
    accent: "emerald",
  },
  {
    id: "tpm",
    title: "Total Productive Maintenance System",
    tagline: "Built from scratch — React, Flutter, Python",
    description:
      "Designed and built a TPM system from the ground up, collaborating directly with manufacturing users to define workflows and technical requirements.",
    achievements: [
      "End-to-end ownership: requirements → architecture → deployment",
      "Maintenance scheduling & downtime tracking engine",
      "PM reporting dashboard with data visualization",
    ],
    tags: ["React", "Flutter", "Python", "Django"],
    links: [],
    accent: "violet",
  },
  {
    id: "vnc-helper",
    title: "VNC Helper Desktop App",
    tagline: ".NET remote support tool",
    description:
      "A lightweight .NET desktop tool for remote monitoring and troubleshooting of factory PCs, streamlining IT support across the manufacturing floor.",
    achievements: [
      "Simplified remote support workflow using TightVNC integration",
      "Centralized factory PC management dashboard",
    ],
    tags: [".NET", "TightVNC"],
    links: [
      { label: "Source Code", href: "https://github.com/mataza060503/VNCManagerView", icon: "github" },
    ],
    accent: "emerald",
  },
];

/* ============================================
   Filter tags (derived)
   ============================================ */

const FILTERS = [
  { id: "all", label: "All" },
  { id: "React", label: "React / Next.js" },
  { id: "Django", label: "Django / Python" },
  { id: "Flutter", label: "Flutter" },
  { id: ".NET", label: ".NET" },
  { id: "RAG", label: "AI / RAG" },
];

function filterProjects(projects: Project[], filter: string): Project[] {
  if (filter === "all") return projects;
  return projects.filter(
    (p) =>
      p.tags.some((t) => t.toLowerCase() === filter.toLowerCase()) ||
      p.tags.some((t) => filter.toLowerCase().includes(t.toLowerCase().replace(" / ", ""))),
  );
}

/* ============================================
   Icon helpers
   ============================================ */

function linkIcon(icon: ProjectLink["icon"]) {
  if (icon === "github") return GithubIcon;
  if (icon === "research") return FlaskConical;
  return ExternalLink;
}

/* ============================================
   Project Card
   ============================================ */

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const borderGlow =
    project.accent === "violet"
      ? "hover:border-accent-violet/40 hover:shadow-accent-violet/10"
      : "hover:border-accent-emerald/40 hover:shadow-accent-emerald/10";

  const badgeBg =
    project.accent === "violet"
      ? "bg-accent-violet/15 text-accent-violet-light border-accent-violet/20"
      : "bg-accent-emerald/15 text-accent-emerald-light border-accent-emerald/20";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`group relative flex flex-col rounded-2xl border border-bg-tertiary/60 bg-bg-secondary/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${borderGlow}`}
    >
      {/* Accent top bar */}
      <div
        className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl ${
          project.accent === "violet"
            ? "bg-gradient-to-r from-accent-violet to-accent-violet-light"
            : "bg-gradient-to-r from-accent-emerald to-accent-emerald-light"
        }`}
      />

      {/* Tagline badge */}
      <div className="mb-3 mt-1">
        <span className={`inline-block rounded-full border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeBg}`}>
          {project.tagline}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-text-primary group-hover:text-white transition-colors">
        {project.title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm text-text-secondary leading-relaxed">
        {project.description}
      </p>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-accent-violet-light transition-colors self-start"
      >
        {expanded ? "Show less" : "Key achievements"}
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>

      {/* Expandable achievements */}
      <AnimatePresence>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            {project.achievements.map((a, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-2 text-sm text-text-secondary"
              >
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    project.accent === "violet" ? "bg-accent-violet" : "bg-accent-emerald"
                  }`}
                />
                {a}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Tags */}
      <div className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="inline-block rounded-md border border-bg-tertiary/70 bg-bg-tertiary/40 px-2.5 py-0.5 text-[11px] font-medium text-text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Links */}
      {project.links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 pt-4 border-t border-bg-tertiary/50">
          {project.links.map((link) => {
            const LinkIcon = linkIcon(link.icon);
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-violet-light hover:text-accent-violet-glow transition-colors"
              >
                <LinkIcon size={14} />
                {link.label}
              </a>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ============================================
   Projects Section
   ============================================ */

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("all");
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const displayedProjects = filterProjects(PROJECTS, activeFilter);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-6"
    >
      {/* Background accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-emerald/20 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-accent-emerald-light mb-3">
            Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
            Featured{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald-light to-accent-violet-light">
              Projects
            </span>
          </h2>
        </motion.div>

        {/* Filter tags */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          {/* Desktop filters */}
          <div className="hidden sm:flex justify-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeFilter === f.id
                    ? "text-white bg-accent-emerald/15 border border-accent-emerald/40 shadow-[0_0_16px_rgba(16,185,129,0.12)]"
                    : "text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-tertiary/40"
                }`}
              >
                {f.label}
                {activeFilter === f.id && (
                  <motion.div
                    layoutId="projectFilterIndicator"
                    className="absolute inset-0 rounded-xl bg-accent-emerald/5 border border-accent-emerald/25"
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Mobile scrollable filters */}
          <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeFilter === f.id
                    ? "text-white bg-accent-emerald/15 border border-accent-emerald/40"
                    : "text-text-secondary border border-transparent hover:text-text-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Project grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-6 sm:grid-cols-2"
          >
            {displayedProjects.length > 0 ? (
              displayedProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-text-muted text-sm">
                No projects match this filter.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
