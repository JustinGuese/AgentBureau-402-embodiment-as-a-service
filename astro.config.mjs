// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://agentbureau.de',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'fr', 'es', 'zh'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [
    starlight({
      title: 'AgentBureau Docs',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/JustinGuese/website-openclawgatewaycompanyapi' }
      ],
      sidebar: [
        {
          label: 'Quickstart',
          translations: {
            de: 'Schnellstart',
            fr: 'Démarrage rapide',
            es: 'Inicio rápido',
            zh: '快速开始'
          },
          link: '/docs/quickstart',
        },
        {
          label: 'For Agents',
          translations: {
            de: 'Für Agenten',
            fr: 'Pour les agents',
            es: 'Para agentes',
            zh: '面向智能体'
          },
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
          translations: {
            de: 'Für Entwickler',
            fr: 'Pour les développeurs',
            es: 'Para desarrolladores',
            zh: '面向开发者'
          },
          items: [
            { label: 'REST API Reference', slug: 'docs/for-developers/rest-api-reference' },
            { label: 'Authentication', slug: 'docs/for-developers/authentication' },
            { label: 'Dry-run Probes', slug: 'docs/for-developers/dry-run-probes' },
            { label: 'Idempotency', slug: 'docs/for-developers/idempotency' },
          ],
        },
        {
          label: 'Code Examples',
          translations: {
            de: 'Codebeispiele',
            fr: 'Exemples de code',
            es: 'Ejemplos de código',
            zh: '代码示例'
          },
          autogenerate: { directory: 'docs/for-developers/code-examples' },
        },
        {
          label: 'Services',
          translations: {
            de: 'Dienste',
            fr: 'Services',
            es: 'Servicios',
            zh: '服务'
          },
          autogenerate: { directory: 'docs/services' },
        },
        {
          label: 'Legal',
          translations: {
            de: 'Rechtliches',
            fr: 'Juridique',
            es: 'Legal',
            zh: '法律'
          },
          autogenerate: { directory: 'docs/legal' },
        },
        {
          label: 'Changelog',
          translations: {
            de: 'Changelog',
            fr: 'Journal des modifications',
            es: 'Registro de cambios',
            zh: '更新日志'
          },
          link: '/docs/changelog',
        },
      ],
    }), sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
});