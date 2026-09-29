<script setup lang="ts">
const siteUrl = (useRuntimeConfig().public.siteUrl || useRequestURL().origin).replace(/\/$/, '')
const description = 'Create your Walker•Drawas email signature in a few seconds, ready for Gmail, Outlook and Apple Mail.'

useSeoMeta({
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
  description,
  ogType: 'website',
  ogSiteName: 'Walker•Drawas',
  ogTitle: 'Walker•Drawas Signature',
  ogDescription: description,
  ogImage: `${siteUrl}/og-image.png`,
  ogImageSecureUrl: `${siteUrl}/og-image.png`,
  ogImageType: 'image/png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Walker • Drawas',
  ogUrl: siteUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Walker•Drawas Signature',
  twitterDescription: description,
  twitterImage: `${siteUrl}/og-image.png`,
})

const pageTransition = {
  name: 'page',
  mode: 'out-in',
  enterActiveClass: 'transition-opacity duration-250 ease',
  leaveActiveClass: 'transition-opacity duration-250 ease',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0',
} as const
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TheHeader />
    <NuxtPage :transition="pageTransition" />
  </div>
</template>
