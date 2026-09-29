<script setup lang="ts">
const route = useRoute()

const { textImageUrl } = useTextImageUrl()
const wordmarkImg = textImageUrl(COMPANY.wordmark, { weight: 'bold', fontSize: 22 })

const isDocs = computed(() => route.path.startsWith('/documentation'))
</script>

<template>
  <!-- Logo on the left on mobile, centred from sm up -->
  <header class="h-18 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 border-b border-neutral-200">
    <NuxtLink to="/" class="block col-start-1 sm:col-start-2" aria-label="Walker • Drawas Signature Generator">
      <img :src="wordmarkImg" height="18" alt="Walker • Drawas" class="block h-4.5 w-auto">
    </NuxtLink>

    <NuxtLink
      :to="isDocs ? '/' : '/documentation'"
      class="motion-snug col-start-2 sm:col-start-3 justify-self-end flex items-center gap-1.5 px-3.5 max-[359px]:px-2.5 py-1.8 border border-ink rounded-full text-ink text-2.8 uppercase no-underline hover:bg-ink hover:text-white"
    >
      <span :class="isDocs ? 'i-ph-signature' : 'i-ph-book-open-text'" class="size-4" aria-hidden="true" />
      <!-- Icon only on the narrowest phones (e.g. iPhone SE 1st gen) -->
      <span class="max-[359px]:sr-only">{{ isDocs ? 'Generator' : 'Documentation' }}</span>
    </NuxtLink>
  </header>
</template>
