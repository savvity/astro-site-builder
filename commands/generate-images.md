---
name: generate-images
description: Generate AI images for a local business website using Nano Banana Pro (Gemini 3 Pro Image). Creates hero images, service images, and area images for the site.
---

# Generate Site Images

Generate AI images for the local business website using the bundled Gemini 3 Pro Image script.

## Prerequisites

A **Gemini API key** is required (free). Check for it in this order:
1. Environment variable `GEMINI_API_KEY`
2. If not found, ask the user to provide one using AskUserQuestion. Include a note that it's free at https://aistudio.google.com/apikey

Store the resolved key in a variable for all image generation commands.

**Runtime dependency**: The script uses `uv run` which auto-installs Python dependencies (`google-genai`, `pillow`). The user needs `uv` installed. If `uv` is not available, suggest: `curl -LsSf https://astral.sh/uv/install.sh | sh`

## Process

1. **Read project context**: Read `src/data/business.ts`, `src/data/serviceTypes.ts`, and `src/data/serviceAreas.ts` to understand the business, services, and areas.

2. **Ask what to generate** using AskUserQuestion (1 round):

   - **Image set**: Which images to generate?
     Options:
     - "Hero image only (1 image)"
     - "Hero + service images (1 + services count)"
     - "Full set: hero + services + areas (Recommended)"
     - "Custom selection"
     multiSelect: false

3. **Create the images directory**:
   ```bash
   mkdir -p public/images/services public/images/areas
   ```

4. **Generate images** using the bundled script at `scripts/generate_image.py` (relative to this plugin's root directory). For each image, run:
   ```bash
   uv run ${CLAUDE_PLUGIN_ROOT}/scripts/generate_image.py \
     --prompt "PROMPT" \
     --filename "public/images/FILENAME.png" \
     --resolution 2K \
     --api-key "THE_RESOLVED_KEY"
   ```
   Replace `THE_RESOLVED_KEY` with the actual Gemini API key resolved in the prerequisites step. Do NOT use `$GEMINI_API_KEY` as a shell variable in the command (it may not be set as an env var). Instead, pass the literal key string.

   Then convert to WebP for optimal web performance:
   ```bash
   /opt/homebrew/bin/cwebp -q 85 public/images/FILENAME.png -o public/images/FILENAME.webp
   rm public/images/FILENAME.png
   ```

   If `cwebp` is not available, try `npx @aspect-build/cwebp -q 85 ...` as a fallback. If neither works, keep the PNG files and inform the user.

### Image Prompts by Type

**Hero image** (`public/images/hero.webp`):
Generate a prompt based on the industry and city. The image should be professional, clean, and suitable as a website hero background.

Examples by industry:
- Plumber: "Professional plumber in blue uniform working under a kitchen sink in a modern Austin Texas home, clean bright lighting, photorealistic, no text"
- Electrician: "Professional electrician in safety gear working on an electrical panel in a modern home, warm lighting, photorealistic, no text"
- HVAC: "HVAC technician servicing a modern air conditioning unit outside a suburban home, blue sky, photorealistic, no text"
- Landscaper: "Professional landscaper maintaining a beautiful green lawn in a suburban neighborhood, sunny day, photorealistic, no text"
- Roofer: "Professional roofer inspecting shingles on a residential roof with blue sky background, safety equipment visible, photorealistic, no text"
- Cleaning: "Professional cleaning team in uniform deep cleaning a modern bright kitchen, cleaning supplies visible, photorealistic, no text"

**Service images** (`public/images/services/{slug}.webp`):
Generate one image per service type. The prompt should show the specific service being performed.

Example for plumber services:
- drain-cleaning: "Close-up of a professional plumber using a drain snake to clean a clogged kitchen sink drain, clean workspace, photorealistic, no text"
- water-heater: "Professional plumber installing a new tankless water heater on a garage wall, tools visible, photorealistic, no text"
- leak-repair: "Plumber using electronic leak detection equipment on a bathroom wall, professional setting, photorealistic, no text"

**Area images** (`public/images/areas/{slug}.webp`):
Generate one image per service area. Use a cityscape or landmark prompt for each area.

Example for Austin areas:
- downtown-austin: "Aerial view of downtown Austin Texas skyline with Congress Avenue bridge and Lady Bird Lake, golden hour lighting, photorealistic, no text"
- round-rock: "Suburban neighborhood in Round Rock Texas with green lawns and modern homes, clear sky, photorealistic, no text"

5. **Update components to use images**: After generating, update the relevant page templates to reference the new images:

   - Homepage hero: `<img src="/images/hero.webp" alt="{business name} - {tagline}" />`
   - Service cards: `<img src={`/images/services/${service.slug}.webp`} alt={service.name} />`
   - Area cards: `<img src={`/images/areas/${area.slug}.webp`} alt={area.name} />`

   Use proper `alt` attributes derived from the business data.

6. **Report results**:
   ```
   Generated {count} images:
     public/images/hero.webp
     public/images/services/drain-cleaning.webp
     public/images/services/water-heater.webp
     ...
     public/images/areas/downtown-austin.webp
     public/images/areas/round-rock.webp
     ...

   Image references added to: index.astro, service cards, area cards.
   Run `npm run dev` to preview.
   ```

## Notes

- Images are generated at 2K resolution by default for good quality at reasonable file size
- WebP conversion reduces file size by ~30-50% compared to PNG
- If the user wants higher quality, use `--resolution 4K`
- Always include "no text" in the prompt to avoid AI-generated text artifacts in images
- Always include "photorealistic" for business sites (unless user requests illustration style)
- The Gemini API key is free at https://aistudio.google.com/apikey
- Users can set `export GEMINI_API_KEY=your_key` in their shell profile to avoid being prompted each time
