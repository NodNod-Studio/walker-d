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

const { textImageUrl } = useTextImageUrl()

const wordmarkImg = computed(() => textImageUrl(COMPANY.wordmark, { weight: 'bold', fontSize: 28 }))
const fullnameImg = computed(() => textImageUrl(props.fullname, { weight: 'bold', fontSize: 13 }))
const roleImg = computed(() => textImageUrl(props.role, { weight: 'bold', fontSize: 13 }))

const laAddressLine1Img = computed(() => textImageUrl(COMPANY.offices.LA.addressLine1, { fontSize: 13 }))
const laAddressLine2Img = computed(() => textImageUrl(COMPANY.offices.LA.addressLine2, { fontSize: 13 }))
const laPhoneImg = computed(() => textImageUrl(`O: ${officePhoneDisplay(COMPANY.offices.LA.phone)}`, { fontSize: 13 }))

const nyAddressLine1Img = computed(() => textImageUrl(COMPANY.offices.NY.addressLine1, { fontSize: 13 }))
const nyAddressLine2Img = computed(() => textImageUrl(COMPANY.offices.NY.addressLine2, { fontSize: 13 }))
const nyPhoneImg = computed(() => textImageUrl(`O: ${officePhoneDisplay(COMPANY.offices.NY.phone)}`, { fontSize: 13 }))

const domainImg = computed(() => textImageUrl(COMPANY.domain, { fontSize: 13 }))
const handleImg = computed(() => textImageUrl(COMPANY.handle, { fontSize: 13 }))

const spacerImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
</script>

<template>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:none;table-layout:fixed;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:Arial,Helvetica,sans-serif;">
    <colgroup>
      <col width="168">
      <col width="139">
    </colgroup>
    <tbody>
      <tr>
        <td style="padding:0 0 1px 0;border:none;" colspan="2">
          <img :src="wordmarkImg" height="39" alt="Walker • Drawas" style="display:block;border:0;height:39px;">
        </td>
      </tr>
      <tr v-if="showNameRow">
        <td valign="top" style="padding:0 44px 10px 0;border:none;">
          <img v-if="fullname" :src="fullnameImg" height="11" alt="" :aria-label="fullname" style="display:block;border:0;height:11px;">
          <img v-else :src="spacerImg" width="1" height="11" alt="" style="display:block;border:0;height:11px;">
        </td>
        <td valign="top" style="padding:0 0 10px 0;border:none;">
          <img v-if="role" :src="roleImg" height="11" alt="" :aria-label="role" style="display:block;border:0;height:11px;">
          <img v-else :src="spacerImg" width="1" height="11" alt="" style="display:block;border:0;height:11px;">
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 44px 1px 0;border:none;">
          <img :src="laAddressLine1Img" height="11" alt="" :aria-label="COMPANY.offices.LA.addressLine1" style="display:block;border:0;height:11px;">
        </td>
        <td valign="top" style="padding:0 0 1px 0;border:none;">
          <img :src="nyAddressLine1Img" height="11" alt="" :aria-label="COMPANY.offices.NY.addressLine1" style="display:block;border:0;height:11px;">
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 44px 1px 0;border:none;">
          <img :src="laAddressLine2Img" height="11" alt="" :aria-label="COMPANY.offices.LA.addressLine2" style="display:block;border:0;height:11px;">
        </td>
        <td valign="top" style="padding:0 0 1px 0;border:none;">
          <img :src="nyAddressLine2Img" height="11" alt="" :aria-label="COMPANY.offices.NY.addressLine2" style="display:block;border:0;height:11px;">
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 44px 10px 0;border:none;">
          <a :href="officePhoneHref(COMPANY.offices.LA.phone)" rel="nofollow" style="text-decoration:none;">
            <img :src="laPhoneImg" height="11" alt="" :aria-label="`O: ${officePhoneDisplay(COMPANY.offices.LA.phone)}`" style="display:block;border:0;height:11px;">
          </a>
        </td>
        <td valign="top" style="padding:0 0 10px 0;border:none;">
          <a :href="officePhoneHref(COMPANY.offices.NY.phone)" rel="nofollow" style="text-decoration:none;">
            <img :src="nyPhoneImg" height="11" alt="" :aria-label="`O: ${officePhoneDisplay(COMPANY.offices.NY.phone)}`" style="display:block;border:0;height:11px;">
          </a>
        </td>
      </tr>
      <tr>
        <td valign="top" style="padding:0 44px 0 0;border:none;">
          <a :href="`https://${COMPANY.domain}`" rel="nofollow" style="text-decoration:none;">
            <img :src="domainImg" height="11" alt="" :aria-label="COMPANY.domain" style="display:block;border:0;height:11px;">
          </a>
        </td>
        <td valign="top" style="padding:0;border:none;">
          <a :href="COMPANY.instagramUrl" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
            <img :src="handleImg" height="11" alt="" :aria-label="COMPANY.handle" style="display:block;border:0;height:11px;">
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
