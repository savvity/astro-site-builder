---
name: build-site
description: Build a complete local service business website with 100+ programmatic SEO pages using Astro 5 + Tailwind CSS v4 + Cloudflare Pages. Includes a working contact form with Resend email.
---

# Build a Local Business Website

Build a complete programmatic SEO website for a local service business. The site generates 50-200+ pages from two data dimensions (service areas x service types), each targeting a unique long-tail keyword.

## Step 1: Gather Business Details

Use AskUserQuestion to collect information in two rounds.

**Round 1** (ask these 3 questions together):

1. **Industry**: What type of business is this for?
   - Options: "Plumber", "Electrician", "HVAC", "Landscaper", "Roofer", "Cleaning Service"
   - Allow "Other" for custom input

2. **City/Metro**: What city or metro area does the business serve?
   - Free text. Examples: "Austin TX", "Denver CO", "Phoenix AZ"

3. **Business name**: What is the business called?
   - Free text. Examples: "Austin Pro Plumbing", "Spark Electric Co"

**Round 2** (ask these 3 questions together):

4. **Scale: Services**: How many service types to include?
   - Options: "6-8 services (~60 combo pages)", "10-12 services (~100+ combo pages)", "15+ services (~150+ combo pages)"

5. **Scale: Areas**: How many service areas to include?
   - Options: "6-8 areas", "10-12 areas", "15+ areas"

6. **Design style**: What visual direction?
   - Options: "Clean & minimal (Recommended)", "Bold & modern", "Classic & professional"

## Step 2: Confirm Before Building

After collecting all answers, summarize back to the user:

```
Here's what I'll build:

  Business: {name} ({industry})
  Location: {city}
  Services: {count} service types
  Areas: {count} service areas
  Pages: ~{areas x services + areas + services + 4} total
  Design: {style} with {industry color} brand colors
  Contact form: Resend email integration

I'll generate ~20 files and run the build. This takes about 2-3 minutes.
Ready to go?
```

Wait for confirmation before proceeding.

## Step 3: Generate the Site

Use the **site-architect** agent to generate the complete site. Pass all collected business details to the agent.

The agent handles the full workflow:
1. Scaffold the Astro project
2. Install dependencies (only 4 packages: @astrojs/cloudflare, @astrojs/sitemap, @tailwindcss/vite, tailwindcss)
3. Generate all config, data, component, and page files
4. Add the contact form SSR API route
5. Add robots.txt, .dev.vars, .gitignore
6. Run npm run build and verify zero errors

The agent reads from the astro-local-business skill's reference files for code patterns and from assets/color-palettes.json for the industry color scheme.

## Step 4: Report Results

After the build completes, present the results:

```
Site built successfully!

  Pages: {count} pages in {time}
  Size: {size} static HTML files + 1 SSR API route

Check these URLs in your browser (run `npm run dev` first):
  Homepage:        http://localhost:4321/
  Combo page:      http://localhost:4321/services/{area}/{service}/
  Another combo:   http://localhost:4321/services/{area2}/{service2}/
  Contact form:    http://localhost:4321/contact/

Next steps:
  1. Browse the site and verify content
  2. Commit: git add -A && git commit -m "Complete {page-count}-page {industry} website"
  3. Push: gh repo create {project-name} --public --push --source=.
  4. Deploy: Cloudflare Pages > Connect to Git
     Set NODE_VERSION=22 and RESEND_API_KEY in environment variables
```

## Notes

- The skill reference `astro-local-business` provides all code patterns and Astro 5 / Tailwind v4 conventions
- If the user provides a design reference URL (like a HyperUI or Preline component), incorporate that visual style into the generated components
- If the user already has an Astro project in the current directory, ask whether to build in-place or create a new project
