/**
 * POST /api/contact
 *
 * Server-rendered API route for contact form submissions.
 * Sends email notification via Resend.
 *
 * TEMPLATE: Replace {{BUSINESS_NAME}}, {{ADMIN_EMAIL}}, and {{BRAND_COLOR_700}}
 * with actual values for the target business.
 */

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
          <p style="margin: 4px 0; font-weight: 600;">\${escapeHtml(data.name)}</p>
          <p style="margin: 4px 0;"><a href="mailto:\${escapeHtml(data.email)}">\${escapeHtml(data.email)}</a></p>
          <p style="margin: 4px 0;"><a href="tel:\${escapeHtml(data.phone)}">\${escapeHtml(data.phone)}</a></p>
        </div>
        \${data.service ? \`
        <div style="margin-bottom: 16px; padding: 12px 16px; background: #eff6ff; border-radius: 8px;">
          <p style="margin: 0 0 4px; color: #706d85; font-size: 13px;">Service Requested</p>
          <p style="margin: 0; font-weight: 600;">\${escapeHtml(data.service)}</p>
        </div>\` : ''}
        \${data.message ? \`
        <div style="padding: 16px; background: #f3f3f6; border-radius: 8px;">
          <p style="margin: 0 0 4px; color: #706d85; font-size: 13px;">Message</p>
          <p style="margin: 0; white-space: pre-wrap;">\${escapeHtml(data.message)}</p>
        </div>\` : ''}
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
