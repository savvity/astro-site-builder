---
name: add-area
description: Add a new service area to an existing Astro local business website. Updates the serviceAreas data file and rebuilds to generate new combination pages.
---

# Add a Service Area

Add a new geographic service area to the site. This automatically generates new combination pages for every service type on the next build.

## Process

1. **Verify context**: Check that `src/data/serviceAreas.ts` exists in the current project. If not, inform the user this command requires an existing site built with the astro-site-builder plugin.

2. **Gather details** using AskUserQuestion (1 round, 2 questions):

   - **Area name**: What city, neighborhood, or suburb to add?
     Free text. Example: "Buda", "Westlake Hills", "Manor"

   - **Priority**: How important is this area for the business?
     Options: "Primary (appears first in nav)", "Secondary", "Tertiary"

3. **Read the existing file**: Read `src/data/serviceAreas.ts` to understand the current data structure, interface, and existing entries. Note the county names, coordinate ranges, and nearby area patterns.

4. **Generate the new entry** with:
   - `slug`: kebab-case version of the name
   - `name`: proper name
   - `county`: correct county for the geographic area
   - `population`: approximate real population
   - `priority`: as selected by the user
   - `lat`/`lng`: approximate real coordinates
   - `nearby`: 2-4 slugs of geographically close existing areas
   - `description`: 2-3 sentences mentioning local characteristics relevant to the business industry

5. **Update nearby arrays**: Add the new area's slug to the `nearby` arrays of 2-3 geographically close existing areas, so internal links are bidirectional.

6. **Build and report**:
   ```
   npm run build
   ```
   Report the new total page count and how many pages were added (should equal the number of service types + 1 area page).

## Example Output

```
Added "Buda" to service areas.

  New pages: +9 (8 combo pages + 1 area page)
  Total: 111 pages (was 102)

  New URLs:
    /areas/buda/
    /services/buda/drain-cleaning/
    /services/buda/water-heater/
    ...
```
