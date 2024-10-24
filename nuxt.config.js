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
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      offline: true, // Activer les fonctionnalités hors ligne
    }
  }
});
