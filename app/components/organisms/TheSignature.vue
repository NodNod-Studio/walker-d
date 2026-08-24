<script setup lang="ts">
import parsePhoneNumber from 'libphonenumber-js'

const props = withDefaults(defineProps<{
  fullname?: string
  role?: string
}>(), {
  fullname: '',
  role: '',
})

function officePhoneDisplay(phone: string) {
  const parsed = parsePhoneNumber(phone, 'US')
  return parsed ? parsed.formatNational() : phone
}

function officePhoneHref(phone: string) {
  const parsed = parsePhoneNumber(phone, 'US')
  return parsed ? `tel:${parsed.format('E.164')}` : `tel:${phone}`
}

const showNameRow = computed(() => !!(props.fullname || props.role))

const laPhoneText = `O: ${officePhoneDisplay(COMPANY.offices.LA.phone)}`
const nyPhoneText = `O: ${officePhoneDisplay(COMPANY.offices.NY.phone)}`

const wordmarkImg = useTextImageDataUrl(COMPANY.wordmark, { weight: 'bold', fontSize: 28 })
const fullnameImg = useTextImageDataUrl(() => props.fullname, { weight: 'bold', fontSize: 13 })
const roleImg = useTextImageDataUrl(() => props.role, { weight: 'bold', fontSize: 13 })

const laAddressLine1Img = useTextImageDataUrl(COMPANY.offices.LA.addressLine1, { fontSize: 13 })
const laAddressLine2Img = useTextImageDataUrl(COMPANY.offices.LA.addressLine2, { fontSize: 13 })
const laPhoneImg = useTextImageDataUrl(laPhoneText, { fontSize: 13 })

const nyAddressLine1Img = useTextImageDataUrl(COMPANY.offices.NY.addressLine1, { fontSize: 13 })
const nyAddressLine2Img = useTextImageDataUrl(COMPANY.offices.NY.addressLine2, { fontSize: 13 })
const nyPhoneImg = useTextImageDataUrl(nyPhoneText, { fontSize: 13 })

const domainImg = useTextImageDataUrl(COMPANY.domain, { fontSize: 13 })
const handleImg = useTextImageDataUrl(COMPANY.handle, { fontSize: 13 })

const spacerImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

const wordmarkWidth = useTextImageWidth(COMPANY.wordmark, { weight: 'bold', fontSize: 28, displayHeight: 39 })

/**
 * The NY column should start exactly where "DRAWAS" starts inside the
 * "WALKER • DRAWAS" wordmark image, not at an arbitrary fixed column width.
 * We measure the "WALKER • " prefix at the same font/size/displayHeight as
 * the wordmark itself, so the ratio-to-pixel conversion matches exactly,
 * and use it as the LA column's width.
 */
const wordmarkPrefix = COMPANY.wordmark.replace(/DRAWAS$/, '')
const wordmarkPrefixWidth = useTextImageWidth(wordmarkPrefix, { weight: 'bold', fontSize: 28, displayHeight: 39 })
const laColWidth = computed(() =>( wordmarkPrefixWidth.value ?? 168) + 10) 
const nyColWidth = computed(() => (wordmarkWidth.value && wordmarkPrefixWidth.value)
  ? Math.max(wordmarkWidth.value - wordmarkPrefixWidth.value, 1)
  : 139)
const fullnameWidth = useTextImageWidth(() => props.fullname, { weight: 'bold', fontSize: 13, displayHeight: 11 })
const roleWidth = useTextImageWidth(() => props.role, { weight: 'bold', fontSize: 13, displayHeight: 11 })

const laAddressLine1Width = useTextImageWidth(COMPANY.offices.LA.addressLine1, { fontSize: 13, displayHeight: 11 })
const laAddressLine2Width = useTextImageWidth(COMPANY.offices.LA.addressLine2, { fontSize: 13, displayHeight: 11 })
const laPhoneWidth = useTextImageWidth(laPhoneText, { fontSize: 13, displayHeight: 11 })

const nyAddressLine1Width = useTextImageWidth(COMPANY.offices.NY.addressLine1, { fontSize: 13, displayHeight: 11 })
const nyAddressLine2Width = useTextImageWidth(COMPANY.offices.NY.addressLine2, { fontSize: 13, displayHeight: 11 })
const nyPhoneWidth = useTextImageWidth(nyPhoneText, { fontSize: 13, displayHeight: 11 })

const domainWidth = useTextImageWidth(COMPANY.domain, { fontSize: 13, displayHeight: 11 })
const handleWidth = useTextImageWidth(COMPANY.handle, { fontSize: 13, displayHeight: 11 })

const wordmarkStyle = textImageStyle(wordmarkWidth, 39)
const fullnameStyle = textImageStyle(fullnameWidth, 11)
const roleStyle = textImageStyle(roleWidth, 11)
const laAddressLine1Style = textImageStyle(laAddressLine1Width, 11)
const laAddressLine2Style = textImageStyle(laAddressLine2Width, 11)
const laPhoneStyle = textImageStyle(laPhoneWidth, 11)
const nyAddressLine1Style = textImageStyle(nyAddressLine1Width, 11)
const nyAddressLine2Style = textImageStyle(nyAddressLine2Width, 11)
const nyPhoneStyle = textImageStyle(nyPhoneWidth, 11)
const domainStyle = textImageStyle(domainWidth, 11)
const handleStyle = textImageStyle(handleWidth, 11)
</script>

<template>
  <!--
    Single flat table, no nesting: a table-within-a-table is where Outlook's
    Word rendering engine tends to mangle signatures on reply/forward, and
    this two-column (LA/NY) layout doesn't need one.
    Every <td> carries font-size:0/line-height:0 (+ mso-line-height-rule)
    because Word treats <img> as inline and otherwise reserves descender
    space below it, which shows up as unexplained extra spacing in Outlook.
  -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:none;table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:Arial,Helvetica,sans-serif;mso-line-height-rule:exactly;">
    <colgroup>
      <col :width="laColWidth">
      <col :width="nyColWidth">
    </colgroup>
    <tbody>
      <tr>
        <td style="padding:0 0 1px 0;border:none;font-size:0;line-height:0;mso-line-height-rule:exactly;" colspan="2">
          <img :src="wordmarkImg" :width="wordmarkWidth" height="39" alt="Walker • Drawas" border="0" :style="wordmarkStyle">
        </td>
      </tr>
      <tr v-if="showNameRow">
        <td valign="top" style="border:none;font-size:0;line-height:0;mso-line-height-rule:exactly;" :style="`width:${laColWidth}px;`">
          <img v-if="fullname" :src="fullnameImg" :width="fullnameWidth" height="11" :alt="fullname" border="0" :style="fullnameStyle">
          <img v-else :src="spacerImg" width="1" height="11" alt="" border="0" style="display:block;border:0;height:11px;">
        </td>
        <td valign="top" style="padding:0 0 10px 0;border:none;font-size:0;line-height:0;mso-line-height-rule:exactly;" :style="`width:${nyColWidth}px;`">
          <img v-if="role" :src="roleImg" :width="roleWidth" height="11" :alt="role" border="0" :style="roleStyle">
          <img v-else :src="spacerImg" width="1" height="11" alt="" border="0" style="display:block;border:0;height:11px;">
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 0 1px 0;border:none;font-size:0;line-height:0;mso-line-height-rule:exactly;" :style="`width:${laColWidth}px;`">
          <img :src="laAddressLine1Img" :width="laAddressLine1Width" height="11" :alt="COMPANY.offices.LA.addressLine1" border="0" :style="laAddressLine1Style">
        </td>
        <td valign="top" style="padding:0 0 1px 0;border:none;font-size:0;line-height:0;mso-line-height-rule:exactly;" :style="`width:${nyColWidth}px;`">
          <img :src="nyAddressLine1Img" :width="nyAddressLine1Width" height="11" :alt="COMPANY.offices.NY.addressLine1" border="0" :style="nyAddressLine1Style">
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 0 1px 0;border:none;font-size:0;line-height:0;mso-line-height-rule:exactly;" :style="`width:${laColWidth}px;`">
          <img :src="laAddressLine2Img" :width="laAddressLine2Width" height="11" :alt="COMPANY.offices.LA.addressLine2" border="0" :style="laAddressLine2Style">
        </td>
        <td valign="top" style="padding:0 0 1px 0;border:none;font-size:0;line-height:0;mso-line-height-rule:exactly;" :style="`width:${nyColWidth}px;`">
          <img :src="nyAddressLine2Img" :width="nyAddressLine2Width" height="11" :alt="COMPANY.offices.NY.addressLine2" border="0" :style="nyAddressLine2Style">
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 0 10px 0;border:none;font-size:0;line-height:0;mso-line-height-rule:exactly;" :style="`width:${laColWidth}px;`">
          <a :href="officePhoneHref(COMPANY.offices.LA.phone)" rel="nofollow" border="0" style="text-decoration:none;border:0;outline:none;">
            <img :src="laPhoneImg" :width="laPhoneWidth" height="11" :alt="laPhoneText" border="0" :style="laPhoneStyle">
          </a>
        </td>
        <td valign="top" style="padding:0 0 10px 0;border:none;font-size:0;line-height:0;mso-line-height-rule:exactly;" :style="`width:${nyColWidth}px;`">
          <a :href="officePhoneHref(COMPANY.offices.NY.phone)" rel="nofollow" border="0" style="text-decoration:none;border:0;outline:none;">
            <img :src="nyPhoneImg" :width="nyPhoneWidth" height="11" :alt="nyPhoneText" border="0" :style="nyPhoneStyle">
          </a>
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 0 0 0;border:none;font-size:0;line-height:0;mso-line-height-rule:exactly;" :style="`width:${laColWidth}px;`">
          <a :href="`https://${COMPANY.domain}`" rel="nofollow" border="0" style="text-decoration:none;border:0;outline:none;">
            <img :src="domainImg" :width="domainWidth" height="11" :alt="COMPANY.domain" border="0" :style="domainStyle">
          </a>
        </td>
        <td valign="top" style="padding:0 0 0 0;border:none;font-size:0;line-height:0;mso-line-height-rule:exactly;" :style="`width:${nyColWidth}px;`">
          <a :href="COMPANY.instagramUrl" target="_blank" rel="noopener noreferrer" border="0" style="text-decoration:none;border:0;outline:none;">
            <img :src="handleImg" :width="handleWidth" height="11" :alt="COMPANY.handle" border="0" :style="handleStyle">
          </a>
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
