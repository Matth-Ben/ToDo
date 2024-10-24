// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],  // Ajout de Pinia
  plugins: ['~/plugins/firebase.js', '~/plugins/fontawesome.js'],  // Référence des plugins Firebase et FontAwesome
  head: {
    link: [{ rel: 'manifest', href: '/manifest.json' }]
  },
  tailwindcss: {
    cssPath: ['~/assets/css/tailwind.css', { injectPosition: 'first' }],
    configPath: 'tailwind.config',
    exposeConfig: { level: 2 },
    config: {},
    viewer: true,
    content: [
      './components/**/*.{vue,js}',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './composables/**/*.{js,ts}',
      './plugins/**/*.{js,ts}',
      './App.{js,ts,vue}',
      './app.{js,ts,vue}',
    ],
  },
});
