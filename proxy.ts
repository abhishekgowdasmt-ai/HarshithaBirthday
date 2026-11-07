import { next } from '@vercel/functions'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const ACCESS_COOKIE = 'royal_access'
const SESSION_SECONDS = 60 * 60 * 24 * 30
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000

type AttemptState = {
  count: number
  windowEndsAt: number
  blockedUntil: number
}

const attempts = new Map<string, AttemptState>()

function hmac(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function getCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const pair = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))

  return pair?.slice(name.length + 1) ?? ''
}

function hasValidSession(request: Request, secret: string) {
  const parts = getCookie(request, ACCESS_COOKIE).split('.')
  if (parts.length !== 3) return false

  const [expiresAt, nonce, signature] = parts
  if (!/^\d+$/.test(expiresAt) || !/^[A-Za-z0-9_-]{16,}$/.test(nonce)) return false
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false

  const expected = Buffer.from(hmac(`${expiresAt}.${nonce}`, secret))
  const received = Buffer.from(signature)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

function accessCookie(request: Request, secret: string) {
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS)
  const nonce = randomBytes(18).toString('base64url')
  const payload = `${expiresAt}.${nonce}`
  const token = `${payload}.${hmac(payload, secret)}`
  const hostname = new URL(request.url).hostname
  const sharedDomain = hostname === 'harshithadinakar.com' || hostname.endsWith('.harshithadinakar.com')
    ? '; Domain=harshithadinakar.com'
    : ''

  return `${ACCESS_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}${sharedDomain}`
}

function response(body: string, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'; img-src data:",
      ...extraHeaders,
    },
  })
}

function unlockPage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#160b23">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>A Private Royal Invitation</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { min-height: 100svh; margin: 0; display: grid; place-items: center; overflow: hidden; color: #fff7ea; background: radial-gradient(ellipse at 50% 42%, #49305a 0, #241333 42%, #100919 100%); }
    body::before, body::after { content: "✦"; position: fixed; color: #f1d493; opacity: .45; font-size: 1.1rem; animation: drift 5s ease-in-out infinite; }
    body::before { top: 15%; left: 17%; } body::after { right: 16%; bottom: 18%; animation-delay: -2.5s; }
    .card { width: min(92vw, 440px); padding: 2.7rem 2rem 2.2rem; text-align: center; border: 1px solid rgba(240, 211, 151, .48); border-radius: 28px; background: linear-gradient(145deg, rgba(255,255,255,.09), rgba(255,255,255,.025)); box-shadow: 0 28px 90px rgba(0,0,0,.42), inset 0 0 32px rgba(242,214,160,.045); backdrop-filter: blur(14px); }
    .crown { font-size: 2.5rem; filter: drop-shadow(0 0 18px rgba(246,211,134,.5)); }
    .eyebrow { margin: .7rem 0 .65rem; color: #e8c987; font-size: .72rem; font-weight: 700; letter-spacing: .23em; text-transform: uppercase; }
    h1 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: clamp(2rem, 8vw, 2.7rem); font-weight: 400; line-height: 1.1; }
    .copy { margin: .9rem auto 1.7rem; color: #e2d8e8; line-height: 1.6; max-width: 29ch; }
    .pin { width: 100%; height: 58px; border: 1px solid rgba(240,211,151,.5); border-radius: 14px; outline: none; background: rgba(12,7,19,.5); color: #fff8ed; text-align: center; font: 700 1.4rem/1 system-ui, sans-serif; letter-spacing: .65em; padding-left: .65em; transition: border-color .2s, box-shadow .2s; }
    .pin:focus { border-color: #f1d493; box-shadow: 0 0 0 4px rgba(241,212,147,.13); }
    .unlock { width: 100%; min-height: 54px; margin-top: 1rem; border: 0; border-radius: 14px; color: #24152c; background: linear-gradient(100deg, #f2d899, #d9b86e); font: 750 .92rem/1 system-ui, sans-serif; letter-spacing: .09em; text-transform: uppercase; cursor: pointer; box-shadow: 0 10px 30px rgba(215,180,105,.18); transition: transform .2s, filter .2s; }
    .unlock:hover { transform: translateY(-2px); filter: brightness(1.06); } .unlock:disabled { cursor: wait; opacity: .72; transform: none; }
    .message { min-height: 1.4em; margin: .8rem 0 0; color: #f2d899; font-size: .88rem; }
    .foot { margin: 1.1rem 0 0; color: #b6a8bd; font-size: .75rem; letter-spacing: .03em; }
    @keyframes drift { 50% { transform: translateY(-12px) rotate(12deg); opacity: .8; } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
  </style>
</head>
<body>
  <main class="card">
    <div class="crown" aria-hidden="true">♕</div>
    <p class="eyebrow">A private royal invitation</p>
    <h1>A little surprise<br>for Harshitha</h1>
    <p class="copy">This birthday palace is just for you. Enter your four-digit PIN to step inside.</p>
    <form id="unlock-form">
      <label for="pin" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">Four-digit PIN</label>
      <input id="pin" class="pin" type="password" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{4}" maxlength="4" minlength="4" aria-label="Four-digit PIN" required autofocus>
      <button class="unlock" type="submit">Unlock your surprise <span aria-hidden="true">✧</span></button>
      <p class="message" id="message" role="status" aria-live="polite"></p>
    </form>
    <p class="foot">Made with love, and a little palace magic.</p>
  </main>
  <script>
    const form = document.getElementById('unlock-form');
    const pin = document.getElementById('pin');
    const message = document.getElementById('message');
    const button = form.querySelector('button');
    pin.addEventListener('input', () => { pin.value = pin.value.replace(/\\D/g, '').slice(0, 4); });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!/^[0-9]{4}$/.test(pin.value)) { message.textContent = 'Please enter all four digits.'; return; }
      button.disabled = true;
      message.textContent = 'Opening the palace…';
      try {
        const result = await fetch('/api/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: pin.value }) });
        const data = await result.json();
        if (!result.ok) { message.textContent = data.message || 'That PIN did not open the palace. Try again.'; button.disabled = false; pin.select(); return; }
        message.textContent = 'Welcome in, Princi ✧';
        window.location.reload();
      } catch { message.textContent = 'The palace could not be reached. Please try again.'; button.disabled = false; }
    });
  </script>
</body>
</html>`
}

function jsonResponse(body: object, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  })
}

function clientAddress(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return request.headers.get('x-real-ip') ?? forwarded?.split(',').at(-1)?.trim() ?? 'unknown'
}

function recordFailedAttempt(address: string, now: number) {
  let state = attempts.get(address)
  if (!state || state.windowEndsAt <= now) {
    state = { count: 0, windowEndsAt: now + ATTEMPT_WINDOW_MS, blockedUntil: 0 }
  }

  if (state.blockedUntil > now) return Math.ceil((state.blockedUntil - now) / 1000)

  state.count += 1
  if (state.count >= MAX_FAILED_ATTEMPTS) {
    state.count = 0
    state.blockedUntil = now + LOCKOUT_MS
  }

  attempts.set(address, state)
  if (attempts.size > 2000) {
    for (const [key, item] of attempts) {
      if (item.windowEndsAt <= now && item.blockedUntil <= now) attempts.delete(key)
    }
  }

  return state.blockedUntil > now ? Math.ceil((state.blockedUntil - now) / 1000) : 0
}

export default async function proxy(request: Request) {
  const url = new URL(request.url)

  if (url.pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' },
    })
  }

  if (url.pathname === '/api/unlock') {
    if (request.method !== 'POST') return jsonResponse({ message: 'Method not allowed.' }, 405, { Allow: 'POST' })
    if (request.headers.get('origin') !== url.origin) return jsonResponse({ message: 'Request was not accepted.' }, 403)

    const expectedPin = process.env.BIRTHDAY_PIN
    const signingSecret = process.env.COOKIE_SIGNING_SECRET
    if (!expectedPin || !/^\d{4}$/.test(expectedPin) || !signingSecret || signingSecret.length < 32) {
      return jsonResponse({ message: 'The palace is being prepared. Please try again shortly.' }, 503)
    }

    const address = clientAddress(request)
    const now = Date.now()
    const existing = attempts.get(address)
    if (existing && existing.blockedUntil > now) {
      const seconds = Math.ceil((existing.blockedUntil - now) / 1000)
      return jsonResponse({ message: `Too many tries. Please wait ${Math.ceil(seconds / 60)} minutes.` }, 429, { 'Retry-After': String(seconds) })
    }

    let body: unknown
    try {
      if (Number(request.headers.get('content-length') ?? 0) > 512) return jsonResponse({ message: 'Request was not accepted.' }, 413)
      const rawBody = await request.text()
      if (rawBody.length > 512) return jsonResponse({ message: 'Request was not accepted.' }, 413)
      body = JSON.parse(rawBody)
    } catch {
      return jsonResponse({ message: 'Please enter your four-digit PIN.' }, 400)
    }

    const submittedPin = typeof body === 'object' && body !== null && 'pin' in body ? (body as { pin?: unknown }).pin : undefined
    if (typeof submittedPin !== 'string' || submittedPin.length !== 4 || !/^\d{4}$/.test(submittedPin) || submittedPin !== expectedPin) {
      const retryAfter = recordFailedAttempt(address, now)
      if (retryAfter > 0) return jsonResponse({ message: 'Too many tries. Please wait 15 minutes before trying again.' }, 429, { 'Retry-After': String(retryAfter) })
      return jsonResponse({ message: 'That PIN did not open the palace. Please try again.' }, 401)
    }

    attempts.delete(address)
    return jsonResponse({ ok: true }, 200, { 'Set-Cookie': accessCookie(request, signingSecret) })
  }

  const signingSecret = process.env.COOKIE_SIGNING_SECRET
  if (signingSecret && hasValidSession(request, signingSecret)) return next()

  return response(unlockPage())
}
