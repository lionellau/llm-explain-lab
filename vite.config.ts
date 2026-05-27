import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// CSP that works for dev (HMR uses ws:) and prod.
// 'unsafe-inline' on style is required because React inline styles render as <style> attrs.
// 'unsafe-eval' is required only in dev for source maps / HMR runtime; preview/build does not need it.
const csp = (dev: boolean) =>
  [
    "default-src 'self'",
    `script-src 'self'${dev ? " 'unsafe-eval' 'unsafe-inline'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${dev ? ' ws: wss:' : ''}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'none'",
  ].join('; ')

// When GitHub Actions deploys to Pages, it sets BASE_PATH so the bundle's
// asset URLs are prefixed correctly (e.g. /llm-explain-lab/).
// For local dev / preview, base is '/'.
const basePath = process.env.BASE_PATH || '/'

export default defineConfig(({ command }) => ({
  base: basePath,
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
      'Content-Security-Policy': csp(true),
    },
  },
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
      'Content-Security-Policy': csp(false),
    },
  },
  build: {
    sourcemap: false,
  },
  // Suppress unused warning for command
  define: { __DEV__: JSON.stringify(command === 'serve') },
}))
