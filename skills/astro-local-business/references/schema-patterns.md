# JSON-LD Schema Markup Patterns

Structured data for local service business websites. Every page should include the appropriate schema to help search engines understand the content and display rich results.

## Schema Types by Page

| Page Type | Schema Types |
|---|---|
| Homepage | LocalBusiness, WebSite |
| Service page | Service, BreadcrumbList |
| Area page | LocalBusiness (with areaServed), BreadcrumbList |
| Combo page | Service (with areaServed), FAQPage, BreadcrumbList |
| About page | LocalBusiness |
| Contact page | LocalBusiness (with ContactPoint) |

## LocalBusiness Schema (Homepage, About, Contact)

This is the primary schema. Use the correct `@type` for the industry.

### Schema.org @type by Industry

| Industry | @type | Notes |
|---|---|---|
| Plumber | Plumber | |
| Electrician | Electrician | |
| HVAC | HVACBusiness | |
| Locksmith | Locksmith | |
| Roofer | RoofingContractor | |
| Landscaper | LandscapingBusiness | Pending extension |
| General Contractor | GeneralContractor | |
| Pest Control | PestControlService | Pending extension |
| Cleaning Service | HousekeepingService | |
| Moving Company | MovingCompany | |
| Auto Repair | AutoRepair | |

### LocalBusiness Template

```astro
---
import { business, yearsInBusiness } from '../data/business';
---

<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "{{SCHEMA_TYPE}}",
  "name": business.name,
  "legalName": business.legalName,
  "description": business.description,
  "url": business.website,
  "telephone": business.phone,
  "email": business.email,
  "foundingDate": String(business.yearEstablished),
  "address": {
    "@type": "PostalAddress",
    "streetAddress": business.address.street,
    "addressLocality": business.address.city,
    "addressRegion": business.address.state,
    "postalCode": business.address.zip,
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": business.coordinates.lat,
    "longitude": business.coordinates.lng
  },
  "openingHoursSpecification": business.hours.map(h => ({
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": h.days,
    "opens": h.hours.split(' - ')[0] || '',
    "closes": h.hours.split(' - ')[1] || ''
  })),
  "image": `${business.website}/images/hero.webp`,
  "priceRange": "$$",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "250",
    "bestRating": "5"
  }
})} />
```

Replace `{{SCHEMA_TYPE}}` with the industry-appropriate type from the table above.

**Important**: Use Astro's `set:html` directive for JSON-LD to avoid double-escaping. Do NOT use `innerHTML` or template literals inside the script tag.

## Service Schema (Service Pages, Combo Pages)

For individual service pages and combination pages:

```astro
---
import { business } from '../data/business';
// service and area come from getStaticPaths props
---

<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.name,
  "description": service.description,
  "provider": {
    "@type": "{{SCHEMA_TYPE}}",
    "name": business.name,
    "telephone": business.phone,
    "url": business.website
  },
  "areaServed": {
    "@type": "City",
    "name": area.name,
    "containedInPlace": {
      "@type": "State",
      "name": business.address.state
    }
  },
  "offers": {
    "@type": "Offer",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "priceCurrency": "USD",
      "price": service.priceRange
    }
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": `${service.name} in ${area.name}`,
    "itemListElement": [{
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": service.name
      }
    }]
  }
})} />
```

## FAQPage Schema (Combo Pages, Area Pages)

For pages with FAQ sections. The FAQ items should match exactly what is displayed on the page.

```astro
---
// faqs is an array of { question: string, answer: string }
---

<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
})} />
```

## BreadcrumbList Schema

For all pages with breadcrumb navigation:

```astro
---
// crumbs is an array of { label: string, href?: string }
const siteUrl = business.website;
---

<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": crumbs.map((crumb, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": crumb.label,
    ...(crumb.href ? { "item": `${siteUrl}${crumb.href}` } : {})
  }))
})} />
```

### Breadcrumb Structure by Page Type

| Page | Breadcrumb Path |
|---|---|
| Homepage | Home |
| Services index | Home > Services |
| Service page | Home > Services > {Service Name} |
| Areas index | Home > Service Areas |
| Area page | Home > Service Areas > {Area Name} |
| Combo page | Home > Services > {Area Name} > {Service Name} |
| About | Home > About |
| Contact | Home > Contact |

## WebSite Schema (Homepage only)

Add to the homepage for sitelinks search box eligibility:

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": business.name,
  "url": business.website,
  "description": business.description
})} />
```

## Implementation Pattern: Schema Component

Create a reusable component to keep pages clean:

```astro
---
// src/components/Schema.astro
interface Props {
  data: Record<string, unknown>;
}

const { data } = Astro.props;
---

<script type="application/ld+json" set:html={JSON.stringify(data)} />
```

Usage in any page:

```astro
---
import Schema from '../components/Schema.astro';

const schemaData = {
  "@context": "https://schema.org",
  "@type": "Plumber",
  "name": business.name,
  // ...
};
---

<Schema data={schemaData} />
```

## Testing Schema

After building, validate schema markup:
1. Run `npm run dev`
2. View source on any page and search for `application/ld+json`
3. Copy the JSON and paste into [Google Rich Results Test](https://search.google.com/test/rich-results)
4. Or use [Schema.org Validator](https://validator.schema.org/)

Common issues:
- Missing `@context` field
- Wrong `@type` for the industry
- Price as a range string instead of number (this is acceptable for PriceSpecification)
- Opening hours format must match schema.org specification
