<script setup lang="ts">
const props = withDefaults(defineProps<{
  fullname?: string
  role?: string
}>(), {
  fullname: '',
  role: '',
})

const SCALE = 2

const origin = useRequestURL().origin
const query = computed(() => new URLSearchParams({ fullname: props.fullname, role: props.role }).toString())
const src = computed(() => `${origin}/api/signature-image?${query.value}&scale=${SCALE}`)

/**
 * The PNG is rendered at SCALE× for retina sharpness, so its display size
 * isn't its pixel size. Fetching the layout box up front (during SSR too)
 * gives the <img> its final width/height before it loads, so it doesn't
 * jump on load; Outlook also sizes <img> unreliably without them.
 */
const { data: size } = useAsyncData(
  () => `signature-image-meta:${query.value}`,
  () => $fetch<{ width: number, height: number }>(`${origin}/api/signature-image-meta?${query.value}`),
  { watch: [query] },
)

// Line height = image height: 0 makes Outlook crop the image.
const cellStyle = computed(() => {
  const lh = size.value ? `${size.value.height}px` : 'normal'
  return `padding:0;border:none;font-size:${lh};line-height:${lh};mso-line-height-rule:exactly;`
})

const alt =computed(() => [COMPANY.wordmark, props.fullname, props.role].filter(Boolean).join(' – '))
</script>

<template>
  <!-- Hidden text: iOS drops image-only signatures. -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:none;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:Arial,Helvetica,sans-serif;mso-line-height-rule:exactly;">
    <tbody>
      <tr>
        <td :style="cellStyle">
          <a :href="`https://${COMPANY.domain}`" rel="nofollow" border="0" style="text-decoration:none;border:0;outline:none;display:block;" :style="cellStyle">
            <img
              :src="src"
              :width="size?.width"
              :height="size?.height"
              :alt="alt"
              border="0"
              :style="`display:block;border:0;${size ? `width:${size.width}px;height:${size.height}px;` : ''}`"
            >
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:0;border:none;font-size:1px;line-height:1px;mso-line-height-rule:exactly;">
          <span style="display:block;height:1px;max-height:1px;overflow:hidden;font-size:1px;line-height:1px;mso-line-height-rule:exactly;color:#ffffff;mso-hide:all;">Walker Drawas</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
img {
  max-width: none;
}
</style>
