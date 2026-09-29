<script setup lang="ts">
useSeoMeta({
  robots: 'noindex, nofollow',
  title: 'Walker•Drawas Signature Generator',
})

const initialValues: { fullname: string, role: string } = {
  fullname: '',
  role: '',
}

const values = reactive({ ...initialValues })

function reset() {
  Object.assign(values, initialValues)
}

const copyAutoReset = refAutoReset(false, 2000)
const copyAutoResetHtml = refAutoReset(false, 2000)

const tabs = [
  { id: 'custom', label: 'Custom Signature', shortLabel: 'Custom', selector: '.sign' },
  { id: 'image', label: 'Single Image Signature (legacy)', shortLabel: 'Image (legacy)', selector: '.sign-image' },
] as const

type TabId = typeof tabs[number]['id']

// `activeTab` drives the tab buttons right away; `displayedTab` drives the panel
// and only flips once the panel has faded out, so preview and actions swap together.
const TAB_FADE_MS = 200
const activeTab = ref<TabId>('custom')
const displayedTab = ref<TabId>('custom')
const panelHidden = ref(false)
const activeSelector = computed(() => tabs.find(tab => tab.id === displayedTab.value)!.selector)

let tabTimer: ReturnType<typeof setTimeout> | undefined

function selectTab(id: TabId) {
  if (id === activeTab.value)
    return
  activeTab.value = id
  panelHidden.value = true
  clearTimeout(tabTimer)
  tabTimer = setTimeout(() => {
    displayedTab.value = activeTab.value
    panelHidden.value = false
  }, TAB_FADE_MS)
}

onBeforeUnmount(() => clearTimeout(tabTimer))

// Mobile only: secondary actions live in a bottom sheet
const moreOpen = ref(false)

onKeyStroke('Escape', () => {
  moreOpen.value = false
})

function closeMoreAfter(action: () => unknown) {
  action()
  moreOpen.value = false
}

async function copySignature(selector: string, onCopied: () => void) {
  const el = document.querySelector(selector) as HTMLElement
  if (!el)
    return
  const range = document.createRange()
  range.selectNodeContents(el)
  const sel = window.getSelection()
  if (!sel)
    return
  sel.removeAllRanges()
  sel.addRange(range)

  try {
    document.execCommand('copy')
    onCopied()
  }
  catch (err) {
    console.error('Failed to copy text: ', err)
  }

  sel.removeAllRanges()
}

const head = `<!doctype html>
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        a { text-decoration: none; }
        td { font-size: 0; line-height: 0; mso-line-height-rule: exactly; }
        a img { border: 0; outline: none; }
      </style>
      <!--[if mso]>
      <style>
        img { border: 0 !important; }
        a img { border: 0 !important; }
      </style>
      <![endif]-->
    </head>
    <body>
`

const tail = `
    </body>
  </html>
`

async function copyHtmlSignature(selector: string, onCopied: () => void) {
  const el = document.querySelector(selector) as HTMLElement
  if (!el)
    return
  const html = el.outerHTML
  const wrappedHtml = head + html + tail
  navigator.clipboard.writeText(wrappedHtml).then(() => {
    onCopied()
  }).catch((err) => {
    console.error('Failed to copy text: ', err)
  })
}

async function downloadSignature(selector: string) {
  const el = document.querySelector(selector) as HTMLElement
  if (!el)
    return
  const html = el.outerHTML
  const wrappedHtml = head + html + tail
  const blob = new Blob([wrappedHtml], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'signature.html'
  a.click()
  URL.revokeObjectURL(url)
}

async function downloadSignaturePng() {
  const img = document.querySelector('.sign-image img') as HTMLImageElement
  if (!img)
    return
  const blob = await $fetch<Blob>(img.src, { responseType: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'signature.png'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="w-full max-w-240 mx-auto my-8 px-4 sm:px-6 pb-12">
      <form novalidate @submit.prevent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
          <TextField v-model="values.fullname" label="Full Name" />
          <TextField v-model="values.role" label="Role" />
        </div>
      </form>

      <!-- Mobile: full-width segmented control with short labels. sm+: pills. -->
      <div class="mt-8 grid grid-cols-2 p-1 rounded-full bg-linen sm:flex sm:flex-wrap sm:gap-2 sm:p-0 sm:bg-transparent" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="px-3.5 py-2 border rounded-full font-sans text-3.2 text-center cursor-pointer"
          :class="activeTab === tab.id
            ? 'bg-ink border-ink text-white'
            : 'bg-transparent border-transparent text-ink/60 hover:text-ink sm:bg-white sm:border-neutral-200'"
          :aria-selected="activeTab === tab.id"
          @click="selectTab(tab.id)"
        >
          <span class="sm:hidden">{{ tab.shortLabel }}</span>
          <span class="hidden sm:inline">{{ tab.label }}</span>
        </button>
      </div>

      <!-- duration-200 must match TAB_FADE_MS -->
      <div
        class="mt-4 transition-opacity duration-200 ease"
        :class="{ 'opacity-0 pointer-events-none': panelHidden }"
      >
        <div class="p-3 sm:p-4 rounded-2.5 bg-linen">
          <div class="flex items-center justify-between mb-2">
            <p class="text-3 text-ink/50">
              Signature Preview:
            </p>
            <button
              type="button"
              class="sm:hidden flex items-center gap-1 text-3 text-ink/50 hover:text-ink cursor-pointer"
              @click="reset"
            >
              <span class="i-ph-arrow-counter-clockwise size-3.5" aria-hidden="true" />
              Reset
            </button>
          </div>
          <!--
            v-show, not v-if: the legacy image gets its size during SSR, so
            keeping it mounted avoids a resize when switching tabs.
            overflow-x-auto: the email table has a fixed width that can exceed narrow phones.
          -->
          <div class="p-3 sm:p-4 rounded-1.5 bg-white shadow-[inset_0_0_0_1px_#eee] overflow-x-auto">
            <TheSignature
              v-show="displayedTab === 'custom'"
              class="sign"
              :fullname="values.fullname"
              :role="values.role"
            />
            <TheSignatureImage
              v-show="displayedTab === 'image'"
              class="sign-image"
              :fullname="values.fullname"
              :role="values.role"
            />
          </div>
        </div>

        <!-- Keyed so the buttons are recreated with the right theme instead of animating between themes -->
        <div :key="displayedTab" class="mt-6">
          <!-- Mobile: one primary action, the rest in the "More" sheet -->
          <div class="flex gap-2 sm:hidden">
            <Button theme="primary" class="flex-1 !py-3.5 !text-2.8" @click="copySignature(activeSelector, () => copyAutoReset = true)">
              {{ copyAutoReset ? 'Copied!' : 'Copy Signature' }}
            </Button>
            <Button class="!px-3.5" aria-label="More actions" :aria-expanded="moreOpen" @click="moreOpen = true">
              <span class="i-ph-dots-three-bold block size-5" aria-hidden="true" />
            </Button>
          </div>

          <div class="hidden sm:flex flex-wrap items-center justify-between gap-3">
            <Button @click="reset">
              Reset
            </Button>

            <div class="flex flex-wrap gap-2">
              <Button @click="copySignature(activeSelector, () => copyAutoReset = true)">
                {{ copyAutoReset ? 'Copied!' : 'Copy Signature' }}
              </Button>
              <Button @click="copyHtmlSignature(activeSelector, () => copyAutoResetHtml = true)">
                {{ copyAutoResetHtml ? 'Copied!' : 'Copy HTML' }}
              </Button>
              <Button :theme="displayedTab === 'custom' ? 'primary' : 'secondary'" @click="downloadSignature(activeSelector)">
                Download HTML
              </Button>
              <Button v-if="displayedTab === 'image'" theme="primary" @click="downloadSignaturePng">
                Download PNG
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-250"
        leave-active-class="transition-opacity duration-250"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="moreOpen" class="fixed inset-0 z-50 bg-ink/40 sm:hidden" @click="moreOpen = false" />
      </Transition>
      <Transition
        enter-active-class="transition-transform duration-300 ease-custom-circ"
        leave-active-class="transition-transform duration-250 ease-custom-circ"
        enter-from-class="translate-y-full"
        leave-to-class="translate-y-full"
      >
        <div
          v-if="moreOpen"
          class="fixed inset-x-0 bottom-0 z-50 sm:hidden bg-white rounded-t-4 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
          role="dialog"
          aria-label="More actions"
        >
          <div class="mx-auto mb-3 w-10 h-1 rounded-full bg-neutral-200" aria-hidden="true" />
          <button
            type="button"
            class="w-full flex items-center gap-3 px-3 py-3.5 rounded-1.5 text-3.8 text-ink text-left hover:bg-linen cursor-pointer"
            @click="copyHtmlSignature(activeSelector, () => copyAutoResetHtml = true)"
          >
            <span class="i-ph-code size-5" aria-hidden="true" />
            {{ copyAutoResetHtml ? 'Copied!' : 'Copy HTML' }}
          </button>
          <button
            type="button"
            class="w-full flex items-center gap-3 px-3 py-3.5 rounded-1.5 text-3.8 text-ink text-left hover:bg-linen cursor-pointer"
            @click="closeMoreAfter(() => downloadSignature(activeSelector))"
          >
            <span class="i-ph-file-html size-5" aria-hidden="true" />
            Download HTML
          </button>
          <button
            v-if="displayedTab === 'image'"
            type="button"
            class="w-full flex items-center gap-3 px-3 py-3.5 rounded-1.5 text-3.8 text-ink text-left hover:bg-linen cursor-pointer"
            @click="closeMoreAfter(downloadSignaturePng)"
          >
            <span class="i-ph-file-png size-5" aria-hidden="true" />
            Download PNG
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
