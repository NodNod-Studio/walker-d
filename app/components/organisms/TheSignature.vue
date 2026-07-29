<script setup lang="ts">
import type { OfficeKey } from '~/composables/useBrandImage'
import parsePhoneNumber from 'libphonenumber-js'

const props = withDefaults(defineProps<{
  fullname?: string
  role?: string
  email?: string
  cellPhone?: string
  office?: OfficeKey
}>(), {
  fullname: '',
  role: '',
  email: '',
  cellPhone: '',
  office: 'LA',
})

function parseUsNumber(value: string) {
  return value ? parsePhoneNumber(value, 'US') : undefined
}

function displayNumber(value: string) {
  const parsed = parseUsNumber(value)
  if (!parsed)
    return ''
  return value.trim().startsWith('+') ? parsed.formatInternational() : parsed.formatNational()
}

const cellPhoneNumber = computed(() => parseUsNumber(props.cellPhone))
const cellPhoneDisplay = computed(() => displayNumber(props.cellPhone))

const showNameRow = computed(() => !!(props.fullname || cellPhoneNumber.value))
const showRoleRow = computed(() => !!(props.role || props.email))
const nameRowBottomPad = computed(() => showRoleRow.value ? 1 : 10)

const primaryOffice = computed(() => COMPANY.offices[props.office])
const secondaryOffice = computed(() => COMPANY.offices[props.office === 'LA' ? 'NY' : 'LA'])
const officePhoneNumber = computed(() => parseUsNumber(primaryOffice.value.phone))
const officePhoneDisplay = computed(() => displayNumber(primaryOffice.value.phone))

const { textImageUrl } = useTextImageUrl()

const wordmarkImg = computed(() => textImageUrl(COMPANY.wordmark, { weight: 'bold', fontSize: 28 }))
const fullnameImg = computed(() => textImageUrl(props.fullname, { weight: 'bold', fontSize: 13 }))
const roleImg = computed(() => textImageUrl(props.role, { weight: 'bold', fontSize: 13 }))
const cellPhoneImg = computed(() => cellPhoneNumber.value ? textImageUrl(`C: ${cellPhoneDisplay.value}`, { fontSize: 13 }) : '')
const emailImg = computed(() => textImageUrl(props.email, { fontSize: 13 }))

const primaryAddressLine1Img = computed(() => textImageUrl(primaryOffice.value.addressLine1, { fontSize: 13 }))
const primaryAddressLine2Img = computed(() => textImageUrl(primaryOffice.value.addressLine2, { fontSize: 13 }))
const officePhoneImg = computed(() => textImageUrl(`O: ${officePhoneDisplay.value}`, { fontSize: 13 }))
const businessEmailImg = computed(() => textImageUrl(COMPANY.businessEmail, { fontSize: 13 }))

const secondaryAddressLine1Img = computed(() => textImageUrl(secondaryOffice.value.addressLine1, { fontSize: 13 }))
const secondaryAddressLine2Img = computed(() => textImageUrl(secondaryOffice.value.addressLine2, { fontSize: 13 }))
const handleImg = computed(() => textImageUrl(COMPANY.handle, { fontSize: 13 }))
const domainImg = computed(() => textImageUrl(COMPANY.domain, { fontSize: 13 }))

const seenInLabelImg = computed(() => textImageUrl('As seen in', { fontSize: 13 }))
const seenInPipeImg = computed(() => textImageUrl('|', { fontSize: 13, lineHeight: 1 }))
const seenInItemImgs = computed(() => COMPANY.seenIn.map(item => ({ ...item, img: textImageUrl(item.label, { fontSize: 13, lineHeight: 1 }) })))

const spacerImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
</script>

<template>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;table-layout:fixed;font-family:Arial,Helvetica,sans-serif;">
    <colgroup>
      <col width="162">
      <col width="145">
    </colgroup>
    <tbody>
      <tr>
        <td style="padding:0 0 12px 0;" colspan="2">
          <img :src="wordmarkImg" height="39" alt="Walker • Drawas" style="display:block;border:0;height:39px;">
        </td>
      </tr>
      <tr v-if="showNameRow">
        <td valign="top" :style="`padding:0 44px ${nameRowBottomPad}px 0;`">
          <img v-if="fullname" :src="fullnameImg" height="11" alt="" :aria-label="fullname" style="display:block;border:0;height:11px;">
          <img v-else :src="spacerImg" width="1" height="11" alt="" style="display:block;border:0;height:11px;">
        </td>
        <td valign="top" :style="`padding:0 0 ${nameRowBottomPad}px 0;`">
          <a v-if="cellPhoneNumber" :href="`tel:${cellPhoneNumber.format('E.164')}`" rel="nofollow" style="text-decoration:none;">
            <img :src="cellPhoneImg" height="11" alt="" :aria-label="`C: ${cellPhoneDisplay}`" style="display:block;border:0;height:11px;">
          </a>
          <img v-else :src="spacerImg" width="1" height="11" alt="" style="display:block;border:0;height:11px;">
        </td>
      </tr>
      <tr v-if="showRoleRow">
        <td valign="top" style="padding:0 44px 10px 0;">
          <img v-if="role" :src="roleImg" height="11" alt="" :aria-label="role" style="display:block;border:0;height:11px;">
          <img v-else :src="spacerImg" width="1" height="11" alt="" style="display:block;border:0;height:11px;">
        </td>
        <td valign="top" style="padding:0 0 10px 0;">
          <a v-if="email" :href="`mailto:${email}`" rel="nofollow" style="text-decoration:none;">
            <img :src="emailImg" height="11" alt="" :aria-label="email" style="display:block;border:0;height:11px;">
          </a>
          <img v-else :src="spacerImg" width="1" height="11" alt="" style="display:block;border:0;height:11px;">
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 44px 1px 0;">
          <img :src="primaryAddressLine1Img" height="11" alt="" :aria-label="primaryOffice.addressLine1" style="display:block;border:0;height:11px;">
        </td>
        <td valign="top" style="padding:0 0 1px 0;">
          <a :href="`tel:${officePhoneNumber!.format('E.164')}`" rel="nofollow" style="text-decoration:none;">
            <img :src="officePhoneImg" height="11" alt="" :aria-label="`O: ${officePhoneDisplay}`" style="display:block;border:0;height:11px;">
          </a>
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 44px 10px 0;">
          <img :src="primaryAddressLine2Img" height="11" alt="" :aria-label="primaryOffice.addressLine2" style="display:block;border:0;height:11px;">
        </td>
        <td valign="top" style="padding:0 0 10px 0;">
          <a :href="`mailto:${COMPANY.businessEmail}`" rel="nofollow" style="text-decoration:none;">
            <img :src="businessEmailImg" height="11" alt="" :aria-label="COMPANY.businessEmail" style="display:block;border:0;height:11px;">
          </a>
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 44px 1px 0;">
          <img :src="secondaryAddressLine1Img" height="11" alt="" :aria-label="secondaryOffice.addressLine1" style="display:block;border:0;height:11px;">
        </td>
        <td valign="top" style="padding:0 0 1px 0;">
          <a :href="COMPANY.instagramUrl" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
            <img :src="handleImg" height="11" alt="" :aria-label="COMPANY.handle" style="display:block;border:0;height:11px;">
          </a>
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 44px 10px 0;">
          <img :src="secondaryAddressLine2Img" height="11" alt="" :aria-label="secondaryOffice.addressLine2" style="display:block;border:0;height:11px;">
        </td>
        <td valign="top" style="padding:0 0 10px 0;">
          <a :href="`https://${COMPANY.domain}`" rel="nofollow" style="text-decoration:none;">
            <img :src="domainImg" height="11" alt="" :aria-label="COMPANY.domain" style="display:block;border:0;height:11px;">
          </a>
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 44px 1px 0;">
          <img :src="seenInLabelImg" height="11" alt="As seen in" style="display:block;border:0;height:11px;">
        </td>
        <td style="padding:0;">
          <img :src="spacerImg" width="1" height="11" alt="" style="display:block;border:0;height:11px;">
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 44px 0 0;">
          <template v-for="(item, i) in seenInItemImgs" :key="item.label">
            <a :href="item.url" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
              <img :src="item.img" height="9" :alt="item.label" style="display:inline-block;vertical-align:top;border:0;height:9px;border-bottom:0.5px solid #000000;">
            </a>
            <img v-if="i < seenInItemImgs.length - 1" :src="seenInPipeImg" height="9" alt="" style="display:inline-block;vertical-align:top;border:0;height:9px;margin:0 4px;">
          </template>
        </td>
        <td style="padding:0;" />
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
img {
  max-width: none;
}
</style>
