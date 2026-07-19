export const COMPANY = {
  wordmark: 'WALKER • DRAWAS',
  addressLine1: '8057 Beverly Blvd., Suite 100',
  addressLine2: 'Los Angeles, CA, 90048',
  domain: 'walkerdrawas.com',
  seenIn: 'FORBES | WWD | LA TIMES',
}

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
