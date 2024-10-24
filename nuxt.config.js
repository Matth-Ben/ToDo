import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'  // Nouveau module PWA compatible avec Nuxt 3
  ],
  plugins: ['~/plugins/firebase.js', '~/plugins/fontawesome.js'],
  head: {
    link: [
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'icon', href: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  pwa: {
    manifest: {
      name: 'ToDo App',
      short_name: 'ToDo',
      start_url: '/',
      display: 'standalone',
      theme_color: '#000000',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      mode: 'production',
      navigateFallback: '/index.html',
    }
  },
});
