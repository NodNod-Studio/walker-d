<script setup lang="ts">
// Stacks both labels in the same grid cell so the width is always the widest one: no layout shift on swap
defineProps<{
  active: boolean
  label: string
  activeLabel: string
}>()
</script>

<template>
  <span class="inline-grid">
    <span class="col-start-1 row-start-1" :class="{ invisible: active }">{{ label }}</span>
    <span class="col-start-1 row-start-1" :class="{ invisible: !active }">{{ activeLabel }}</span>
  </span>
</template>
