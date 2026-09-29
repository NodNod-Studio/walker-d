<script setup lang="ts">
// Shell shared by every guide: heading and optional Drive video. Style the slotted content with the
// `docs-steps`, `docs-note`, `docs-link` and `docs-kbd` shortcuts from uno.config.ts.
const props = defineProps<{
  id: string
  title: string
  subtitle: string
  icon: string
  videoId?: string
}>()

const embedUrl = computed(() => props.videoId && `https://drive.google.com/file/d/${props.videoId}/preview`)
</script>

<template>
  <section :id="id" class="mt-12 pt-8 border-t border-neutral-200 scroll-mt-18 lg:scroll-mt-4">
    <h2 class="flex items-center gap-3 text-4.6 font-bold mb-4">
      <span class="size-8" :class="icon" aria-hidden="true" />
      <span>
        {{ title }}
        <span class="block mt-0.8 text-3.2 font-normal text-ink/50">{{ subtitle }}</span>
      </span>
    </h2>

    <div v-if="embedUrl" class="relative aspect-video rounded-2.5 overflow-hidden bg-linen">
      <iframe
        :src="embedUrl"
        :title="`${title} – ${subtitle}`"
        allow="autoplay; fullscreen"
        allowfullscreen
        loading="lazy"
        class="absolute inset-0 size-full border-0"
      />
    </div>

    <slot />
  </section>
</template>
