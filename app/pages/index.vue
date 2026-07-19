<script setup lang="ts">
import { isValidPhoneNumber } from 'libphonenumber-js'

useSeoMeta({
  robots: 'noindex, nofollow',
  title: 'Walker•Drawas Signature Generator',
})

const { textImageUrl } = useTextImageUrl()
const wordmarkImg = textImageUrl(COMPANY.wordmark, { weight: 'bold', fontSize: 22 })

const initialValues = {
  fullname: '',
  role: '',
  email: '',
  phone: '',
}

const values = reactive({ ...initialValues })
const phoneTouched = ref(false)

function reset() {
  Object.assign(values, initialValues)
  phoneTouched.value = false
}

const presets = [
  { fullname: 'Adam Drawas', role: 'Owner', email: 'adam@walkerdrawas.com', phone: '310.854.6700' },
  { fullname: 'Jennifer Walker', role: 'Owner', email: 'jennifer@walkerdrawas.com', phone: '310.854.6700' },
  { fullname: 'Andia Knox', role: 'Senior Vice President', email: 'andia@walkerdrawas.com', phone: '310.854.6700' },
  { fullname: 'Courtney Prosniewski', role: 'Senior Account Manager', email: 'courtney@walkerdrawas.com', phone: '310.854.6700' },
] as const

function applyPreset(preset: typeof presets[number]) {
  Object.assign(values, preset)
}

const isPhoneValid = computed(() => {
  if (!values.phone)
    return true
  return values.phone.trim().startsWith('+')
    ? isValidPhoneNumber(values.phone)
    : isValidPhoneNumber(values.phone, 'US')
})

const copyAutoReset = refAutoReset(false, 2000)
const copyAutoResetHtml = refAutoReset(false, 2000)

function copySignature() {
  const el = document.querySelector('.sign') as HTMLElement
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
    copyAutoReset.value = true
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
    </head>
`

const tail = `
    </body>
  </html>
`

function copyHtmlSignature() {
  const el = document.querySelector('.sign') as HTMLElement
  if (!el)
    return
  const html = el.innerHTML
  const wrappedHtml = head + html + tail
  navigator.clipboard.writeText(wrappedHtml).then(() => {
    copyAutoResetHtml.value = true
  }).catch((err) => {
    console.error('Failed to copy text: ', err)
  })
}

function downloadSignature() {
  const el = document.querySelector('.sign') as HTMLElement
  if (!el)
    return
  const html = el.innerHTML
  const wrappedHtml = head + html + tail
  const blob = new Blob([wrappedHtml], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'signature.html'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="page">
    <header class="header">
      <img :src="wordmarkImg" height="18" alt="Walker • Drawas" class="brand-logo">
    </header>

    <div class="container">
      <div class="presets">
        <p class="presets-label">
          Quick fill:
        </p>
        <div class="presets-group">
          <Button
            v-for="preset in presets"
            :key="preset.email"
            @click="applyPreset(preset)"
          >
            {{ preset.fullname }}
          </Button>
        </div>
      </div>

      <form class="form" novalidate @submit.prevent>
        <div class="grid">
          <TextField v-model="values.fullname" label="Full Name" />
          <TextField v-model="values.role" label="Role" />
          <TextField v-model="values.email" label="Email" type="email" />
          <TextField
            v-model="values.phone"
            label="Phone"
            type="tel"
            placeholder="310.123.4567"
            :error="phoneTouched && !isPhoneValid ? 'Enter a valid US number, or an international number starting with +' : undefined"
            @blur="phoneTouched = true"
          />
        </div>
      </form>

      <div class="preview-box">
        <p class="preview-label">
          Signature Preview:
        </p>
        <div class="preview-inner">
          <TheSignature
            class="sign"
            :fullname="values.fullname"
            :role="values.role"
            :email="values.email"
            :phone="values.phone"
          />
        </div>
      </div>

      <div class="actions">
        <Button @click="reset">
          Reset
        </Button>

        <div class="actions-group">
          <Button @click="copySignature">
            {{ copyAutoReset ? 'Copied!' : 'Copy Signature' }}
          </Button>
          <Button @click="copyHtmlSignature">
            {{ copyAutoResetHtml ? 'Copied!' : 'Copy HTML' }}
          </Button>
          <Button theme="primary" @click="downloadSignature">
            Download HTML
          </Button>
        </div>
      </div>

      <div class="help">
        <h3 class="help-title">
          How to install HTML signatures
        </h3>
        <div class="help-body">
          <a
            href="https://matt.coneybeare.me/how-to-make-an-html-signature-in-apple-mail-for-macos-sonoma-14/"
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="help-link"
          >
            How to add an HTML signature in Apple Mail (macOS Sonoma)
          </a>
          <div class="help-note">
            <h4 class="help-note-title">
              iOS Mail tip
            </h4>
            <p>
              After pasting the signature in iOS Mail, shake your iPhone to trigger undo:
              this removes the default formatting iOS adds and lets the signature render correctly.
            </p>
          </div>
        </div>
      </div>
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

.header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eee;
}

.brand-logo {
  display: block;
  height: 18px;
  width: auto;
}

.presets {
  margin-bottom: 1.5rem;
}

.presets-label {
  font-size: 0.75rem;

  color: rgba(17, 17, 17, 0.55);
  margin: 0 0 0.5rem;
}

.presets-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.container {
  max-width: 960px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 1.5rem 3rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem 0.75rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}

.preview-box {
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 10px;
  background: #f5f5f3;
}

.preview-label {
  font-size: 0.75rem;

  color: rgba(17, 17, 17, 0.5);
  margin: 0 0 0.5rem;
}

.preview-inner {
  padding: 1rem;
  border-radius: 6px;
  background: #fff;
  box-shadow: inset 0 0 0 1px #eee;
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.actions-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.help {
  margin-top: 3rem;
  padding-top: 1rem;
}

.help-title {
  font-size: 0.8rem;

  color: rgba(17, 17, 17, 0.5);
  margin: 0 0 1.25rem;
}

.help-body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
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

.help-note {
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 6px;
  background: #f5f5f3;
}

.help-note-title {
  font-size: 0.75rem;

  color: rgba(17, 17, 17, 0.5);
  margin: 0 0 0.25rem;
}

.help-note p {
  font-size: 0.85rem;
  color: rgba(17, 17, 17, 0.6);
  margin: 0;
}
</style>
