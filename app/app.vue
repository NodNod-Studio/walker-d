<script setup lang="ts">
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
