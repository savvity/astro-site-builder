# Astro 5 + Tailwind CSS v4 + Cloudflare Gotchas

Every pitfall listed here was discovered through real production issues. Check this list before generating any code.

## Tailwind CSS v4

### 1. No tailwind.config.js

Tailwind v4 has no JavaScript config file. All configuration lives in CSS:

```css
/* CORRECT: v4 config in CSS */
@import "tailwindcss";

@theme {
  --color-brand-500: #3b82f6;
  --font-display: 'DM Serif Display', 'Georgia', serif;
}
```

```js
// WRONG: there is no tailwind.config.js in v4
module.exports = { theme: { extend: { colors: { brand: '#3b82f6' } } } }
```

### 2. @utility CANNOT have pseudo-selectors

This is the most common mistake. `@utility` directives do not support `:hover`, `::after`, `:focus`, or any other pseudo-selector.

```css
/* WRONG: will silently fail or error */
@utility card-hover {
  transition: transform 0.3s;
}
@utility card-hover:hover {
  transform: translateY(-4px);
}

/* CORRECT: use @layer components for pseudo-selectors */
@layer components {
  .card-hover {
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px -8px rgba(0, 0, 0, 0.12);
  }
}
```

### 3. space-y-* unreliable for large values

In Tailwind v4, `space-y-16` and other large space values can behave inconsistently. Use explicit margins:

```html
<!-- UNRELIABLE in v4 -->
<div class="space-y-16">
  <section>...</section>
  <section>...</section>
</div>

<!-- RELIABLE alternative -->
<div>
  <section>...</section>
  <section class="mt-16">...</section>
</div>
```

### 4. Typography plugin uses @plugin, not JS config

If using the typography plugin (not required for the basic site builder):

```css
/* CORRECT: v4 plugin syntax */
@plugin "@tailwindcss/typography";

/* WRONG: there is no JS config to add plugins to */
```

### 5. @theme auto-generates utility classes

Declaring a variable in `@theme` automatically creates Tailwind utilities:

```css
@theme {
  --color-brand-500: #3b82f6;
}
/* This auto-generates: bg-brand-500, text-brand-500, border-brand-500, etc. */
```

### 6. @import must be first

The `@import "tailwindcss"` directive must be the first line in the CSS file (before any other rules or imports).

## Astro 5

### 7. output: 'hybrid' removed

Astro 5 removed the `hybrid` output mode. Use `static` (the default) with per-route SSR:

```js
// CORRECT: Astro 5
export default defineConfig({
  output: 'static', // default, can be omitted
});

// In the SSR route file:
export const prerender = false; // this single line makes it server-rendered
```

```js
// WRONG: does not exist in Astro 5
export default defineConfig({
  output: 'hybrid',
});
```

### 8. Content collections config location

Astro 5 uses `src/content.config.ts` (not `src/content/config.ts`):

```ts
// CORRECT location: src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
```

### 9. Content collection render()

In Astro 5, use `render()` from `astro:content`, not `entry.render()`:

```ts
// CORRECT
import { render } from 'astro:content';
const { Content } = await render(entry);

// WRONG (old API)
const { Content } = await entry.render();
```

### 10. Type imports

Use `import type` for type-only imports:

```ts
// CORRECT
import type { GetStaticPaths } from 'astro';
import type { APIRoute } from 'astro';

// WRONG (will work but wastes bundle)
import { GetStaticPaths } from 'astro';
```

## Cloudflare Pages

### 11. NODE_VERSION environment variable

Astro 5 requires Node 22+. Cloudflare defaults to an older version. Always set:

| Variable | Value |
|----------|-------|
| NODE_VERSION | 22 |

Without this, the build will fail with syntax errors or module resolution failures.

### 12. Cloudflare adapter required for SSR

Even if 99% of the site is static, the `@astrojs/cloudflare` adapter is needed if any route has `prerender = false`:

```js
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  adapter: cloudflare(),
});
```

### 13. Environment variables: import.meta.env

Astro uses `import.meta.env`, not `process.env`:

```ts
// CORRECT
const apiKey = import.meta.env.RESEND_API_KEY;

// WRONG (will be undefined in Cloudflare Pages)
const apiKey = process.env.RESEND_API_KEY;
```

### 14. Local secrets in .dev.vars

Cloudflare's convention for local development secrets is `.dev.vars` (not `.env`):

```
# .dev.vars (add to .gitignore)
RESEND_API_KEY=re_your_key_here
```

Production secrets go in the Cloudflare Pages dashboard: Settings > Environment variables.

### 15. Build output directory

Cloudflare Pages build output for Astro is `dist` (not `build` or `public`):

| Setting | Value |
|---------|-------|
| Framework preset | Astro |
| Build command | npm run build |
| Build output | dist |

## SSR API Routes

### 16. prerender = false placement

The `export const prerender = false` must be at the top of the file, before any other exports:

```ts
// CORRECT: at the top
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // ...
};
```

### 17. Response format

SSR routes must return a `Response` object:

```ts
// CORRECT
return new Response(JSON.stringify({ ok: true }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
});

// WRONG (will error)
return { ok: true };
```

### 18. XSS in email templates

Always escape user input before putting it in HTML email templates:

```ts
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

## General

### 19. Trailing slashes

Configure trailing slashes for consistent canonicalization:

```js
export default defineConfig({
  trailingSlash: 'always',
});
```

This ensures `/services/round-rock/drain-cleaning/` is canonical, not the version without trailing slash.

### 20. Google Fonts loading

Use `preconnect` for optimal font loading:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap"
  rel="stylesheet"
/>
```
