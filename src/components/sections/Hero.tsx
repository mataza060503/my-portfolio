"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
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

/* ============================================
   3D Floating Badge — cinematic continuous
   rotation + mouse-driven tilt
   ============================================ */

function Floating3DBadge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const nx = (e.clientX - centerX) / (rect.width / 2);
      const ny = (e.clientY - centerY) / (rect.height / 2);
      setTilt({ x: -ny * 12, y: nx * 12 });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative"
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          animate={{
            y: [0, -14, 0],
            rotateX: [0, 8, -6, 0],
            rotateY: [0, 10, -8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut",
          }}
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-3 rounded-3xl bg-accent-violet/10 blur-2xl" />

          {/* The badge card */}
          <div className="relative rounded-2xl border border-accent-violet/30 bg-bg-secondary/80 backdrop-blur-xl px-6 py-5 shadow-2xl shadow-accent-violet/10">
            {/* Inner highlight */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-violet/5 to-transparent" />

            <div className="relative flex items-center gap-4">
              {/* Tech stack icon grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {["React", "Django", "Flutter", ".NET"].map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center justify-center rounded-lg bg-bg-tertiary/70 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent-violet-light border border-accent-violet/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-accent-violet/30 to-transparent" />

              {/* Metric */}
              <div className="text-center">
                <div className="text-3xl font-bold text-text-primary tracking-tight">
                  1<span className="text-accent-violet-light">+</span>
                </div>
                <div className="text-[10px] font-medium uppercase tracking-widest text-text-muted mt-0.5 leading-tight">
                  Year Exp
                </div>
                <div className="text-[9px] font-medium text-accent-violet-light/70 mt-0.5 leading-tight max-w-[100px]">
                  AI &amp; Full-Stack Developer
                </div>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="relative mt-4 pt-3 border-t border-bg-tertiary/40">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald animate-pulse" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-accent-emerald-light">
                  Open to work
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ============================================
   Hero Section
   ============================================ */

export default function Hero() {
  const typedText = useTypewriter({ texts: TITLES });
  const heroRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Scroll-driven parallax for ambient orbs
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const orbVioletY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const orbEmeraldY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const orbScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 0.9]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  const scrollTo = useCallback((href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden px-6 pt-[65px]"
    >
      {/* Background ambient orbs — parallax driven */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent-violet/10 blur-[120px]"
          style={{
            y: reduce ? 0 : orbVioletY,
            scale: reduce ? 1 : orbScale,
            willChange: "transform",
          }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-accent-emerald/8 blur-[100px]"
          style={{
            y: reduce ? 0 : orbEmeraldY,
            scale: reduce ? 1 : orbScale,
            willChange: "transform",
          }}
        />
      </div>

      {/* Decorative grid pattern — parallax */}
      <motion.div
        className="absolute inset-0 dot-grid"
        style={{
          y: reduce ? 0 : gridY,
          backgroundImage:
            "radial-gradient(circle, var(--color-bg-surface) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          willChange: "transform",
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

        {/* 3D Floating Tech Badge */}
        <motion.div
          variants={itemVariants}
          className="mt-12"
        >
          <Floating3DBadge />
        </motion.div>

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
