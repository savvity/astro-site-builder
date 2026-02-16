# Design Resources for Local Business Websites

Free UI component libraries and templates to enhance the generated site. Copy HTML directly into `.astro` files.

## Best Fit: Plain HTML + Tailwind (no framework required)

These libraries output pure HTML + Tailwind CSS classes. Components paste directly into Astro files with zero adaptation.

### HyperUI (hyperui.dev)

**Best overall for Astro sites.** Free, open source, MIT license, Tailwind v4 compatible.

- **URL**: https://www.hyperui.dev/
- **Components**: Headers, footers, cards, CTAs, marketing blocks, dashboards
- **How to use**: Browse components, click "Copy", paste into .astro file
- **Best for**: Hero sections, service cards, pricing tables, testimonial blocks

Recommended components for a local business site:
- Marketing > Banners (for hero sections)
- Marketing > Cards (for service and area cards)
- Marketing > CTAs (for phone call CTAs)
- Marketing > Footers (for the dark footer)
- Marketing > Headers (for the sticky nav)
- Marketing > Stats (for the trust signals bar)
- Marketing > Testimonials (for reviews section)

### Preline UI (preline.co)

**Largest free library.** 640+ components, 200+ layout examples, Tailwind v4 compatible.

- **URL**: https://preline.co/
- **Components**: Full page sections, navigation, forms, cards, modals
- **How to use**: Browse examples, view code, copy HTML
- **Best for**: Complete page layouts, form designs, navigation patterns

Recommended sections:
- Hero Sections (various layouts with images, gradients, split)
- Features / Services (grid layouts with icons)
- Contact Sections (form + info side by side)
- Footer Sections (multi-column dark footers)
- FAQ Sections (accordion style)

### Flowbite (flowbite.com)

**600+ components with optional JS for interactivity.**

- **URL**: https://flowbite.com/
- **Components**: All standard UI patterns plus interactive elements
- **How to use**: Copy HTML, optionally include Flowbite JS for dropdowns/modals
- **Best for**: Contact forms, dropdown menus, interactive elements

### Float UI (floatui.com)

**Clean, modern components. 100% free and open source.**

- **URL**: https://floatui.com/
- **Components**: Hero sections, pricing tables, feature grids, CTAs
- **How to use**: Browse, copy HTML
- **Best for**: Landing page hero sections, pricing comparison tables

### TailGrids (tailgrids.com)

**600+ components, marketing-focused.**

- **URL**: https://tailgrids.com/components
- **Components**: Extensive marketing and landing page components
- **How to use**: Free tier available, copy HTML
- **Best for**: Marketing page sections, testimonial carousels

### FlyonUI (flyonui.com)

**Semantic class-based Tailwind components. MIT license.**

- **URL**: https://flyonui.com/
- **Components**: Form elements, cards, navigation, alerts
- **How to use**: Install as Tailwind plugin or copy HTML patterns
- **Best for**: Form styling, alert/notification patterns

### TWComponents (creative-tim.com/twcomponents)

**Community-contributed components. 600+ entries.**

- **URL**: https://www.creative-tim.com/twcomponents
- **Components**: Community-submitted Tailwind components
- **How to use**: Browse, copy HTML
- **Best for**: Discovering creative component variations

## Design Inspiration (React-based, use for reference)

These libraries use React/Next.js. Copy the visual design and recreate in plain HTML + Tailwind for Astro.

### 21st.dev

- **URL**: https://21st.dev/
- AI-powered component marketplace
- Has an MCP server for Claude integration
- Use for design inspiration, then recreate in plain HTML

### Aceternity UI (ui.aceternity.com)

- **URL**: https://ui.aceternity.com/
- 200+ animated components with Tailwind + Framer Motion
- Beautiful effects (spotlight, sparkles, gradient borders)
- Use for animation ideas, implement with CSS @keyframes instead of Framer Motion

### Magic UI (magicui.design)

- **URL**: https://magicui.design/
- 150+ animated components, open source
- Focus on subtle, professional animations
- Use for animation patterns, recreate with CSS

### v0.dev (v0.app)

- **URL**: https://v0.app/
- AI-generated UI from text prompts
- Free tier: 200 credits/month
- Generates shadcn/ui React components
- Use for rapid prototyping, then convert to Astro HTML

## How to Use Design References with Claude Code

When giving Claude a design reference, use one of these approaches:

### Approach 1: Direct URL reference

Tell Claude: "Make my hero section look like this HyperUI component: [paste URL]"

Claude will fetch the page and adapt the HTML for your Astro site.

### Approach 2: Paste the HTML

Copy a component's HTML from any library above and tell Claude: "Use this HTML as the base for my hero section, but adapt it to use my brand colors and business data from src/data/business.ts"

### Approach 3: Describe the style

Reference a library's aesthetic: "Style the service cards like HyperUI's marketing cards with the hover lift effect and gradient accent"

## Recommended Component Mapping

For a standard local business site, here are the best components to source from each section:

| Site Section | Recommended Source | Component Type |
|---|---|---|
| Hero | HyperUI or Float UI | Marketing banner with gradient |
| Stats bar | HyperUI | Marketing stats (4 columns) |
| Service cards | HyperUI or Preline | Feature cards with icon |
| Area cards | Preline | Location cards with description |
| Contact form | Preline or Flowbite | Form with sidebar info |
| Footer | HyperUI or Preline | Multi-column dark footer |
| FAQ | Preline | Accordion or simple list |
| CTA sections | Float UI | Centered CTA with gradient BG |
| Navigation | HyperUI | Sticky header with mobile menu |
| Testimonials | HyperUI | Card grid or carousel |
