// Notification email to David for each download, sent with Cloudflare Email Routing.

import { EmailMessage } from 'cloudflare:email';

export async function sendNotification(env, entry) {
  const who = entry.company ? `${entry.name} (${entry.company})` : entry.name;
  const lines = [
    `${who} downloaded your CV.`,
    '',
    `Name:    ${entry.name}`,
    `Company: ${entry.company || '-'}`,
    `Email:   ${entry.email || '-'}`,
    `Source:  ${entry.source}`,
    `Time:    ${zurichTime(entry.createdAt)}`,
  ];
  if (entry.email) lines.push('', 'Reply to this email to write to them.');

  const headers = [
    `From: "CV download" <${env.NOTIFY_FROM}>`,
    `To: <${env.NOTIFY_TO}>`,
    // Visitor email is validated in index.js (no spaces, <, >, commas), so it is safe in a header.
    ...(entry.email ? [`Reply-To: <${entry.email}>`] : []),
    `Subject: ${encodeHeader(`CV downloaded by ${who}`)}`,
    `Date: ${new Date(entry.createdAt).toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${env.NOTIFY_FROM.split('@')[1]}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ];
  const raw = `${headers.join('\r\n')}\r\n\r\n${wrap(base64Utf8(lines.join('\r\n')))}\r\n`;

  await env.NOTIFY.send(new EmailMessage(env.NOTIFY_FROM, env.NOTIFY_TO, raw));
}

// RFC 2047 encoded-word, so accented names are fine in the subject.
function encodeHeader(text) {
  return `=?UTF-8?B?${base64Utf8(text)}?=`;
}

function base64Utf8(text) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

function wrap(text, width = 76) {
  return text.match(new RegExp(`.{1,${width}}`, 'g')).join('\r\n');
}

function zurichTime(iso) {
  try {
    return `${new Date(iso).toLocaleString('en-GB', { timeZone: 'Europe/Zurich' })} (Geneva time)`;
  } catch {
    return `${iso} (UTC)`;
  }
}
