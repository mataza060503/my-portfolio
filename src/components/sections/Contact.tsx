"use client";

import { useState, useRef, useActionState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Send, Check, AlertCircle, MapPin, Mail, BookOpen, X } from "lucide-react";
import Section3DWrapper from "@/components/Section3DWrapper";
import { sendEmail, type ContactFormState } from "@/app/actions/sendEmail";

/* ============================================
   Inline brand SVGs
   ============================================ */

function GithubIcon({ size = 18 }: { size?: number }) {
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

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/* ============================================
   Contact Section
   ============================================ */

const initialState: ContactFormState = { success: false, message: "" };

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, formAction, pending] = useActionState(sendEmail, initialState);
  const [toast, setToast] = useState<ContactFormState | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Show toast when state changes (after action completes)
  useEffect(() => {
    if (state.message) {
      setToast(state);
      if (state.success) {
        setForm({ name: "", email: "", message: "" });
      }
    }
  }, [state]);

  const dismissToast = useCallback(() => setToast(null), []);

  const isValid = form.name && form.email && form.message;

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-6"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-emerald/20 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <Section3DWrapper direction="bottom">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-accent-emerald-light mb-3">
            Get in Touch
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary">
            Let&rsquo;s{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald-light to-accent-violet-light">
              Connect
            </span>
          </h2>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-5">
          {/* Left — Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <p className="text-text-secondary leading-relaxed">
                I&rsquo;m currently open to full-time AI Software Engineer roles,
                freelance projects, and collaborations. If you&rsquo;re looking for
                someone who bridges enterprise manufacturing systems with
                modern AI — let&rsquo;s talk.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-text-secondary">
                <Mail size={16} className="text-accent-violet-light shrink-0" />
                <span className="text-sm">liamvo0605.work@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <MapPin size={16} className="text-accent-emerald-light shrink-0" />
                <span className="text-sm">Dong Nai, Vietnam</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <BookOpen size={16} className="text-accent-violet-light shrink-0" />
                <span className="text-sm">TOEIC 765/990 (R&amp;L) · 300/400 (S&amp;W)</span>
              </div>
            </div>

            {/* Social buttons */}
            <div className="flex gap-3">
              <a
                href="https://github.com/mataza060503"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-bg-tertiary bg-bg-secondary/60 px-5 py-3 text-sm font-medium text-text-primary backdrop-blur transition-all hover:border-accent-violet/40 hover:text-accent-violet-light hover:shadow-lg hover:shadow-accent-violet/10"
              >
                <GithubIcon size={18} />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/l%C3%A2m-v%C3%B5-4716a1252/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-bg-tertiary bg-bg-secondary/60 px-5 py-3 text-sm font-medium text-text-primary backdrop-blur transition-all hover:border-accent-emerald/40 hover:text-accent-emerald-light hover:shadow-lg hover:shadow-accent-emerald/10"
              >
                <LinkedinIcon size={18} />
                LinkedIn
              </a>
            </div>
          </motion.div>

          {/* Right — Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <form
              action={formAction}
              className="rounded-2xl border border-bg-tertiary/60 bg-bg-secondary/50 backdrop-blur p-6 sm:p-8 space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-text-secondary mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-bg-tertiary bg-bg-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-accent-violet/50 focus:ring-2 focus:ring-accent-violet/10"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text-secondary mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-bg-tertiary bg-bg-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-accent-violet/50 focus:ring-2 focus:ring-accent-violet/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project or opportunity..."
                  className="w-full rounded-xl border border-bg-tertiary bg-bg-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all resize-none focus:border-accent-violet/50 focus:ring-2 focus:ring-accent-violet/10"
                />
              </div>

              <button
                type="submit"
                disabled={!isValid || pending}
                className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                  pending
                    ? "bg-accent-violet/60 text-white/80 cursor-wait"
                    : isValid
                      ? "bg-accent-violet text-white shadow-lg shadow-accent-violet/20 hover:bg-accent-violet-light active:scale-95"
                      : "bg-bg-tertiary/50 text-text-muted cursor-not-allowed"
                }`}
              >
                {pending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
        </Section3DWrapper>
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium shadow-2xl backdrop-blur-md max-w-sm w-[calc(100%-2rem)] sm:w-auto"
            style={{
              background: toast.success
                ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))"
                : "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))",
              borderColor: toast.success
                ? "rgba(52,211,153,0.35)"
                : "rgba(248,113,113,0.35)",
            }}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                toast.success
                  ? "bg-accent-emerald/20 text-accent-emerald-light"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {toast.success ? <Check size={16} /> : <AlertCircle size={16} />}
            </span>
            <span className="text-text-primary">{toast.message}</span>
            <button
              onClick={dismissToast}
              className="ml-1 shrink-0 rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
