<script setup lang="ts">
const route = useRoute()

const { textImageUrl } = useTextImageUrl()
// Short "W•D" monogram (same as the favicon)
const monogramImg = textImageUrl('W•D', { weight: 'bold', fontSize: 22 })

const isDocs = computed(() => route.path.startsWith('/documentation'))
</script>

<template>
  <header class="h-18 flex items-center justify-between gap-4 px-4 sm:px-6 border-b border-neutral-200">
    <NuxtLink to="/" class="block" aria-label="Walker • Drawas Signature">
      <img :src="monogramImg" height="18" alt="W • D" class="block h-4.5 w-auto">
    </NuxtLink>

    <Button
      :to="isDocs ? '/' : '/documentation'"
      class="max-[359px]:px-2.5"
    >
      <span :class="isDocs ? 'i-ph-signature' : 'i-ph-book-open-text'" class="size-4" aria-hidden="true" />
      <!-- Icon only on the narrowest phones (e.g. iPhone SE 1st gen) -->
      <span class="max-[359px]:sr-only">{{ isDocs ? 'Generator' : 'Documentation' }}</span>
    </Button>
  </header>
</template>
