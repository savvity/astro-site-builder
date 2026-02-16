# Code Patterns Reference

Complete code templates for all key files in a local business Astro site.

## getStaticPaths: Combination Page (THE KEY PATTERN)

The file `src/pages/services/[area]/[service].astro` generates all combo pages:

```ts
---
import type { GetStaticPaths } from 'astro';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { serviceAreas } from '../../../data/serviceAreas';
import { serviceTypes } from '../../../data/serviceTypes';
import { business, yearsInBusiness } from '../../../data/business';
import { comboUrl, serviceUrl, areaUrl, contactUrl } from '../../../lib/urls';

export const getStaticPaths: GetStaticPaths = () => {
  const paths = [];
  for (const area of serviceAreas) {
    for (const service of serviceTypes) {
      paths.push({
        params: { area: area.slug, service: service.slug },
        props: { area, service },
      });
    }
  }
  return paths;
};

const { area, service } = Astro.props;

const title = `${service.name} in ${area.name}, TX | ${business.name}`;
const description = `Professional ${service.name.toLowerCase()} in ${area.name}, TX. ${yearsInBusiness()}+ years experience, licensed (${business.license}). ${service.priceRange}. Call ${business.phone} for fast service.`;
---

<BaseLayout title={title} description={description}>
  <!-- Page content here -->
</BaseLayout>
```

## getStaticPaths: Single Dimension Pages

**Service page** (`src/pages/services/[service].astro`):

```ts
export const getStaticPaths: GetStaticPaths = () => {
  return serviceTypes.map((service) => ({
    params: { service: service.slug },
    props: { service },
  }));
};
```

**Area page** (`src/pages/areas/[area].astro`):

```ts
export const getStaticPaths: GetStaticPaths = () => {
  return serviceAreas.map((area) => ({
    params: { area: area.slug },
    props: { area },
  }));
};
```

## SSR API Route: Contact Form

The file `src/pages/api/contact.ts` handles form submissions:

```ts
import type { APIRoute } from 'astro';

export const prerender = false;

interface ContactData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

function validateContact(data: unknown): data is ContactData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.name === 'string' && d.name.trim().length > 0 &&
    typeof d.email === 'string' && d.email.trim().length > 0 &&
    typeof d.phone === 'string' && d.phone.trim().length > 0
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendViaResend(
  apiKey: string,
  to: string[],
  subject: string,
  html: string,
  replyTo?: string,
): Promise<boolean> {
  const body: Record<string, unknown> = {
    from: '{{BUSINESS_NAME}} <onboarding@resend.dev>',
    to,
    subject,
    html,
  };
  if (replyTo) body.reply_to = replyTo;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    console.error(`Resend API error (${resp.status}): ${await resp.text()}`);
    return false;
  }
  return true;
}

function buildEmailHtml(data: ContactData): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: {{BRAND_COLOR_700}}; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 18px;">New Contact Form Submission</h1>
      </div>
      <div style="border: 1px solid #e8e7ed; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 4px; color: #706d85; font-size: 13px;">Customer Details</p>
          <p style="margin: 4px 0; font-weight: 600;">${escapeHtml(data.name)}</p>
          <p style="margin: 4px 0;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
          <p style="margin: 4px 0;"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></p>
        </div>
        ${data.service ? `
        <div style="margin-bottom: 16px; padding: 12px 16px; background: #eff6ff; border-radius: 8px;">
          <p style="margin: 0 0 4px; color: #706d85; font-size: 13px;">Service Requested</p>
          <p style="margin: 0; font-weight: 600;">${escapeHtml(data.service)}</p>
        </div>` : ''}
        ${data.message ? `
        <div style="padding: 16px; background: #f3f3f6; border-radius: 8px;">
          <p style="margin: 0 0 4px; color: #706d85; font-size: 13px;">Message</p>
          <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
        </div>` : ''}
      </div>
    </div>`;
}

export const POST: APIRoute = async ({ request }) => {
  const headers = { 'Content-Type': 'application/json' };

  try {
    const body = await request.json();

    if (!validateContact(body)) {
      return new Response(
        JSON.stringify({ error: 'Please fill in your name, email, and phone number.' }),
        { status: 400, headers },
      );
    }

    const data = body as ContactData;
    const resendKey = (import.meta.env.RESEND_API_KEY || '') as string;

    if (!resendKey) {
      console.log('RESEND_API_KEY not set. Form submission:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ ok: true, message: 'Inquiry received (email delivery pending setup)' }),
        { status: 200, headers },
      );
    }

    const subject = data.service
      ? `New Lead: ${data.service} from ${data.name}`
      : `New Contact: ${data.name}`;

    await sendViaResend(
      resendKey,
      ['{{ADMIN_EMAIL}}'],
      subject,
      buildEmailHtml(data),
      data.email,
    );

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please call us directly.' }),
      { status: 500, headers },
    );
  }
};
```

Replace `{{BUSINESS_NAME}}`, `{{BRAND_COLOR_700}}`, and `{{ADMIN_EMAIL}}` with actual values.

## Data File Interfaces

### business.ts

```ts
export const business = {
  name: '{{BUSINESS_NAME}}',
  legalName: '{{BUSINESS_NAME}} LLC',
  phone: '{{PHONE}}',
  email: '{{EMAIL}}',
  website: 'https://{{DOMAIN}}',
  address: {
    street: '{{STREET}}',
    city: '{{CITY}}',
    state: '{{STATE}}',
    zip: '{{ZIP}}',
  },
  coordinates: { lat: 0, lng: 0 },
  hours: [
    { days: 'Monday - Friday', hours: '7:00 AM - 7:00 PM' },
    { days: 'Saturday', hours: '8:00 AM - 5:00 PM' },
    { days: 'Sunday', hours: 'Emergency Only' },
  ],
  license: '{{LICENSE}}',
  yearEstablished: 2010,
  serviceRadius: '40 miles from Downtown {{CITY}}',
  description: '{{DESCRIPTION}}',
  tagline: '{{TAGLINE}}',
};

export function yearsInBusiness(): number {
  return new Date().getFullYear() - business.yearEstablished;
}
```

### serviceAreas.ts

```ts
export interface ServiceArea {
  slug: string;
  name: string;
  county: string;
  population?: number;
  priority: 'primary' | 'secondary' | 'tertiary';
  lat: number;
  lng: number;
  nearby: string[];
  description: string;
}

export const serviceAreas: ServiceArea[] = [
  {
    slug: 'area-slug',
    name: 'Area Name',
    county: 'County Name',
    population: 50000,
    priority: 'primary',
    lat: 30.2672,
    lng: -97.7431,
    nearby: ['other-area-1', 'other-area-2'],
    description: 'Description mentioning local characteristics relevant to the business industry.',
  },
  // ... more areas
];

export function getAreaBySlug(slug: string): ServiceArea | undefined {
  return serviceAreas.find((a) => a.slug === slug);
}

export function getNearbyAreas(slug: string): ServiceArea[] {
  const area = getAreaBySlug(slug);
  if (!area) return [];
  return area.nearby
    .map((s) => getAreaBySlug(s))
    .filter((a): a is ServiceArea => a !== undefined);
}

export function getAreaName(slug: string): string {
  return getAreaBySlug(slug)?.name ?? slug;
}
```

### serviceTypes.ts

```ts
export interface ServiceType {
  slug: string;
  name: string;
  description: string;
  priceRange: string;
  emergency: boolean;
}

export const serviceTypes: ServiceType[] = [
  {
    slug: 'service-slug',
    name: 'Service Name',
    description: 'Detailed description of the service.',
    priceRange: '$150 - $500',
    emergency: true,
  },
  // ... more services
];

export function getServiceBySlug(slug: string): ServiceType | undefined {
  return serviceTypes.find((s) => s.slug === slug);
}

export function getServiceName(slug: string): string {
  return getServiceBySlug(slug)?.name ?? slug;
}

export function getEmergencyServices(): ServiceType[] {
  return serviceTypes.filter((s) => s.emergency);
}
```

### urls.ts

```ts
export function serviceUrl(slug: string): string {
  return `/services/${slug}/`;
}

export function areaUrl(slug: string): string {
  return `/areas/${slug}/`;
}

export function comboUrl(areaSlug: string, serviceSlug: string): string {
  return `/services/${areaSlug}/${serviceSlug}/`;
}

export function contactUrl(): string {
  return '/contact/';
}

export function aboutUrl(): string {
  return '/about/';
}
```

## BaseLayout Pattern

```astro
---
interface Props {
  title: string;
  description?: string;
  lang?: string;
}

const { title, description = '', lang = 'en' } = Astro.props;

import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <meta property="og:title" content={title} />
    {description && <meta property="og:description" content={description} />}
    <meta property="og:type" content="website" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="min-h-screen bg-slate-50 font-body text-slate-700">
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

## Contact Form Client-Side Script

The inline script for the contact page form submission:

```html
<script>
  const form = document.getElementById('contact-form');
  const submitBtn = form?.querySelector('button[type="submit"]');
  const successMsg = document.getElementById('success-message');
  const errorMsg = document.getElementById('error-message');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!submitBtn) return;

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.setAttribute('disabled', 'true');

    successMsg?.classList.add('hidden');
    errorMsg?.classList.add('hidden');

    const formData = new FormData(form as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (resp.ok) {
        form.classList.add('hidden');
        successMsg?.classList.remove('hidden');
      } else {
        const result = await resp.json();
        if (errorMsg) {
          errorMsg.textContent = result.error || 'Something went wrong. Please call us directly.';
          errorMsg.classList.remove('hidden');
        }
        submitBtn.textContent = originalText;
        submitBtn.removeAttribute('disabled');
      }
    } catch {
      if (errorMsg) {
        errorMsg.textContent = 'Network error. Please call us directly.';
        errorMsg.classList.remove('hidden');
      }
      submitBtn.textContent = originalText;
      submitBtn.removeAttribute('disabled');
    }
  });
</script>
```

## astro.config.mjs

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://{{DOMAIN}}',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/api/'),
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: cloudflare(),
});
```

## CTA Section (reuse on every page)

```astro
---
import { business } from '../data/business';
import { contactUrl } from '../lib/urls';
---

<section class="bg-gradient-to-br from-brand-700 to-brand-900 py-16 text-white">
  <div class="mx-auto max-w-4xl px-4 text-center">
    <h2 class="font-display text-3xl">Ready to Fix Your Plumbing?</h2>
    <p class="mt-4 text-brand-200">
      Call now for same-day service or schedule a free estimate.
    </p>
    <div class="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <a
        href={`tel:${business.phone.replace(/[^+\d]/g, '')}`}
        class="rounded-lg bg-white px-8 py-3 font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50"
      >
        Call {business.phone}
      </a>
      <a
        href={contactUrl()}
        class="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white/10"
      >
        Get Free Estimate
      </a>
    </div>
  </div>
</section>
```

Replace "Ready to Fix Your Plumbing?" with the appropriate industry CTA.
