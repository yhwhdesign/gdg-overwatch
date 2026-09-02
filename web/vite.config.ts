import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // vite-plugin-pwa generates the service worker and web app manifest
    // that let a phone/tablet "install" Overwatch like a native app,
    // and cache assets for offline use. `registerType: 'autoUpdate'`
    // means when we ship a new version, the installed app updates
    // itself in the background instead of getting stuck on stale code.
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Overwatch',
        short_name: 'Overwatch',
        description: 'Operational intelligence platform',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          // TODO: replace with real Overwatch app icons before Phase 4
          // (Technician My Day) ships to a real device — these are
          // placeholders so the manifest is structurally valid now.
        ],
      },
    }),
  ],

  server: {
    // During local dev, the frontend (Vite, port 5173) and backend
    // (Express, port 3001) run as two separate servers. This proxy
    // makes any request to /api/* from the frontend get forwarded to
    // the Express server, so frontend code can just call `/api/health`
    // without hardcoding a port — and it matches how they'll be routed
    // together in production (see ../vercel.json).
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
