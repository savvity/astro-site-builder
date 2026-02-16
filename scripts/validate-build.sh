#!/bin/bash
# validate-build.sh
# Post-build validation for an Astro local business site.
# Checks page count, key files, and common issues.

set -e

DIST_DIR="dist"

if [ ! -d "$DIST_DIR" ]; then
  echo "ERROR: dist/ directory not found. Run 'npm run build' first."
  exit 1
fi

# Count HTML pages
PAGE_COUNT=$(find "$DIST_DIR" -name "*.html" | wc -l | tr -d ' ')
echo "Pages generated: $PAGE_COUNT"

# Check key pages exist
CHECKS=(
  "dist/index.html:Homepage"
  "dist/about/index.html:About page"
  "dist/contact/index.html:Contact page"
  "dist/services/index.html:Services index"
  "dist/areas/index.html:Areas index"
  "dist/robots.txt:robots.txt"
  "dist/sitemap-index.xml:Sitemap index"
)

PASS=0
FAIL=0

for check in "${CHECKS[@]}"; do
  FILE="${check%%:*}"
  LABEL="${check##*:}"
  if [ -f "$FILE" ]; then
    echo "  OK: $LABEL"
    PASS=$((PASS + 1))
  else
    echo "  MISSING: $LABEL ($FILE)"
    FAIL=$((FAIL + 1))
  fi
done

# Check for combo pages (at least one should exist)
COMBO_COUNT=$(find "$DIST_DIR/services" -mindepth 2 -name "index.html" 2>/dev/null | wc -l | tr -d ' ')
echo ""
echo "Combination pages: $COMBO_COUNT"

# Check for API route (should NOT be in dist since it's SSR)
if [ -f "dist/api/contact/index.html" ]; then
  echo "WARNING: API route found as static HTML. Check 'export const prerender = false' in src/pages/api/contact.ts"
fi

# Summary
echo ""
echo "Results: $PASS passed, $FAIL missing"
echo "Total pages: $PAGE_COUNT (combo: $COMBO_COUNT)"

if [ "$FAIL" -gt 0 ]; then
  echo "Some checks failed. Review the output above."
  exit 1
fi

if [ "$PAGE_COUNT" -lt 10 ]; then
  echo "WARNING: Very few pages generated. Check data files (serviceAreas.ts, serviceTypes.ts)."
  exit 1
fi

echo "Build looks good!"
