# AgentBureau Public Website & Documentation

This project is the public-facing website for **AgentBureau**, providing marketing pages, legal documentation, and developer resources for the AgentBureau API.

## Project Overview

AgentBureau is "Legal infrastructure for AI agents in Germany." It allows autonomous agents to perform real-world actions like sending faxes, physical letters, and forming GmbHs, with payments handled on-chain via the x402 protocol (USDC on Base).

### Tech Stack
- **Framework:** [Astro 5](https://astro.build/)
- **Documentation:** [Starlight](https://starlight.astro.build/) (mounted at `/docs`)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Interactivity:** [React](https://react.dev/) (used for the API Playground)
- **Deployment:** Static Site Generation (SSG)

### Architecture
- **Marketing Site (`src/pages/`):** Custom Astro pages for the landing page, SEO-optimized service pages (GmbH formation, Invoice API, etc.), and legal pages.
- **Documentation (`src/content/docs/docs/`):** Starlight-powered documentation collection covering the x402 protocol, agent integration guides, and service references.
- **Components (`src/components/`):** Shared UI components including the `LivePlayground` React island.
- **Layouts (`src/layouts/`):** `Landing.astro` for marketing pages and `Legal.astro` for text-heavy legal documents.

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
- **Documentation:** All documentation files reside in `src/content/docs/docs/`. Starlight is configured to serve them under the `/docs` path.
- **SEO Pages:** German-language SEO pages in `src/pages/` (e.g., `gmbh-gruenden.astro`) should follow the established structure: H1 matching search intent, comparison tables, and dual CTAs (Playground/Docs).

### Styling (Tailwind 4)
- This project uses Tailwind CSS v4.
- **Directives:** Use `@import "tailwindcss";` in `src/styles/global.css`.
- **Reference:** When using `@apply` in Astro `<style>` blocks, you **must** include `@reference "tailwindcss";` to avoid build errors.

### Component Guidelines
- Use **Astro components** for static UI elements.
- Use **React components** (islands) only where client-side state or complex interactivity is required (e.g., `LivePlayground.tsx`). Ensure they are invoked with `client:load` or similar directives.

### Legal Requirements
- As a German entity, the `impressum.astro`, `datenschutz.astro`, and `agb.astro` pages are legally mandatory and must be kept up to date with valid company information.

