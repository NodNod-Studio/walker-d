import parsePhoneNumber from 'libphonenumber-js'

export const COMPANY = {
  wordmark: 'WALKER • DRAWAS',
  offices: {
    LA: {
      label: 'LA',
      phone: '310.854.6700',
      addressLine1: '8057 Beverly Blvd., Suite 100',
      addressLine2: 'Los Angeles, CA, 90048',
    },
    NY: {
      label: 'NY',
      phone: '646.370.4096',
      addressLine1: '118 Mercer Street, Floor 2',
      addressLine2: 'New York, NY, 10012',
    },
  },
  handle: '@walkerdrawas',
  instagramUrl: 'https://www.instagram.com/walkerdrawas/',
  domain: 'walkerdrawas.com',
} as const

export function officePhoneDisplay(phone: string) {
  const parsed = parsePhoneNumber(phone, 'US')
  return parsed ? parsed.formatNational() : phone
}

export function officePhoneHref(phone: string) {
  const parsed = parsePhoneNumber(phone, 'US')
  return parsed ? `tel:${parsed.format('E.164')}` : `tel:${phone}`
}
