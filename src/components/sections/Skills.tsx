"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import Section3DWrapper from "@/components/Section3DWrapper";
import {
  Code2,
  Globe,
  Braces,
  Palette,
  Server,
  Terminal,
  Database,
  Network,
  Smartphone,
  TabletSmartphone,
  Scan,
  GitBranch,
  Box,
  Bot,
  Brain,
  Cpu,
  Layers,
} from "lucide-react";

/* ============================================
   Skill Data — grouped by category
   ============================================ */

interface Skill {
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: "violet" | "emerald";
}

interface SkillCategory {
  id: string;
  label: string;
  skills: Skill[];
}

const CATEGORIES: SkillCategory[] = [
  {
    id: "frontend",
    label: "Frontend",
    skills: [
      { name: "Next.js", icon: Globe, color: "violet" },
      { name: "React", icon: Code2, color: "emerald" },
      { name: "TypeScript", icon: Braces, color: "violet" },
      { name: "Tailwind CSS", icon: Palette, color: "emerald" },
      { name: "Angular", icon: Layers, color: "violet" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    skills: [
      { name: "Django", icon: Server, color: "emerald" },
      { name: "Python", icon: Terminal, color: "violet" },
      { name: "SQL", icon: Database, color: "emerald" },
      { name: "RESTful APIs", icon: Network, color: "violet" },
      { name: ".NET", icon: Cpu, color: "emerald" },
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    skills: [
      { name: "Flutter", icon: Smartphone, color: "violet" },
      { name: "Android", icon: TabletSmartphone, color: "emerald" },
      { name: "RFID Scanning", icon: Scan, color: "violet" },
    ],
  },
  {
    id: "tools",
    label: "Tools & AI",
    skills: [
      { name: "Git", icon: GitBranch, color: "emerald" },
      { name: "Nix / Home-Manager", icon: Box, color: "violet" },
      { name: "LangChain & RAG", icon: Brain, color: "emerald" },
      { name: "AI Agentic Workflows", icon: Bot, color: "violet" },
      { name: "Prompt Engineering", icon: Terminal, color: "emerald" },
    ],
  },
];

/* ============================================
   Skill Card
   ============================================ */

function SkillCard({
  skill,
  index,
}: {
  skill: Skill;
  index: number;
}) {
  const Icon = skill.icon;
  const glow =
    skill.color === "violet"
      ? "group-hover:shadow-accent-violet/20 group-hover:border-accent-violet/40"
      : "group-hover:shadow-accent-emerald/20 group-hover:border-accent-emerald/40";

  const iconGlow =
    skill.color === "violet"
      ? "text-accent-violet-light group-hover:text-accent-violet-glow group-hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
      : "text-accent-emerald-light group-hover:text-accent-emerald-glow group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`group relative flex flex-col items-center gap-3 rounded-2xl border border-bg-tertiary/60 bg-bg-secondary/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-bg-surface hover:bg-bg-secondary hover:shadow-lg ${glow}`}
    >
      {/* Subtle corner accent */}
      <div
        className={`absolute top-0 right-0 h-12 w-12 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          skill.color === "violet"
            ? "bg-accent-violet/5"
            : "bg-accent-emerald/5"
        }`}
      />

      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary/60 transition-all duration-300 group-hover:scale-110 group-hover:bg-bg-tertiary`}
      >
        <Icon size={22} className={`transition-all duration-300 ${iconGlow}`} />
      </div>

      <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors duration-300">
        {skill.name}
      </span>
    </motion.div>
  );
}

/* ============================================
   Skills Section
   ============================================ */

export default function Skills() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const activeCategory = CATEGORIES.find((c) => c.id === activeTab)!;

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-6"
    >
      {/* Background accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-violet/20 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <Section3DWrapper direction="left">
          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-accent-violet-light mb-3">
              Tech Stack
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
              Skills &amp;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-violet-light to-accent-emerald-light">
                Expertise
              </span>
            </h2>
          </motion.div>

          {/* Category tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10"
          >
            {/* Desktop tabs */}
            <div className="hidden sm:flex justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === cat.id
                      ? "text-white bg-accent-violet/20 border border-accent-violet/40 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                      : "text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-tertiary/40"
                  }`}
                >
                  {cat.label}
                  {activeTab === cat.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 rounded-xl bg-accent-violet/10 border border-accent-violet/30"
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile scrollable tabs */}
            <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === cat.id
                      ? "text-white bg-accent-violet/20 border border-accent-violet/40"
                      : "text-text-secondary border border-transparent hover:text-text-primary"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Skill grid */}
          <div className="min-h-[240px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
              >
                {activeCategory.skills.map((skill, i) => (
                  <SkillCard key={skill.name} skill={skill} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </Section3DWrapper>
      </div>
    </section>
  );
}
