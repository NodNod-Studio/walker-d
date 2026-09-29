import { execSync } from 'node:child_process'
import process from 'node:process'

// Shown in the footer so it's obvious whether a deploy has gone live.
// .git is excluded from the Docker context, so there the commit comes from
// the SOURCE_COMMIT build arg (if the host passes one); the build time is always set.
function commitSha() {
  if (process.env.SOURCE_COMMIT)
    return process.env.SOURCE_COMMIT.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  }
  catch {
    return ''
  }
}

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
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'theme-color', content: '#ffffff' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      // Public URL used for absolute og:image links (set NUXT_PUBLIC_SITE_URL in production)
      siteUrl: '',
      buildCommit: commitSha(),
      buildTime: new Date().toISOString(),
    },
  },
  // Keep every page and asset out of search engines. robots.txt is intentionally not
  // blocking crawlers: LinkedIn/WhatsApp need to fetch the page to build the link preview.
  routeRules: {
    '/**': {
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex' },
    },
  },
  eslint: {
    config: {
      standalone: false,
    },
  },
})
