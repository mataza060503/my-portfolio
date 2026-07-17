# Portfolio Implementation Checklist

- [x] **Task 1: Project Scaffolding & Initial Setup**
  - Run the CLI command to initialize a Next.js project in the current folder:
    `npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"`
  - Install additional dependencies: `framer-motion`, `lucide-react`.
  - Clean up default boilerplate code (e.g., in `src/app/page.tsx` and `src/app/globals.css`).

- [x] **Task 2: Tailwind & Theme Configuration**
  - Configure `tailwind.config.ts` to support the custom color theme (Dark Slate/Charcoal background, Neon Violet and Emerald accents).
  - Add standard custom responsive breakpoints and layout shells (Sidebar/Header).

- [x] **Task 3: Build Section 1 - Hero Section**
  - Create the Hero component with a responsive layout.
  - Integrate a smooth typing effect for the introduction text.
  - Apply entrance animations using Framer Motion.

- [x] **Task 4: Build Section 2 - Skills Showcase**
  - Design an interactive, modular grid or a tabbed layout to list tech categories (Frontend, Backend, Mobile, Tools/AI).
  - Add smooth hover transitions and category-switching logic.

- [x] **Task 5: Build Section 3 - Projects Showcase**
  - Implement a card-based project section.
  - Include project cards featuring detailed interactions (e.g., hover scaling, slide-up details).
  - Add filter buttons to sort projects by tech stack (Next.js, Django, Flutter).

- [x] **Task 6: Build Section 4 - Interactive Terminal/Playground & Contact**
  - Add a mini simulated command-line terminal interface that accepts a few basic commands (e.g., `help`, `about`, `skills`, `clear`).
  - Build the contact form component alongside sleek social link buttons.

- [x] **Task 7: Complete Responsiveness & Layout Testing**
  - Rigorously check and adjust Tailwind spacing and containers for large screens (1440x1093) to avoid clipping.
  - Finalize mobile view drawer navigation and vertical fallback layout for mobile devices.

- [x] **Task 8: Dark/Light Mode — Custom Implementation (REPLACED)**
  - ~~Custom ThemeProvider with context + localStorage + system preference detection.~~
  - ~~Light theme CSS variable overrides via `[data-theme="light"]`.~~
  - ~~Sun/moon toggle button in the header.~~
  - **Replaced by Task 10 (next-themes migration).**

- [x] **Task 9: Social Links, README & Git Push**
  - Verified GitHub and LinkedIn links across all components.
  - Wrote a professional README.md with badges, features, projects, and setup guide.
  - Configured git remote, committed, and pushed to `main` on GitHub.

- [x] **Task 10: next-themes Migration & Theme Toggle**
  - Installed `next-themes` for robust system-preference detection and localStorage persistence.
  - Added `@custom-variant dark (&:where(.dark, .dark *));` for Tailwind v4 class-based dark mode.
  - Flipped CSS variable strategy: dark values on `:root` (default), light overrides via `html:not(.dark)`.
  - Replaced custom `ThemeProvider` with `next-themes` `ThemeProvider` (attribute="class", defaultTheme="dark").
  - Created `ThemeToggle.tsx` with Framer Motion animated Sun/Moon icon swap (rotate + scale spring).
  - Updated `Header.tsx` to use the new `ThemeToggle` component.
