<script setup lang="ts">
const route = useRoute()

const { textImageUrl } = useTextImageUrl()
const wordmarkImg = textImageUrl(COMPANY.wordmark, { weight: 'bold', fontSize: 22 })

const isDocs = computed(() => route.path.startsWith('/documentation'))
</script>

<template>
  <header class="header">
    <NuxtLink to="/" class="brand" aria-label="Walker • Drawas Signature Generator">
      <img :src="wordmarkImg" height="18" alt="Walker • Drawas" class="brand-logo">
    </NuxtLink>

    <NuxtLink :to="isDocs ? '/' : '/documentation'" class="header-link">
      <span :class="isDocs ? 'i-ph-signature' : 'i-ph-book-open-text'" class="header-link-icon" aria-hidden="true" />
      <span class="header-link-label">{{ isDocs ? 'Generator' : 'Documentation' }}</span>
    </NuxtLink>
  </header>
</template>

<style scoped>
.header {
  height: 72px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
  border-bottom: 1px solid #eee;
}

.brand {
  grid-column: 2;
  display: block;
}

.brand-logo {
  display: block;
  height: 18px;
  width: auto;
}

.header-link {
  grid-column: 3;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border: 1px solid #111;
  border-radius: 999px;
  color: #111;
  font-size: 0.7rem;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 0.3s, color 0.3s;
}

.header-link-icon {
  width: 1rem;
  height: 1rem;
}

.header-link:hover {
  background: #111;
  color: #fff;
}

@media (max-width: 640px) {
  .header {
    grid-template-columns: 1fr auto;
  }

  .brand {
    grid-column: 1;
  }

  .header-link {
    grid-column: 2;
  }
}
</style>
