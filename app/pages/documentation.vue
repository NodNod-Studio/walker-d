<script setup lang="ts">
useSeoMeta({
  robots: 'noindex, nofollow',
  title: 'Documentation – Walker•Drawas Signature Generator',
})

interface Guide {
  id: string
  title: string
  subtitle: string
  icon: string
  videoId?: string
  steps?: string[]
  notes?: string[]
  link?: { href: string, label: string }
}

const guides: Guide[] = [
  {
    id: 'gmail',
    title: 'Gmail',
    subtitle: 'Web (mail.google.com)',
    icon: 'i-logos-google-gmail',
    videoId: '1CAKOKvPZHWtG32HV8nM8dyB48MBFUfQR',
    steps: [
      'Fill in <b>Full Name</b> and <b>Role</b> in the generator and click <b>Copy Signature</b>.',
      'In Gmail click the <b>gear icon</b> (top right) and then <b>See all settings</b>.',
      'In the <b>General</b> tab scroll down to <b>Signature</b> and click <b>Create new</b>. Give it a name (e.g. “WD Signature”) and click <b>Create</b>.',
      'Click inside the signature editor and paste (<kbd>⌘ V</kbd> / <kbd>Ctrl V</kbd>).',
      'Under <b>Signature defaults</b> select the new signature for both <b>For new emails use</b> and <b>On reply/forward use</b>.',
      'Scroll to the bottom of the page and click <b>Save Changes</b>.',
      'Click <b>Compose</b> to check that the signature is added to new emails.',
    ],
  },
  {
    id: 'outlook-web',
    title: 'Outlook',
    subtitle: 'Web (outlook.live.com / outlook.office.com)',
    icon: 'i-vscode-icons-file-type-outlook',
    videoId: '1BEJhSOg40tJHt1P7UZ8PT4sRnwnWryW6',
    steps: [
      'Fill in <b>Full Name</b> and <b>Role</b> in the generator and click <b>Copy Signature</b>.',
      'In Outlook click the <b>gear icon</b> (top right) to open <b>Settings</b>.',
      'Go to <b>Account → Signatures</b> and click <b>+ Add signature</b>.',
      'Type a name for the signature (e.g. “WD Signature”), then click in the body area and paste (<kbd>⌘ V</kbd> / <kbd>Ctrl V</kbd>).',
      'Tick <b>Set default for new messages</b> and <b>Set default for replies and forwards</b>, then click <b>Save</b>.',
      'Close Settings and click <b>New mail</b> to check the result.',
    ],
  },
  {
    id: 'outlook-mac',
    title: 'Outlook',
    subtitle: 'Desktop app for macOS',
    icon: 'i-vscode-icons-file-type-outlook',
    videoId: '1p-9IVmZr8xD09ZLfrRip2RPVAQSFzR8r',
    steps: [
      'Fill in <b>Full Name</b> and <b>Role</b> in the generator and click <b>Copy Signature</b>.',
      'In Outlook open <b>Outlook → Settings</b> (<kbd>⌘ ,</kbd>) and select <b>Signatures</b>.',
      'Click the <b>+</b> button to add a new signature.',
      'Right-click inside the editor and choose <b>Paste</b> (not “Paste as Plain Text”).',
      'Click the <b>Untitled</b> field and rename the signature (e.g. “WD Signature”).',
      'Under <b>Set default signatures</b> pick the new signature for <b>For new messages</b> and <b>For replies or forwards</b>.',
      'Close the Settings window and click <b>New Email</b> to check the result.',
    ],
  },
  {
    id: 'ios-mail',
    title: 'Apple Mail',
    subtitle: 'iPhone / iPad (iOS)',
    icon: 'i-logos-apple',
    videoId: '1IfV-y3hj9CkRuLsixvwGp5M0ccEEhOmO',
    steps: [
      'On your iPhone open <b>signature.walkerdrawas.com</b> in Safari, fill in <b>Full Name</b> and <b>Role</b> and tap <b>Copy Signature</b>.',
      'Open the <b>Settings</b> app and go to <b>Apps → Mail → Signature</b> (in the <b>Composing</b> section).',
      'Delete the existing text (e.g. “Sent from my iPhone”), then tap in the field and choose <b>Paste</b>.',
      'The signature will look broken: <b>shake the iPhone</b> and tap <b>Undo</b> (“Undo Change Attributes”). This removes the formatting iOS adds and restores the original layout.',
      'Go back, open the <b>Mail</b> app and start a new message to check the result.',
    ],
    notes: [
      'If you have multiple accounts you can choose <b>All Accounts</b> or <b>Per Account</b> at the top of the Signature screen.',
    ],
  },
  {
    id: 'apple-mail-mac',
    title: 'Apple Mail',
    subtitle: 'macOS',
    icon: 'i-logos-apple',
    link: {
      href: 'https://matt.coneybeare.me/how-to-make-an-html-signature-in-apple-mail-for-macos-sonoma-14/',
      label: 'How to add an HTML signature in Apple Mail (macOS Sonoma)',
    },
  },
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

function embedUrl(id: string) {
  return `https://drive.google.com/file/d/${id}/preview`
}
</script>

<template>
  <div class="page">
    <TheHeader />

    <div class="layout">
      <aside ref="sidebar" class="sidebar" :class="{ 'is-open': menuOpen }">
        <button
          type="button"
          class="menu-toggle"
          :aria-expanded="menuOpen"
          aria-controls="docs-nav"
          @click="menuOpen = !menuOpen"
        >
          <span :class="menuOpen ? 'i-ph-x' : 'i-ph-list'" class="menu-toggle-icon" aria-hidden="true" />
          <span class="sidebar-icon" :class="activeGuide.icon" aria-hidden="true" />
          <span class="menu-toggle-label">
            {{ activeGuide.title }}
            <span class="sidebar-sub">{{ activeGuide.subtitle }}</span>
          </span>
        </button>

        <nav id="docs-nav" class="sidebar-inner">
          <p class="sidebar-label">
            Email clients
          </p>
          <a
            v-for="guide in guides"
            :key="guide.id"
            :href="`#${guide.id}`"
            class="sidebar-link"
            :class="{ 'is-active': activeId === guide.id }"
            @click="menuOpen = false"
          >
            <span class="sidebar-icon" :class="guide.icon" aria-hidden="true" />
            <span class="sidebar-text">
              {{ guide.title }}
              <span class="sidebar-sub">{{ guide.subtitle }}</span>
            </span>
          </a>
        </nav>
      </aside>

      <main class="content">
        <h1 class="title">
          How to install your signature
        </h1>
        <p class="intro">
          Generate your signature, copy it with <b>Copy Signature</b> and follow the guide for your email client.
          Each guide includes a short video walkthrough.
        </p>

        <section v-for="guide in guides" :id="guide.id" :key="guide.id" class="guide">
          <h2 class="guide-title">
            <span class="guide-icon" :class="guide.icon" aria-hidden="true" />
            <span>
              {{ guide.title }}
              <span class="guide-sub">{{ guide.subtitle }}</span>
            </span>
          </h2>

          <div v-if="guide.videoId" class="video">
            <iframe
              :src="embedUrl(guide.videoId)"
              :title="`${guide.title} – ${guide.subtitle}`"
              allow="autoplay; fullscreen"
              allowfullscreen
              loading="lazy"
            />
          </div>

          <ol v-if="guide.steps" class="steps">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <li v-for="(step, i) in guide.steps" :key="i" v-html="step" />
          </ol>

          <div v-for="(note, i) in guide.notes" :key="i" class="note">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p v-html="note" />
          </div>

          <a
            v-if="guide.link"
            :href="guide.link.href"
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="help-link"
          >
            {{ guide.link.label }} ↗
          </a>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  background: #fff;
  color: #111;
}

.layout {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
  display: grid;
  grid-template-columns: 1fr;
}

.sidebar {
  position: sticky;
  top: 0;
  z-index: 10;
  margin: 0 -1.5rem;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.menu-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.5rem;
  background: none;
  border: 0;
  color: #111;
  font: inherit;
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
}

.menu-toggle-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.menu-toggle-label .sidebar-sub {
  margin-left: 0.25rem;
}

.sidebar-inner {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 1rem 1rem;
  background: #fff;
  border-bottom: 1px solid #eee;
  box-shadow: 0 12px 24px rgba(17, 17, 17, 0.08);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-0.5rem);
  transition: opacity 0.3s, transform 0.3s, visibility 0.3s;
}

.sidebar.is-open .sidebar-inner {
  opacity: 1;
  visibility: visible;
  transform: none;
}

.sidebar-label {
  font-size: 0.75rem;
  color: rgba(17, 17, 17, 0.5);
  margin: 0.5rem 0.75rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  color: #111;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background 0.3s, color 0.3s;
}

.sidebar-link:not(.is-active):hover {
  background: #f5f5f3;
}

.sidebar-link.is-active {
  background: #111;
  color: #fff;
}

.sidebar-link.is-active .i-logos-apple {
  filter: invert(1);
}

.sidebar-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.sidebar-sub {
  font-size: 0.75rem;
  opacity: 0.6;
}

.sidebar-link .sidebar-sub {
  display: block;
}

@media (min-width: 900px) {
  .layout {
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 3rem;
  }

  .sidebar {
    position: static;
    margin: 0;
    padding-top: 2rem;
    border-bottom: 0;
  }

  .menu-toggle {
    display: none;
  }

  .sidebar-inner {
    position: sticky;
    top: 2rem;
    padding: 0;
    border: 0;
    box-shadow: none;
    opacity: 1;
    visibility: visible;
    transform: none;
  }

  .sidebar-label {
    margin: 0 0 0.5rem;
  }
}

.content {
  padding-top: 2rem;
  min-width: 0;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.intro {
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(17, 17, 17, 0.7);
  margin: 0;
}

.guide {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
  scroll-margin-top: 4.5rem;
}

@media (min-width: 900px) {
  .guide {
    scroll-margin-top: 1rem;
  }
}

.guide-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.guide-icon {
  width: 2rem;
  height: 2rem;
}

.guide-sub {
  display: block;
  font-size: 0.8rem;
  font-weight: 400;
  color: rgba(17, 17, 17, 0.5);
  margin-top: 0.2rem;
}

.video {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  overflow: hidden;
  background: #f5f5f3;
}

.video iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.steps {
  margin: 1.5rem 0 0;
  padding-left: 1.25rem;
  list-style: decimal;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.steps :deep(kbd) {
  font-family: inherit;
  font-size: 0.8em;
  padding: 0.1em 0.4em;
  border-radius: 4px;
  background: #f5f5f3;
  border: 1px solid #e5e5e3;
}

.note {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  background: #f5f5f3;
}

.note p {
  font-size: 0.85rem;
  color: rgba(17, 17, 17, 0.7);
  margin: 0;
}

.help-link {
  display: block;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  background: #f5f5f3;
  color: #111;
  font-size: 0.9rem;
  text-decoration: none;
}
</style>
