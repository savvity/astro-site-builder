---
name: astro-local-business
description: This skill should be used when the user asks to "build a local business website", "create a service area website", "add programmatic SEO pages", "create an Astro site for a plumber", "build a contractor website", "generate service-area combination pages", "add more service areas", "add a new service type", "fix Astro 5 build errors", "fix Tailwind v4 issues", or works with Astro 5 + Tailwind CSS v4 for local service businesses. Provides code patterns, data architecture, design system knowledge, and deployment guidance for generating 100+ page programmatic SEO sites.
---

# Astro Local Business Site Architecture

Generate programmatic SEO websites for local service businesses using Astro 5 + Tailwind CSS v4 + Cloudflare Pages.

## Core Concept

Two data dimensions multiplied into combination pages:

```
ServiceAreas x ServiceTypes = Combination Pages
```

10 areas x 8 services = 80 combo pages + 10 area pages + 8 service pages + 4 static = 102 total pages. Each combination page targets a unique long-tail keyword like "drain cleaning in Round Rock TX".

## Tech Stack

- **Astro 5** with `output: 'static'` (default)
- **Tailwind CSS v4** configured entirely via CSS `@theme` (no JS config)
- **Cloudflare Pages** with adapter for SSR API routes
- **Resend** for contact form email delivery
- Dependencies: `@astrojs/cloudflare @astrojs/sitemap @tailwindcss/vite tailwindcss`
- No React, no icon library, no typography plugin

## File Architecture

```
src/data/business.ts           Business name, phone, address, hours, license
src/data/serviceAreas.ts       Geographic locations (first dimension)
src/data/serviceTypes.ts       Service offerings (second dimension)
src/lib/urls.ts                URL builder functions
src/styles/global.css          Tailwind v4 design system via @theme
src/layouts/BaseLayout.astro   HTML shell with head, Google Fonts, nav, footer
src/components/Header.astro    Sticky nav with phone CTA, mobile menu
src/components/Footer.astro    Dark footer with service/area links
src/components/Schema.astro    Reusable JSON-LD structured data wrapper
src/pages/index.astro          Homepage with hero, stats, grids
src/pages/services/index.astro         All services listing
src/pages/services/[service].astro     Individual service page
src/pages/areas/index.astro            All areas listing
src/pages/areas/[area].astro           Individual area page
src/pages/services/[area]/[service].astro   THE KEY FILE (combo pages)
src/pages/about.astro          Company story, trust signals
src/pages/contact.astro        Form with vanilla JS handler
src/pages/api/contact.ts       SSR route (prerender = false)
```

## URL Pattern

```
/services/{area-slug}/{service-slug}/
```

Example: `/services/round-rock/drain-cleaning/`

All links use helper functions from `src/lib/urls.ts`:
- `serviceUrl(slug)` returns `/services/{slug}/`
- `areaUrl(slug)` returns `/areas/{slug}/`
- `comboUrl(areaSlug, serviceSlug)` returns `/services/{areaSlug}/{serviceSlug}/`

## Critical Astro 5 + Tailwind v4 Rules

For the full list of gotchas with examples, read `references/astro5-gotchas.md`. The top rules:

1. **No tailwind.config.js.** All config via CSS `@theme` directive.
2. **@utility CANNOT have :hover.** Put hover states in `@layer components`.
3. **output: 'hybrid' removed.** Use `output: 'static'` with per-route `prerender = false`.
4. **Environment variables:** `import.meta.env.X`, not `process.env.X`.
5. **SSR routes:** `export const prerender = false` at file top.
6. **Cloudflare Pages:** Set `NODE_VERSION=22` in environment variables.
7. **Cloudflare adapter** required even for mostly-static sites with any SSR route.

## Code Patterns

For complete code templates with full file contents, read `references/code-patterns.md`. Key patterns:

- **getStaticPaths nested loop** for generating all area x service combinations
- **SSR API route** for contact form with Resend email, XSS prevention, graceful fallback
- **BaseLayout** with meta tags, Open Graph, Google Fonts
- **Data file interfaces** with helper functions (getBySlug, getNearby)
- **FAQ generation** varying by area, service, emergency flag, price range
- **Schema.astro** reusable component for JSON-LD structured data

## JSON-LD Schema Markup

For structured data templates, read `references/schema-patterns.md`. Every page should include appropriate schema:

- **LocalBusiness** on homepage, about, contact (with industry-specific `@type`)
- **Service** on service pages and combo pages (with `areaServed`)
- **FAQPage** on combo pages and area pages
- **BreadcrumbList** on all pages with breadcrumb navigation
- **WebSite** on homepage only

Use Astro's `set:html={JSON.stringify(data)}` pattern for JSON-LD to avoid double-escaping.

## Industry Color Palettes

Pre-built palettes in `assets/color-palettes.json` for: plumber (blue), electrician (amber), hvac (teal), landscaper (green), roofer (red), contractor (slate), cleaning (purple).

## Design Reference Libraries

For browsing free UI components to enhance the design, consult `references/design-resources.md`. Top recommendations:
- **HyperUI** (hyperui.dev): Plain HTML + Tailwind v4 components, paste directly into .astro files
- **Preline UI** (preline.co): 640+ free components, Tailwind v4 compatible

## AI Image Generation

The `/generate-images` command uses the nano-banana-pro skill (Gemini 3 Pro Image API) to create:
- **Hero image** (`public/images/hero.webp`): Professional scene matching the industry and city
- **Service images** (`public/images/services/{slug}.webp`): One per service type
- **Area images** (`public/images/areas/{slug}.webp`): Cityscape or landmark per area

All images are generated at 2K resolution and converted to WebP. Requires the nano-banana-pro skill at `~/.claude/skills/nano-banana-pro/`.

## Contact Form Pattern

The SSR API route template is in `assets/contact-api.ts`. Key elements:
- `export const prerender = false` (makes it server-rendered on Cloudflare edge)
- Input validation with `validateContact()`
- XSS prevention with `escapeHtml()`
- Resend API call via native `fetch()`
- HTML email template with inline styles
- Graceful fallback when `RESEND_API_KEY` is not set (logs to console, returns success)
- Local dev secrets in `.dev.vars`, production secrets in Cloudflare dashboard

## Deployment Checklist

1. `git add -A && git commit -m "Complete site"`
2. Push to GitHub: `gh repo create {name} --public --push --source=.`
3. Cloudflare: Workers & Pages > Create > Pages > Connect to Git
4. Settings: Framework preset "Astro", build command `npm run build`, output `dist`
5. Environment variables: `NODE_VERSION=22`, `RESEND_API_KEY=re_xxxxx`
6. Save and Deploy

## Page Count Formula

```
(areas x services) + areas + services + 4 static = total pages

 6 x  5 =  30 + 15 =  45 pages
10 x  8 =  80 + 22 = 102 pages
12 x 10 = 120 + 26 = 146 pages
15 x 12 = 180 + 31 = 211 pages
```
