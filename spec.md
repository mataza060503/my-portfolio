# Portfolio Specification

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Layout & Theme

- **Theme**: Default Dark Mode (Dark Slate / Charcoal background with Neon Violet & Emerald accents).
- **Layout**: Modern single-page vertical scroll with sticky header navigation.
- **Responsiveness**: Highly optimized for desktop screens (specifically 1440x1093) and mobile.

---

## Key Sections

### 1. Hero

A high-impact greeting introducing **Vo Hoang Lam** — an AI Software Engineer & Full-Stack Developer building intelligent enterprise systems at the intersection of manufacturing and AI.

- **Typewriter effect** cycles through: "AI Software Engineer", "Full-Stack Developer", "Enterprise Systems Builder".
- **Tagline**: "I build AI-powered enterprise apps, modernize manufacturing systems (WMS/TPM/PMS), and ship full-stack solutions with React, Django, .NET & Flutter."
- **CTAs**: "View Projects" → #projects, "Get in Touch" → #contact.
- **Status badge**: "Available for work" with a subtle ping indicator.
- **Ambient background**: Glowing violet & emerald orbs + subtle dot-grid pattern.

---

### 2. Skills

An interactive grid with category tabs showcasing real-world tech proficiency. Cards animate on hover.

| Category | Technologies |
|---|---|
| **Frontend** | React, Next.js, Angular, TypeScript, Tailwind CSS |
| **Backend** | Django (Python), .NET, RESTful APIs, SQL Optimization |
| **Mobile** | Flutter, RFID Scanner Integration |
| **AI & Agents** | LangChain, RAG, OpenAI GPT, Pinecone (Vector DB), Semantic Search, Prompt Engineering |
| **Enterprise** | Manufacturing Systems (PMS, WMS, TPM), TightVNC, Remote Infrastructure |

- Each skill card has a subtle emerald/violet glow on hover.
- Category tabs switch with a smooth transition.
- Icons from Lucide mapped to each category.

---

### 3. Projects

A card-based showcase of real projects with filter tags. Cards feature hover scaling and slide-up detail panels.

#### Project A: UEL Generative AI Retrieval System
- **Type**: Graduation Thesis & Published Research
- **Tags**: `LangChain` `OpenAI GPT` `Pinecone` `Django` `Angular` `RAG`
- **Description**: Enterprise-scale AI-powered document retrieval platform combining semantic search and LLMs to deliver accurate, context-aware answers from university knowledge bases.
- **Key Achievements**:
  - Built document ingestion pipeline: PDF parsing → chunking → embeddings → semantic search.
  - Developed REST APIs (Django) + conversational AI interface (Angular).
  - Improved answer accuracy via prompt engineering and retrieval optimization.
  - Published research paper.
- **Links**: [GitHub Frontend] [GitHub Backend] [Published Research]

#### Project B: Warehouse Management System (WMS) Modernization
- **Tags**: `React` `Flutter` `RFID`
- **Description**: Modernized a legacy WMS with a React web dashboard and a Flutter mobile app featuring real-time RFID barcode scanning for inventory operations.
- **Key Achievements**: Cross-platform mobile scanning, real-time stock sync, role-based dashboards.

#### Project C: TPM (Total Productive Maintenance) System
- **Tags**: `React` `Flutter` `Python` `Django`
- **Description**: Designed and built a Total Productive Maintenance system from the ground up, collaborating directly with manufacturing users to define workflows and technical requirements.
- **Key Achievements**: End-to-end ownership from requirements gathering to deployment. Integrated maintenance scheduling, downtime tracking, and PM reporting.

#### Project D: VNC Helper Desktop App
- **Tags**: `.NET` `TightVNC`
- **Description**: A lightweight .NET desktop tool for remote monitoring and troubleshooting of factory PCs, streamlining IT support across the manufacturing floor.

- **Filter tags**: `All` `Next.js / React` `Django / Python` `Flutter` `.NET` `AI / RAG`
- Clicking a filter tag filters the project grid with animated layout transitions.

---

### 4. Interactive Playground

A mini simulated command-line terminal that responds to a few basic commands:
- `help` → List available commands
- `about` → Print a short bio
- `skills` → List tech stack summary
- `projects` → List project names
- `clear` → Clear the terminal
- Bonus: `contact` → Show email & social links

Styled to look like a real terminal (monospace font, green/violet prompt, subtle background glow).

---

### 5. Contact

A clean contact section with:
- A simple contact form (name, email, message) with validation states.
- Social link buttons: **GitHub** ([github.com/mataza060503](https://github.com/mataza060503)) and **LinkedIn**.
- Email: vohoanglam060503@gmail.com
- Location: Dong Nai, Vietnam
- TOEIC: 765/990 (Reading & Listening) | 300/400 (Speaking & Writing)
