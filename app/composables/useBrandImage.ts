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

export function useTextImageUrl() {
  const origin = useRequestURL().origin

  function textImageUrl(text: string, opts: { weight?: 'regular' | 'bold', fontSize: number, lineHeight?: number }) {
    if (!text)
      return ''

    const params = new URLSearchParams({
      text,
      weight: opts.weight ?? 'regular',
      fontSize: String(opts.fontSize),
      lineHeight: String(opts.lineHeight ?? 1.2),
      scale: '3',
    })

    return `${origin}/api/text-image?${params.toString()}`
  }

  return { textImageUrl }
}
