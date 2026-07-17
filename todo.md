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

- [x] **Task 10: Dark-Only Refactor & 3D Enhancement**
  - Removed `next-themes` dependency and all theme toggle logic.
  - Deleted `ThemeProvider.tsx` and `ThemeToggle.tsx`.
  - Stripped light-mode CSS overrides and `@custom-variant dark` from `globals.css`.
  - Application now permanently defaults to the Dark Slate + Neon Violet/Emerald theme.
  - Fixed project card accent highlight bar: added `overflow-hidden` to card wrapper so the top gradient bar clips cleanly to the card's `rounded-2xl` border-radius.
  - Added `Floating3DBadge` component in the Hero: continuous 3D rotateX/rotateY loop + mouse-driven spring tilt via `perspective` + `transformStyle: preserve-3d`.
  - Badge displays tech stack grid + years-of-experience metric + availability status.

- [x] **Task 11: Cinematic Scroll Interactions & 3D Section Wrappers**
  - Updated `Floating3DBadge` in Hero to display "1+ Year Exp" with "AI & Full-Stack Developer" sub-label.
  - Added `useScrollProgress` hook using Motion's `useScroll` (no raw `window.addEventListener("scroll")`).
  - Added `ScrollProgressBar` component: thin neon violet-to-emerald bar pinned at viewport top, `scaleX` driven by scroll progress, with glow via `neon-progress` CSS class.
  - Added `Section3DWrapper` component: wraps section content in `perspective: 1200` container with `whileInView` 3D fold animation (`rotateX: 12 → 0, y: 60 → 0, opacity: 0 → 1`), spring physics, `viewport={{ once: false, amount: 0.12 }}` so animation re-triggers on scroll up AND down.
  - Wired `Section3DWrapper` around main content in Skills, Projects, Playground, and Contact sections.
  - Added scroll-driven parallax to Hero ambient orbs & grid pattern via `useScroll` + `useTransform` (violet orb moves down, emerald moves up, grid shifts slowly).
  - Added GPU compositing hints in `globals.css` (`will-change`, `backface-visibility` on `.transform-gpu`).
  - All scroll animations respect `prefers-reduced-motion` via `useReducedMotion()`.
  - `ScrollProgressBar` added to `layout.tsx` above Header.

- [x] **Task 12: Scrollytelling Side Entities & Header Fix**
  - Created `ScrollyEntities.tsx`: fixed-position left/right gutter containers behind main content (`z-0`, `pointer-events-none`).
  - Each gutter holds 4 animated icon entities (Bot, Braces, Layers, Cpu on left; Code2, Zap, Network, Box on right) styled with Neon Violet/Emerald glows.
  - **Scroll-driven motion via `useScroll` + `useTransform`:**
    - Left entities drift downward (`y: 0 → 180`), rotate CW (`0 → 45deg`), fade in/out with staggered section markers.
    - Right entities drift upward (`y: 0 → -140`), rotate CCW (`0 → -90deg`), with same opacity curves.
  - Hidden on mobile (`hidden lg:block`) for performance.
  - Respects `prefers-reduced-motion` — renders nothing when reduced motion is on.
  - **Fixed header overlap:** Added `pt-20` to the Hero section so the "Available for work" badge and hero content start below the fixed header, preventing the badge from being obscured.
  - Added `ScrollyEntities` to `layout.tsx` between `ScrollProgressBar` and `Header`.

- [x] **Task 13: Immersive 3D Scrollytelling & Laptop Terminal**
  - **Upgraded Section3DWrapper**: Now supports `direction` prop (`"left"`, `"right"`, `"bottom"`) for varied 3D card-flip entrances.
    - Bottom: `rotateX: 25, z: -120, y: 100 → 0`
    - Left: `rotateY: -30, z: -150, x: -80 → 0`
    - Right: `rotateY: 30, z: -150, x: 80 → 0`
    - Perspective `1400`, spring physics, `viewport={{ once: false }}` for bi-directional trigger.
  - **Sections assigned alternating directions**: Skills (left), Projects (right), Contact (bottom), Playground (bottom).
  - **FallingEntities ("Digital Rain")**: Fixed-position background layer with 80 randomized code characters (`01{}[]();<>/\|*#@$%`) falling from top to bottom.
    - Each entity has unique: `x` position, `font-size` (0.5-1.7rem), `duration` (6-24s), `delay` (0-15s), `opacity` (0.03-0.12), `drift` horizontal wobble, and `color` (violet/emerald/muted).
    - CSS `@keyframes` injected dynamically and cleaned up on unmount.
    - `pointer-events-none z-0` so it never blocks interaction.
    - `prefers-reduced-motion` = renders nothing.
  - **3D L-Shaped Laptop Terminal (Playground rewritten)**:
    - Isometric perspective: `rotateX: -12 rotateY: 3` with `perspective: 1400` and `transformStyle: preserve-3d`.
    - Screen panel: rounded top bezel with traffic-light dots, monospace terminal output, caret input field.
    - Hinge bar connecting screen to base.
    - Base/keyboard panel: `rotateX(65deg)` to angle forward showing depth, with `bg-bg-surface/40` thickness edge.
    - **Simulated keyboard**: 5 rows of realistic keycaps (modifiers, letters, symbols, SPACE bar). Keys light up with Neon Violet glow + `scale(1.05)` on active keypress.
    - **Interactive typing glow**: `useEffect` on input change flashes the last typed character; Backspace flashes DEL; Enter flashes ENTER. Each flash auto-clears after 150-300ms.
    - **Experience badge**: "1+ Year AI & Full-Stack Dev" pill embedded on the laptop base.
  - All animations use GPU-accelerated `transform`/`opacity` only with `will-change`.
  - Added `FallingEntities` to `layout.tsx` between `ScrollProgressBar` and `ScrollyEntities`.

- [x] **Task 14: Retro All-in-One PC Terminal & Deal-from-Deck Animation**
  - **Redesigned Playground as a retro all-in-one PC:**
    - Beige/cream CRT monitor body (`bg-[#d4cbb8]`) with darker bezel frame, ventilation grille at top, and curved CRT screen area.
    - Screen shows authentic DOS-style prompt (`C:\USERS\HOANGLAM>`) with neon green input, monospace font, and subtle scanline gradient.
    - Power button with LED indicator (emerald glow when on, red when off) that toggles terminal display.
    - Brand badge "HL-2024" and "1+ Year AI & Full-Stack" experience badge on the monitor bezel.
    - Monitor stand/neck and base rendered as separate 3D elements for structural depth.
  - **Retro keyboard** (`RetroKeyboard` component): classic beige keycaps (`bg-[#e0d8cc]`) with 3D shadow effect (`shadow-[0_1px_0_#b0a89c]`), function row (F1-F12), wide modifier keys, and SPACE bar.
  - **"Deal from the Deck" 3D animation:**
    - Entire PC unit slides in from below-right: `rotateY: [-40, 0], y: [100, 0], z: [60, 0], opacity: [0, 1]`
    - `perspective: 1500` on parent container
    - Spring transition: `stiffness: 35, damping: 20, mass: 1.4` for weighty inertia
    - `viewport={{ once: false, amount: 0.15 }}` — re-triggers on scroll up AND down
    - `willChange: "transform, opacity"` for GPU acceleration
  - **Interactive keyboard glow:** Each keypress lights up the corresponding retro key with Neon Violet glow (`bg-accent-violet`, `shadow-[0_0_10px_var(--color-accent-violet)]`, `scale-[1.08]`, `-translate-y-[2px]`). BKS lights on Backspace, ENTER lights on submit, SPACE lights the space bar. Auto-clears after 150-300ms.
  - Removed `Section3DWrapper` from Playground — uses its own `whileInView` animation instead.
  - Falling entities (digital rain) already live on the page background from Task 13.

- [x] **Task 15: True CSS 3D Retro CRT Computer & Mechanical Keyboard**
  - **3D Viewport**: Entire component wrapped in `perspective: 1500` with `transformStyle: preserve-3d`. Isometric viewing angle via `rotateY(-15deg) rotateX(8deg)` so both front face, right side panel, and top panel are simultaneously visible.
  - **Multi-Layered Monitor Chassis (The CRT Box)**:
    - *Front Bezel*: Beige/cream gradient (`#dcd4c8 → #c8bfae → #b8ae9c`), 3px outer border, inner inset highlight/shadow for physical depth. 36 ventilation slots at top. Screen bezel is a dark gradient frame (`#4a4440 → #2a2420`) with inner shadow.
    - *CRT Screen*: Amber/green phosphor glow (`radial-gradient` from `#0a1a0a`), `box-shadow` inset for glass tube depth, scanline overlay (`repeating-linear-gradient`), monospace terminal with green text (`#8bff8b`) and `textShadow` glow.
    - *Right Side Panel*: 64px depth panel via `rotateY(90deg) translateZ(-32px)` with gradient shading, border, and inset shadow. Embossed "1+ YEAR EXP" and "AI & FS DEV" vertical text badges.
    - *Top Panel*: 64px depth via `rotateX(-90deg) translateZ(-32px)` showing the top surface.
    - *Left Side Panel*: 64px depth via `rotateY(-90deg) translateZ(-488px)` with darker gradient.
    - *Neck/Stand*: 80×30px pillar connecting chassis to base with beveled edges.
    - *Base Platform*: 200×14px flat pedestal with `boxShadow` for desk shadow.
  - **3D Mechanical Keyboard**:
    - Separate from monitor body (`translateZ(-10px)` to sit slightly behind in 3D space).
    - Keyboard frame tilted via `rotateX(65deg)` with `transformOrigin: top center` to show wedge-shaped thickness.
    - Bottom thickness edge rendered as a separate `rotateX(-90deg)` panel with dark gradient.
    - **3D Keycaps (`Key3D` component)**: Each key is a mini 3D block with:
      - `translateZ(7px)` popping out from the keyboard plate when inactive
      - Animated `translateZ(0)` + `y: 3` press-down when active via Framer Motion spring (`stiffness: 600, damping: 25`)
      - Side wall extrusion (`translateZ(-4px)`) for physical depth
      - Active glow ring with Neon Violet + Emerald `boxShadow`
      - Beige gradient top (`#e8e0d4 → #d4c8b8`) with 3D bevel shadow
    - **Reactive Neon Edge Lighting**: When user types, matched key `translateZ` drops to 0, background changes to purple gradient, emits `boxShadow` glow (`0 0 14px var(--color-accent-violet), 0 0 4px var(--color-accent-emerald)`), plus a bottom glow ring.
    - Six key rows including function keys, wide modifiers, and SPACE bar.
  - **Scrollytelling "Deal from the Deck"**: Entire PC model slides in with `rotateY: [-50, -15], rotateX: [5, 8], y: [120, 0], z: [80, 0], opacity: [0, 1]`, spring transition `stiffness: 35, damping: 20, mass: 1.5`, `viewport={{ once: false, amount: 0.12 }}`.
  - **CRT DOS Terminal**: `C:\>` prompt with purple accent, amber-green text, scanlines, command processing (help/about/skills/projects/contact/clear), command history with arrow keys.

- [x] **Task 16: Cinematic CRT Curvature & Phosphor Bloom Upgrade**
  - **Increased 3D Viewport**: `perspective` raised from `1500` → `1800` for deeper spatial perception.
  - **Permanent Isometric Tilt**: Static `rotateX(12deg) rotateY(-18deg)` on machine wrapper so physical thickness, top grills, and side panels are always visible — no longer an animation-only state.
  - **Curved Spherical CRT Glass Tube Screen**:
    - Deeper radial-gradient background (`#0d220d → #081408 → #020a02 → #010501`) for authentic phosphor-green tube depth.
    - `::before`-style overlay with dual radial-gradients: center-transparent / edge-dark vignette for spherical curvature, plus top-right highlight gleam for glass refraction.
    - Corner shading and heavy inner bezel shadow (80px inset) simulating physical tube depth.
  - **Phosphor Bloom & Micro-Flicker**:
    - `textShadow` triple-layer: `0 0 5px rgba(139,255,139,0.65), 0 0 12px rgba(139,255,139,0.25), 0 0 25px rgba(139,255,139,0.1)` for authentic CRT glow.
    - `@keyframes phosphorFlicker` at 6s infinite — subtle opacity dips (0.94–1.0) mimicking real phosphor persistence jitter.
    - Input caret and text also carry phosphor `textShadow` for cohesive tube rendering.
  - **Enhanced 3D Keycaps**:
    - Extrusion depth increased from `translateZ(7px)` → `translateZ(9px)` with deeper side walls (`-6px`).
    - Top-face bevel highlight via inset border (white top-left, dark right) for realistic keycap edge.
    - Switch-housing glow: when active, emits `boxShadow` `0 0 20px violet, 0 0 8px emerald, 0 4px 8px violet/40%` from beneath the keycap (`translateZ(-3px)` layer).
    - Side wall opacity transitions from 1 → 0.15 on press for physical depression depth.
  - **Scrollytelling Animation Refined**:
    - Entry: `rotateY: [-55, -18]`, `rotateX: [0, 12]`, `y: [140, 0]`, `z: [100, 0]`.
    - Spring physics: `stiffness: 40, damping: 18, mass: 1.6` for heavier, more cinematic inertia.
    - `viewport={{ once: false, amount: 0.12 }}` — bi-directional trigger confirmed.
  - **Retro Typography**: Monospace `C:\>` prompt in `#c4b5fd` (lavender), amber-green phosphor output (`#8bff8b`), retro keyboard labels in `var(--font-mono)` for authentic DOS-era feel.
  - Build verified: `npm run build` → clean compile, zero hydration mismatches, full static prerender.
