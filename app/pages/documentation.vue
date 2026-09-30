<script setup lang="ts">
useSeoMeta({
  title: 'Documentation – Walker•Drawas Signature',
})

import {
  GuideAppleMailIos,
  GuideAppleMailMac,
  GuideGmail,
  GuideOutlookLegacy,
  GuideOutlookMac,
  GuideOutlookWeb,
} from '#components'

// Navigation metadata; each guide's content lives in its own component under components/docs.
const guides = [
  { id: 'gmail', title: 'Gmail', subtitle: 'Web (mail.google.com)', icon: 'i-logos-google-gmail', videoId: '1CAKOKvPZHWtG32HV8nM8dyB48MBFUfQR', component: GuideGmail },
  { id: 'outlook-web', title: 'Outlook', subtitle: 'Web (outlook.live.com / outlook.office.com)', icon: 'i-vscode-icons-file-type-outlook', videoId: '1BEJhSOg40tJHt1P7UZ8PT4sRnwnWryW6', component: GuideOutlookWeb },
  { id: 'outlook-mac', title: 'Outlook', subtitle: 'Desktop app for macOS', icon: 'i-vscode-icons-file-type-outlook', videoId: '1p-9IVmZr8xD09ZLfrRip2RPVAQSFzR8r', component: GuideOutlookMac },
  { id: 'outlook-legacy', title: 'Outlook', subtitle: 'Legacy desktop app (Windows / macOS)', icon: 'i-vscode-icons-file-type-outlook', videoId: '1Xj29Oe8Af1tz3VvJtTkP_VcK5OFpSeXe', component: GuideOutlookLegacy },
  { id: 'ios-mail', title: 'Apple Mail', subtitle: 'iPhone / iPad (iOS)', icon: 'i-logos-apple', videoId: '1IfV-y3hj9CkRuLsixvwGp5M0ccEEhOmO', component: GuideAppleMailIos },
  { id: 'apple-mail-mac', title: 'Apple Mail', subtitle: 'macOS', icon: 'i-logos-apple', videoId: '1pv2n2w8zZm49VcqM-rV0IloQGKXnrUTN', component: GuideAppleMailMac },
]

const activeId = ref(guides[0]!.id)

// The active guide is the last one whose top has scrolled past the upper third of the viewport
function updateActive() {
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
  if (atBottom) {
    activeId.value = guides.at(-1)!.id
    return
  }
  const threshold = window.innerHeight / 3
  let current = guides[0]!.id
  for (const guide of guides) {
    const el = document.getElementById(guide.id)
    if (el && el.getBoundingClientRect().top <= threshold)
      current = guide.id
  }
  activeId.value = current
}

useEventListener('scroll', updateActive, { passive: true })
onMounted(updateActive)

const activeGuide = computed(() => guides.find(g => g.id === activeId.value)!)

// Mobile only: the sidebar collapses into a burger menu
const menuOpen = ref(false)
const sidebar = useTemplateRef<HTMLElement>('sidebar')

onClickOutside(sidebar, () => {
  menuOpen.value = false
})
onKeyStroke('Escape', () => {
  menuOpen.value = false
})

// Scroll ourselves: with pageTransition enabled, the router's hash scrolling
// waits for a transition that never runs on same-page navigation.
function goTo(id: string) {
  menuOpen.value = false
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  history.replaceState(history.state, '', `#${id}`)
}
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="w-full max-w-300 mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
      <!-- Mobile: sticky bar with a burger menu. lg+: sticky sidebar. -->
      <aside
        ref="sidebar"
        class="sticky top-0 z-10 -mx-6 bg-white border-b border-neutral-200 lg:static lg:mx-0 lg:pt-8 lg:border-b-0"
      >
        <button
          type="button"
          class="w-full flex items-center gap-2.4 px-6 py-3.4 text-left text-3.6 text-ink cursor-pointer lg:hidden"
          :aria-expanded="menuOpen"
          aria-controls="docs-nav"
          @click="menuOpen = !menuOpen"
        >
          <span :class="menuOpen ? 'i-ph-x' : 'i-ph-list'" class="size-5" aria-hidden="true" />
          <span class="size-5" :class="activeGuide.icon" aria-hidden="true" />
          <span>
            {{ activeGuide.title }}
            <span class="ml-1 text-3 opacity-60">{{ activeGuide.subtitle }}</span>
          </span>
        </button>

        <nav
          id="docs-nav"
          class="motion-snug absolute top-full inset-x-0 flex flex-col gap-1 px-4 pt-2 pb-4 bg-white border-b border-neutral-200 shadow-[0_12px_24px_rgba(17,17,17,0.08)]
            lg:sticky lg:top-8 lg:p-0 lg:border-b-0 lg:shadow-none lg:opacity-100 lg:visible lg:translate-y-0"
          :class="menuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'"
        >
          <p class="text-3 text-ink/50 mx-3 my-2 lg:mx-0 lg:mt-0">
            Email clients
          </p>
          <a
            v-for="guide in guides"
            :key="guide.id"
            :href="`#${guide.id}`"
            class="motion-snug flex items-center gap-3 px-3 py-2.4 rounded-1.5 text-3.6 no-underline"
            :class="activeId === guide.id ? 'bg-ink text-white' : 'text-ink hover:bg-linen'"
            @click.prevent="goTo(guide.id)"
          >
            <!-- The Apple logo is black: invert it on the active (black) row -->
            <span
              class="size-5"
              :class="[guide.icon, { invert: activeId === guide.id && guide.icon === 'i-logos-apple' }]"
              aria-hidden="true"
            />
            <span>
              {{ guide.title }}
              <span class="block text-3 opacity-60">{{ guide.subtitle }}</span>
            </span>
          </a>
        </nav>
      </aside>

      <main class="pt-8 min-w-0">
        <h1 class="text-6 font-bold mb-2">
          How to install your signature
        </h1>
        <p class="text-3.8 leading-normal text-ink/70">
          Generate your signature, copy it with <b>Copy Signature</b> and follow the guide for your email client.
          Each guide includes a short video walkthrough.
        </p>

        <DocsGuide
          v-for="{ component, ...meta } in guides"
          :key="meta.id"
          v-bind="meta"
        >
          <component :is="component" />
        </DocsGuide>
      </main>
    </div>
  </div>
</template>
