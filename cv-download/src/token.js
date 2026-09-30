// Signed, expiring download links: sig = HMAC-SHA256(key, "cv:<exp>"), exp in Unix seconds.

const VALID_SECONDS = 10 * 60;
const encoder = new TextEncoder();

async function hmacKey(secret) {
  if (!secret) throw new Error('DOWNLOAD_SIGNING_KEY is not set');
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export async function signDownload(secret) {
  const exp = Math.floor(Date.now() / 1000) + VALID_SECONDS;
  const mac = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(`cv:${exp}`));
  return { exp, sig: toBase64Url(new Uint8Array(mac)) };
}

export async function verifyDownload(secret, exp, sig) {
  if (!/^\d{1,12}$/.test(exp ?? '') || !/^[A-Za-z0-9_-]{43}$/.test(sig ?? '')) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Number(exp) < now || Number(exp) > now + VALID_SECONDS + 60) return false;
  // crypto.subtle.verify compares in constant time.
  return crypto.subtle.verify('HMAC', await hmacKey(secret), fromBase64Url(sig), encoder.encode(`cv:${exp}`));
}

function toBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text) {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
