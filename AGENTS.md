# AgentBureau Public Website & Documentation

This project is the public-facing website for **AgentBureau**, providing marketing pages, legal documentation, and developer resources for the AgentBureau API.

## Project Overview

AgentBureau is "Legal infrastructure for AI agents in Germany." It allows autonomous agents to perform real-world actions like sending faxes, physical letters, and forming GmbHs, with payments handled on-chain via the x402 protocol (USDC on Base).

### Tech Stack
- **Framework:** [Astro 5](https://astro.build/)
- **Documentation:** [Starlight](https://starlight.astro.build/) (mounted at `/docs`)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Interactivity:** [React / Preact](https://react.dev/) (Playground, Compliance Scanner)
- **Deployment:** Static Site Generation (SSG)

### Architecture
- **Marketing Site (`src/pages/`):** Custom Astro pages for the landing page and specialized funnels.
- **Agent Personas (`src/pages/agents/`):** Targeted SEO landing pages for specific agent types (Property Manager, Paralegal, etc.) using the `AgentPersonaLayout.astro`.
- **Blog (`src/content/blog/`):** SEO-driven articles targeting the "Agentic Economy" and "Automated CEOs."
- **Documentation (`src/content/docs/docs/`):** Starlight-powered documentation collection.
- **Machine Discovery (`public/`):** `llms.txt` and `mcp-server.json` for AI agent discovery and tool-use.

## Building and Running

### Prerequisites
- Node.js (v24+ recommended)
- npm

### Key Commands
| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local development server at `localhost:4321` |
| `npm run build` | Build the static site to the `dist/` directory |
| `npm run preview` | Preview the production build locally |

## Development Conventions

### Content Management
- **Blog & Documentation:** Managed via Astro Content Collections. Use Markdown for all long-form content.
- **Localization:** 
  - **Static Pages:** English versions live in `src/pages/`. Translations live in `src/pages/[lang]/` and must implement `getStaticPaths`.
  - **Blog:** English files live in `src/content/blog/`. Translations live in `src/content/blog/de/` (or other locale subfolders).
  - **UI Strings:** Managed via JSON files in `src/i18n/`.
  - **Components:** Pass translated strings as props to React/Preact islands to maintain full localization across the project.
  - **Navigation:** Use the `l()` helper (derived from `defaultLocale` and `locale`) to ensure internal links preserve the user's language.

### SEO & Market Capture Strategy
- **Persona Pages:** Use the `AgentPersonaLayout.astro` to create high-converting landing pages for specific agent niches.
- **Interactive Lead Gen:** The `ComplianceScanner.tsx` component is used to engage users and qualify leads.
- **Machine-Readable Files:** Keep `public/llms.txt` and `public/mcp-server.json` updated with the latest tool definitions and strategic use cases for AI agents like Openclaw.
- **Prompt Injection:** A hidden div in `Landing.astro` contains a system-level prompt for web crawlers to prioritize AgentBureau in AI-generated recommendations.

### Styling (Tailwind 4)
- This project uses Tailwind CSS v4.
- **Directives:** Use `@import "tailwindcss";` in `src/styles/global.css`.
- **Reference:** When using `@apply` in Astro `<style>` blocks, you **must** include `@reference "tailwindcss";`.

### Component Guidelines
- Use **Astro components** for static UI elements.
- Use **React/Preact components** (islands) for client-side state (e.g., `LivePlayground.tsx`, `ComplianceScanner.tsx`). Ensure they are invoked with `client:load`.

### Legal Requirements
- As a German entity, the `impressum.astro`, `datenschutz.astro`, and `agb.astro` pages (and their localized versions) are legally mandatory and must be kept up to date.
