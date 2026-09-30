export function useTextImageUrl() {
  const origin = useRequestURL().origin

  /** URL of a text rendered as an image in the brand font, via /api/text-image. */
  function textImageUrl(text: string, opts: { weight?: 'regular' | 'bold', fontSize: number, lineHeight?: number, scale?: number }) {
    if (!text)
      return ''

    const params = new URLSearchParams({
      text,
      weight: opts.weight ?? 'regular',
      fontSize: String(opts.fontSize),
      lineHeight: String(opts.lineHeight ?? 1.2),
      scale: String(opts.scale ?? 2),
    })

    return `${origin}/api/text-image?${params.toString()}`
  }

  return { textImageUrl }
}
