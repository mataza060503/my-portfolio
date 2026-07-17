"use client";

import { motion } from "framer-motion";
import { ArrowDown, Mail, FolderGit2 } from "lucide-react";
import { useTypewriter } from "@/hooks/useTypewriter";

const TITLES = [
  "AI Software Engineer",
  "Full-Stack Developer",
  "Enterprise Systems Builder",
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function Hero() {
  const typedText = useTypewriter({ texts: TITLES });

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-6"
    >
      {/* Background ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent-violet/10 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-accent-emerald/8 blur-[100px]" />
      </div>

      {/* Decorative grid pattern (subtle) */}
      <div
        className="absolute inset-0 dot-grid"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-bg-surface) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center max-w-3xl"
      >
        {/* Greeting badge */}
        <motion.div variants={itemVariants}>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-violet/30 bg-accent-violet/10 px-4 py-1.5 text-xs font-medium text-accent-violet-light tracking-wider uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-emerald opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-emerald" />
            </span>
            Available for work
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={itemVariants}
          className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary"
        >
          Hi, I&rsquo;m{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-violet-light via-accent-violet to-accent-emerald-light">
            Hoang Lam
          </span>
        </motion.h1>

        {/* Typewriter */}
        <motion.div
          variants={itemVariants}
          className="mt-6 h-10 sm:h-12 flex items-center"
        >
          <span className="text-xl sm:text-2xl lg:text-3xl font-medium text-text-secondary">
            {typedText}
          </span>
          <span className="ml-1 w-0.5 h-6 sm:h-8 bg-accent-violet animate-pulse rounded-full" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="mt-6 max-w-xl text-base sm:text-lg text-text-secondary leading-relaxed"
        >
          I build AI-powered enterprise apps, modernize manufacturing systems
          (WMS/TPM/PMS), and ship full-stack solutions with React, Django,
          .NET &amp; Flutter.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => scrollTo("#projects")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-violet px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-violet/25 transition-all hover:bg-accent-violet-light hover:shadow-accent-violet-light/30 active:scale-95"
          >
            <FolderGit2 size={18} />
            View Projects
          </button>
          <button
            onClick={() => scrollTo("#contact")}
            className="inline-flex items-center gap-2 rounded-xl border border-bg-surface bg-bg-secondary/60 px-6 py-3 text-sm font-semibold text-text-primary backdrop-blur transition-all hover:border-accent-violet/40 hover:text-accent-violet-light active:scale-95"
          >
            <Mail size={18} />
            Get in Touch
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={itemVariants}
          className="mt-20 sm:mt-24"
        >
          <button
            onClick={() => scrollTo("#skills")}
            className="flex flex-col items-center gap-2 text-text-muted hover:text-accent-violet-light transition-colors group cursor-pointer"
            aria-label="Scroll to skills"
          >
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown size={18} />
            </motion.span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
