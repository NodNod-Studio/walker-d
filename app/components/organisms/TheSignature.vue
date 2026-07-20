<script setup lang="ts">
import parsePhoneNumber from 'libphonenumber-js'

const props = withDefaults(defineProps<{
  fullname?: string
  role?: string
  email?: string
  phone?: string
}>(), {
  fullname: '',
  role: '',
  email: '',
  phone: '',
})

const phoneNumber = computed(() => props.phone ? parsePhoneNumber(props.phone, 'US') : undefined)

const phoneDisplay = computed(() => {
  if (!phoneNumber.value)
    return ''
  return props.phone.trim().startsWith('+')
    ? phoneNumber.value.formatInternational()
    : phoneNumber.value.formatNational()
})

const { textImageUrl } = useTextImageUrl()

const wordmarkImg = computed(() => textImageUrl(COMPANY.wordmark, { weight: 'bold', fontSize: 28 }))
const fullnameImg = computed(() => textImageUrl(props.fullname, { weight: 'bold', fontSize: 13 }))
const roleImg = computed(() => textImageUrl(props.role, { weight: 'bold', fontSize: 13 }))
const addressImg = computed(() => textImageUrl(`${COMPANY.addressLine1}\n${COMPANY.addressLine2}`, { fontSize: 13, lineHeight: 1.4 }))
const phoneLabelImg = computed(() => phoneNumber.value ? textImageUrl(`O: ${phoneDisplay.value}`, { fontSize: 13 }) : '')
const emailImg = computed(() => textImageUrl(props.email, { fontSize: 13 }))
const seenInLabelImg = computed(() => textImageUrl('As seen in', { fontSize: 13 }))
const seenInImg = computed(() => textImageUrl(COMPANY.seenIn, { fontSize: 13 }))

type HeaderRow = { type: 'fullname' | 'role' | 'phone' | 'email' } | null

function packRows(items: HeaderRow[], rowCount: number): HeaderRow[] {
  const rows = [...items]
  while (rows.length < rowCount)
    rows.push(null)
  return rows
}

const leftItems = computed<HeaderRow[]>(() => [
  ...(props.fullname ? [{ type: 'fullname' as const }] : []),
  ...(props.role ? [{ type: 'role' as const }] : []),
])
const rightItems = computed<HeaderRow[]>(() => [
  ...(phoneNumber.value ? [{ type: 'phone' as const }] : []),
  ...(props.email ? [{ type: 'email' as const }] : []),
])
const headerRowCount = computed(() => Math.max(leftItems.value.length, rightItems.value.length))
const leftRows = computed(() => packRows(leftItems.value, headerRowCount.value))
const rightRows = computed(() => packRows(rightItems.value, headerRowCount.value))

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
      <tr>
        <td valign="top" width="130" style="padding:0 100px 0 0;max-width:130px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tbody>
              <tr v-for="(row, i) in leftRows" :key="i">
                <td :style="`padding:0 0 ${i === leftRows.length - 1 ? 10 : 1}px 0;height:11px;`">
                  <img v-if="row?.type === 'fullname'" :src="fullnameImg" height="11" alt="" :aria-label="fullname" style="display:block;border:0;height:11px;">
                  <img v-else-if="row?.type === 'role'" :src="roleImg" height="11" alt="" :aria-label="role" style="display:block;border:0;height:11px;">
                  <img v-else :src="spacerImg" width="1" height="11" alt="" style="display:block;border:0;height:11px;">
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  <img :src="addressImg" height="24" alt="" :aria-label="`${COMPANY.addressLine1}, ${COMPANY.addressLine2}`" style="display:block;border:0;height:24px;">
                </td>
              </tr>
            </tbody>
          </table>
        </td>
        <td valign="top" width="145" style="padding:0;max-width:145px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tbody>
              <tr v-for="(row, i) in rightRows" :key="i">
                <td :style="`padding:0 0 ${i === rightRows.length - 1 ? 10 : 1}px 0;height:11px;`">
                  <a v-if="row?.type === 'phone'" :href="`tel:${phoneNumber!.format('E.164')}`" rel="nofollow" style="text-decoration:none;">
                    <img :src="phoneLabelImg" height="11" alt="" :aria-label="`O: ${phoneDisplay}`" style="display:block;border:0;height:11px;">
                  </a>
                  <a v-else-if="row?.type === 'email'" :href="`mailto:${email}`" rel="nofollow" style="text-decoration:none;">
                    <img :src="emailImg" height="11" alt="" :aria-label="email" style="display:block;border:0;height:11px;">
                  </a>
                  <img v-else :src="spacerImg" width="1" height="11" alt="" style="display:block;border:0;height:11px;">
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 1px 0;">
                  <img :src="seenInLabelImg" height="11" alt="As seen in" style="display:block;border:0;height:11px;">
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  <img :src="seenInImg" height="11" :alt="COMPANY.seenIn" style="display:block;border:0;height:11px;">
                </td>
              </tr>
            </tbody>
          </table>
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
