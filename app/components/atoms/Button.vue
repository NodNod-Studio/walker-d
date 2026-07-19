<script setup lang="ts">
withDefaults(defineProps<{
  theme?: 'primary' | 'secondary'
  type?: 'button' | 'submit'
}>(), {
  theme: 'secondary',
  type: 'button',
})
</script>

<template>
  <button
    class="text-2.2 font-sans px-4 py-2.4 border rounded-12.5 cursor-pointer uppercase transition-colors duration-150"
    :class="theme === 'primary'
      ? 'bg-ink text-white border-ink hover:bg-neutral-700 hover:border-neutral-700'
      : 'bg-white text-ink border-ink hover:bg-ink hover:text-white'"
    :type="type"
  >
    <slot />
  </button>
</template>
