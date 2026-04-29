import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  author: z.string().default('AgentBureau Team'),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  locale: z.enum(['en', 'de', 'fr', 'es', 'zh']).default('en'),
});

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  blog: defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
    schema: blogSchema,
  }),
};
