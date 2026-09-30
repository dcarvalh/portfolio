// CV download page for davidcarvalho.work/cv.
//
//   GET  /cv         form (name, company, email) with a Turnstile check
//   POST /cv         verify Turnstile, email the form details to David, redirect to /cv/thanks
//   GET  /cv/thanks  "download starting" page with a signed link valid for 10 minutes
//   GET  /cv/file    the PDF from the private KV store, only with a valid signed link

import { formPage, thanksPage, messagePage } from './page.js';
import { sendNotification } from './email.js';
import { signDownload, verifyDownload } from './token.js';

const LIMITS = { name: 100, company: 100, email: 254 };
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    try {
      if (path === '/') return Response.redirect(new URL('/cv', url), 302);
      if (path === '/cv' && request.method === 'GET') {
        return html(formPage({ siteKey: env.TURNSTILE_SITE_KEY, source: cleanSource(url.searchParams.get('s')) }));
      }
      if (path === '/cv' && request.method === 'POST') return await submit(request, env, ctx);
      if (path === '/cv/thanks' && request.method === 'GET') return await thanks(url, env);
      if (path === '/cv/file' && request.method === 'GET') return await file(url, env);
      return html(messagePage('err_not_found'), 404);
    } catch (err) {
      console.error('Unhandled error', err);
      return html(messagePage('err_server'), 500);
    }
  },
};

async function submit(request, env, ctx) {
  const form = await request.formData();
  const values = {
    name: cleanText(form.get('name'), LIMITS.name),
    company: cleanText(form.get('company'), LIMITS.company),
    email: cleanText(form.get('email'), LIMITS.email),
  };
  const source = cleanSource(form.get('s'));
  const again = (error, status = 400) =>
    html(formPage({ siteKey: env.TURNSTILE_SITE_KEY, source, values, error }), status);

  if (!values.name) return again('err_name_required');
  if (values.email && !EMAIL_RE.test(values.email)) return again('err_email_invalid');
  if (!(await turnstileOk(form.get('cf-turnstile-response'), request, env))) return again('err_verify', 403);

  // Nothing is stored: the details only go to David by email. A failed email must not
  // stop the visitor from getting the CV.
  const entry = { ...values, source, createdAt: new Date().toISOString() };
  ctx.waitUntil(sendNotification(env, entry).catch((err) => console.error('Notification email failed', err)));

  const { exp, sig } = await signDownload(env.DOWNLOAD_SIGNING_KEY);
  return new Response(null, {
    status: 303,
    headers: { Location: `/cv/thanks?exp=${exp}&sig=${sig}`, ...SECURITY_HEADERS },
  });
}

async function thanks(url, env) {
  const exp = url.searchParams.get('exp');
  const sig = url.searchParams.get('sig');
  if (!(await verifyDownload(env.DOWNLOAD_SIGNING_KEY, exp, sig))) return html(messagePage('err_expired', true), 403);
  return html(thanksPage(`/cv/file?exp=${encodeURIComponent(exp)}&sig=${encodeURIComponent(sig)}`));
}

async function file(url, env) {
  if (!(await verifyDownload(env.DOWNLOAD_SIGNING_KEY, url.searchParams.get('exp'), url.searchParams.get('sig')))) {
    return html(messagePage('err_expired', true), 403);
  }
  const pdf = await env.CV_STORE.get(env.CV_KEY, { type: 'stream' });
  if (!pdf) {
    console.error(`KV key "${env.CV_KEY}" not found`);
    return html(messagePage('err_server'), 500);
  }
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${env.CV_FILENAME}"`,
      'Cache-Control': 'private, no-store',
      ...SECURITY_HEADERS,
    },
  });
}

async function turnstileOk(token, request, env) {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET_KEY);
  body.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const outcome = await res.json();
  if (!outcome.success) console.warn('Turnstile rejected', outcome['error-codes']);
  return outcome.success === true;
}

// Trim, drop control characters (no header injection in the email), collapse spaces, cap length.
function cleanText(value, max) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function cleanSource(value) {
  const s = String(value ?? '').toLowerCase();
  return /^[a-z0-9-]{1,32}$/.test(s) ? s : 'direct';
}

// no-referrer keeps the signed link out of Referer headers (e.g. to Google Fonts).
const SECURITY_HEADERS = {
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "frame-ancestors 'none'",
  'X-Robots-Tag': 'noindex, nofollow',
};

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', ...SECURITY_HEADERS },
  });
}
