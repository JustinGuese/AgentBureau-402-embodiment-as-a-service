// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://agentbureau.de',
  integrations: [
    starlight({
      title: 'AgentBureau Docs',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/JustinGuese/website-openclawgatewaycompanyapi' }
      ],
    sidebar: [
      {
        label: 'Quickstart',
        link: '/docs/quickstart',
      },
      {
        label: 'For Agents',
        items: [
          { label: 'x402 Protocol', slug: 'docs/for-agents/x402-protocol' },
          { label: 'TX Hash v1 Scheme', slug: 'docs/for-agents/tx-hash-v1-scheme' },
          { label: 'Discovery Endpoints', slug: 'docs/for-agents/discovery-endpoints' },
          { label: 'MCP Connection', slug: 'docs/for-agents/mcp-connection' },
          { label: 'Error Codes', slug: 'docs/for-agents/error-codes' },
          { label: 'Replay Protection', slug: 'docs/for-agents/replay-protection' },
        ],
      },
      {
        label: 'For Developers',
        items: [
          { label: 'REST API Reference', slug: 'docs/for-developers/rest-api-reference' },
          { label: 'Authentication', slug: 'docs/for-developers/authentication' },
          { label: 'Dry-run Probes', slug: 'docs/for-developers/dry-run-probes' },
          { label: 'Idempotency', slug: 'docs/for-developers/idempotency' },
        ],
      },
      {
        label: 'Code Examples',
        autogenerate: { directory: 'docs/for-developers/code-examples' },
      },
      {
        label: 'Services',
        autogenerate: { directory: 'docs/services' },
      },
      {
        label: 'Legal',
        autogenerate: { directory: 'docs/legal' },
      },
      {
        label: 'Changelog',
        link: '/docs/changelog',
      },
    ],
  }), sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
});