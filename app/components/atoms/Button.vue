<script setup lang="ts">
const props = withDefaults(defineProps<{
  theme?: 'primary' | 'secondary'
  size?: 'md' | 'lg'
  type?: 'button' | 'submit'
  // Renders a NuxtLink styled as a button
  to?: string
}>(), {
  theme: 'secondary',
  size: 'md',
  type: 'button',
})

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <component
    :is="props.to ? NuxtLink : 'button'"
    :to="props.to"
    :type="props.to ? undefined : type"
    class="motion-snug inline-flex items-center justify-center gap-1.5 px-4 border rounded-full font-sans text-2.8 leading-none uppercase no-underline cursor-pointer"
    :class="[
      size === 'lg' ? 'h-12' : 'h-9',
      theme === 'primary'
        ? 'bg-ink text-white border-ink hover:bg-neutral-700 hover:border-neutral-700'
        : 'bg-white text-ink border-ink hover:bg-ink hover:text-white',
    ]"
  >
    <slot />
  </component>
</template>
