<script setup lang="ts">
const { buildCommit, buildTime } = useRuntimeConfig().public

// Fixed locale + time zone so the SSR and client output match
const buildDate = new Intl.DateTimeFormat('it-IT', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Rome',
}).format(new Date(buildTime))
</script>

<template>
  <footer class="px-4 sm:px-6 py-4 text-center text-3 text-ink/40">
    Build {{ buildDate }}<template v-if="buildCommit">
      · {{ buildCommit }}
    </template>
  </footer>
</template>
