<script setup lang="ts">
const route = useRoute()

const { textImageUrl } = useTextImageUrl()
const wordmarkImg = textImageUrl(COMPANY.wordmark, { weight: 'bold', fontSize: 22 })
// Short "W•D" monogram (same as the favicon) for mobile
const monogramImg = textImageUrl('W•D', { weight: 'bold', fontSize: 22 })

const isDocs = computed(() => route.path.startsWith('/documentation'))
</script>

<template>
  <!-- Logo on the left on mobile, centred from sm up -->
  <header class="h-18 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 border-b border-neutral-200">
    <NuxtLink to="/" class="block col-start-1 sm:col-start-2" aria-label="Walker • Drawas Signature">
      <img :src="monogramImg" height="18" alt="W • D" class="block sm:hidden h-4.5 w-auto">
      <img :src="wordmarkImg" height="18" alt="Walker • Drawas" class="hidden sm:block h-4.5 w-auto">
    </NuxtLink>

    <Button
      :to="isDocs ? '/' : '/documentation'"
      class="col-start-2 sm:col-start-3 justify-self-end max-[359px]:px-2.5"
    >
      <span :class="isDocs ? 'i-ph-signature' : 'i-ph-book-open-text'" class="size-4" aria-hidden="true" />
      <!-- Icon only on the narrowest phones (e.g. iPhone SE 1st gen) -->
      <span class="max-[359px]:sr-only">{{ isDocs ? 'Generator' : 'Documentation' }}</span>
    </Button>
  </header>
</template>
