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
      { rel: 'icon', href: '/icon.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  pwa: {
    manifest: {
      name: 'ToDo App',
      short_name: 'ToDo',
      description: 'Une application de gestion de tâches',
      theme_color: '#000000',
      icons: [
        {
          src: '/icon.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      mode: 'production',  // Mode production pour générer le service worker
      navigateFallback: '/index.html',  // Redirection pour les pages hors ligne
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/,  // Exemple pour Firestore
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    }
  },
});
