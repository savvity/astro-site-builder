---
name: add-blog
description: Add a blog with Astro content collections to an existing local business website. Creates the content collection config, blog layout, listing page, and a sample post.
---

# Add a Blog

Add a blog section to the site using Astro 5 content collections. This creates the content infrastructure and a sample post.

## Process

1. **Verify context**: Check that `astro.config.mjs` exists and uses the Astro 5 pattern. If not, inform the user this command requires an existing Astro 5 site.

2. **Ask one question** using AskUserQuestion:

   - **Blog focus**: What will the blog cover?
     Options: "How-to guides and tips", "Local area news and seasonal content", "Project showcases and case studies", "Mix of everything (Recommended)"

3. **Generate these files**:

   **a. `src/content.config.ts`** (Astro 5 content collection config):
   ```ts
   import { defineCollection, z } from 'astro:content';
   import { glob } from 'astro/loaders';

   const blog = defineCollection({
     loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
     schema: z.object({
       title: z.string(),
       description: z.string(),
       date: z.date(),
       author: z.string().default('Staff Writer'),
       tags: z.array(z.string()).default([]),
       draft: z.boolean().default(false),
     }),
   });

   export const collections = { blog };
   ```

   **b. `src/content/blog/`** directory with 1 sample post as a markdown file. The post should be relevant to the business industry and local area. Include proper frontmatter.

   **c. `src/pages/blog/index.astro`**: Blog listing page showing all published posts sorted by date, with title, description, date, and tags. Use BaseLayout.

   **d. `src/pages/blog/[...slug].astro`**: Individual blog post page using `getCollection('blog')` and `render()` from `astro:content`. Use BaseLayout. Include:
   - Post title as H1
   - Date and author
   - Tags as badges
   - Prose content with basic styling
   - CTA section at the bottom
   - Back to blog link

4. **Update navigation**: Add a "Blog" link to the Header component's nav items.

5. **Build and report**:
   ```
   npm run build
   ```
   Report the new page count.

## Important Astro 5 Notes

- Content collections in Astro 5 use `src/content.config.ts` (not `src/content/config.ts`)
- Use `render()` imported from `astro:content`, NOT `entry.render()`
- Use the `glob` loader pattern for local markdown files
- Blog posts go in `src/content/blog/` as `.md` files with YAML frontmatter
