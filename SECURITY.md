# Security Review — LLM Lab

Date: 2026-05-27. App is a static client-side React + Vite app. No backend, no auth, no third-party APIs, no user accounts, no persisted data.

## Threat surface

| Surface | Status |
|---|---|
| User text input (Tokenizer) | Rendered through React text nodes only — no `dangerouslySetInnerHTML`, no `innerHTML`. React auto-escapes. |
| Numeric input (temperature slider) | Bounded by `min`/`max`, parsed via `parseFloat`. |
| External network calls | **None.** No `fetch`, no `XMLHttpRequest`, no analytics. |
| Secrets / API keys | **None in repo.** No model API, no auth. |
| File uploads | **None.** No upload UI exists. |
| Authentication | **None required.** App has no user-specific data. |
| Persisted state | **None.** No localStorage, no cookies, no IndexedDB used. |
| Third-party scripts | **None.** All deps bundled at build time. |

## Mitigations applied

- **Content Security Policy** set in both Vite dev/preview servers (`vite.config.ts`) and as `public/_headers` for static hosts (Netlify / Cloudflare Pages / Vercel format):
  - `default-src 'self'` — only same-origin content by default
  - `script-src 'self'` in prod (no inline scripts, no eval)
  - `style-src 'self' 'unsafe-inline'` — required for React's inline `style` attribute. No `<style>` injection vector exists since we own all components.
  - `img-src 'self' data: blob:` — data URLs allowed for inline SVGs only
  - `font-src 'self' data:` — fonts are system fonts; no remote font fetch
  - `connect-src 'self'` in prod (no remote APIs); dev allows `ws:` for HMR only
  - `frame-ancestors 'none'` — site cannot be embedded in iframes (clickjacking protection)
  - `form-action 'none'` — no form submissions exist
  - `object-src 'none'` — no Flash/embed
- **X-Frame-Options: DENY** — defense in depth alongside `frame-ancestors`
- **X-Content-Type-Options: nosniff** — prevents MIME confusion
- **Referrer-Policy: no-referrer** — no third-party referral leak
- **Permissions-Policy** — camera, mic, geolocation, payments all explicitly denied
- **Strict-Transport-Security** (prod only via `_headers`) — forces HTTPS

## Dependency audit

`npm audit --omit=dev` — **0 vulnerabilities** as of build date.

Production deps:
- `react`, `react-dom`, `react-router-dom` — official, current
- `three`, `@react-three/fiber`, `@react-three/drei` — official Three.js ecosystem
- `zustand` — minimal state lib (not currently used; can be removed)

## Out of scope (no surface in this app)

- SQL injection — no database
- Auth bypass — no auth
- Rate limiting — no API endpoints
- CSRF — no state-changing requests anywhere
- Session management — no sessions
- File upload validation — no uploads
- Blockchain / wallet code — none

## Manual review notes

- Searched for `dangerouslySetInnerHTML` / `innerHTML` / `eval(` / `new Function` / `document.write` in `src/` → 0 hits.
- Searched for hardcoded keys / passwords / tokens → 0 hits (only the conceptual "tokens" of the educational content).
- Searched for `fetch`, `XMLHttpRequest`, `http://`, `https://` in `src/` → 0 hits.
- All user-rendered strings flow through JSX children (auto-escaped), not via `innerHTML` or `srcDoc`.
- `title={...}` attributes use plain template strings with safe values (token ids, numbers).

## Verdict

**Cleared for deployment as a static site.** Surface is minimized by design: no backend means no server-side attack vectors, and CSP locks down what the client can do.
