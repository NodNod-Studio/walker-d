<script setup lang="ts">
const { buildCommit, buildTime } = useRuntimeConfig().public

// Fixed locale + time zone so the SSR and client output match
const buildDate = new Intl.DateTimeFormat('it-IT', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Rome',
}).format(new Date(buildTime))

// Subject carries the build so we know which version the report is about
const subject = `walker•drawas signature - [describe the problem] (build ${[buildCommit, buildDate].filter(Boolean).join(', ')})`
const helpHref = `mailto:hello@nodnod.studio?subject=${encodeURIComponent(subject)}`
</script>

<template>
  <footer class="flex justify-between gap-4 px-4 sm:px-6 py-4 text-3 text-ink/40">
    <span class="flex-1">Build {{ buildDate }}</span>
    <a :href="helpHref" class="text-inherit hover:text-ink">Need help?</a>
    <span class="flex-1 text-right">{{ buildCommit }}</span>
  </footer>
</template>
