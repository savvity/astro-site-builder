---
name: add-service
description: Add a new service type to an existing Astro local business website. Updates the serviceTypes data file and rebuilds to generate new combination pages.
---

# Add a Service Type

Add a new service offering to the site. This automatically generates new combination pages for every service area on the next build.

## Process

1. **Verify context**: Check that `src/data/serviceTypes.ts` exists in the current project. If not, inform the user this command requires an existing site built with the astro-site-builder plugin.

2. **Gather details** using AskUserQuestion (1 round, 3 questions):

   - **Service name**: What service to add?
     Free text. Example: "Sump Pump Installation", "EV Charger Install", "Duct Cleaning"

   - **Price range**: What is the typical price range?
     Options: "$100-$300 (basic)", "$200-$800 (moderate)", "$500-$2,000 (major)", "$1,000-$5,000+ (premium)"
     Allow custom input.

   - **Emergency service?**: Is this available as a 24/7 emergency service?
     Options: "Yes", "No"

3. **Read the existing file**: Read `src/data/serviceTypes.ts` to understand the current interface and entries. Match the data format exactly.

4. **Generate the new entry** with:
   - `slug`: kebab-case version of the name
   - `name`: proper service name
   - `description`: 2-3 sentences describing the service, mentioning specific techniques, brands, or benefits
   - `priceRange`: as provided by the user
   - `emergency`: boolean from user selection

5. **Build and report**:
   ```
   npm run build
   ```
   Report the new total page count and how many pages were added (should equal the number of service areas + 1 service page).

## Example Output

```
Added "Sump Pump Installation" to service types.

  New pages: +11 (10 combo pages + 1 service page)
  Total: 113 pages (was 102)

  New URLs:
    /services/sump-pump/
    /services/downtown-austin/sump-pump/
    /services/round-rock/sump-pump/
    ...
```
