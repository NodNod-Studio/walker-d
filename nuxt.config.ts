export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },
  modules: ['@vueuse/nuxt', '@unocss/nuxt', '@nuxt/eslint'],
  components: {
    dirs: [
      { path: '~/components', pathPrefix: false },
    ],
  },
  css: [
    '~/assets/css/global.css',
  ],
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
  eslint: {
    config: {
      standalone: false,
    },
  },
})
