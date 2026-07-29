export const COMPANY = {
  wordmark: 'WALKER • DRAWAS',
  offices: {
    LA: {
      label: 'LA',
      phone: '310.854.6999',
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
  businessEmail: 'business@walkerdrawas.com',
  handle: '@walkerdrawas',
  instagramUrl: 'https://www.instagram.com/walkerdrawas/',
  domain: 'walkerdrawas.com',
  seenIn: [
    { label: 'FORBES', url: 'https://www.forbes.com/sites/oliviaperez/2018/07/23/meet-walker-drawas-the-marketing-agency-behind-fashions-most-coveted-brands/?sh=5cde0865294f' },
    { label: 'WWD', url: 'https://wwd.com/business-news/media/halle-berry-blm-new-bipoc-designer-program-walker-drawas-pr-1234575180/' },
    { label: 'LA TIMES', url: 'https://www.latimes.com/lifestyle/story/2020-12-11/commentary-black-lives-matter-messages-and-fashion-brands-what-now' },
  ],
} as const

export type OfficeKey = keyof typeof COMPANY.offices

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
