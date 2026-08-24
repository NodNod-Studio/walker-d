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

  function textImageUrl(text: string, opts: { weight?: 'regular' | 'bold', fontSize: number, lineHeight?: number, scale?: number }) {
    if (!text)
      return ''

    const params = new URLSearchParams({
      text,
      weight: opts.weight ?? 'regular',
      fontSize: String(opts.fontSize),
      lineHeight: String(opts.lineHeight ?? 1.2),
      scale: String(opts.scale ?? 3),
    })

    return `${origin}/api/text-image?${params.toString()}`
  }

  function textImageMetaUrl(text: string, opts: { weight?: 'regular' | 'bold', fontSize: number, lineHeight?: number }) {
    if (!text)
      return ''

    const params = new URLSearchParams({
      text,
      weight: opts.weight ?? 'regular',
      fontSize: String(opts.fontSize),
      lineHeight: String(opts.lineHeight ?? 1.2),
    })

    return `${origin}/api/text-image-meta?${params.toString()}`
  }

  return { textImageUrl, textImageMetaUrl }
}

/**
 * Outlook's Word-based rendering engine sizes <img> unreliably when only
 * `height` is set, which is one of the ways these signatures have broken in
 * client threads. /api/text-image-meta returns the true (unscaled) box the
 * image was drawn at, so we can derive an exact `width` to pair with each
 * fixed display height instead of leaving it to be inferred.
 */
export function useTextImageWidth(text: MaybeRefOrGetter<string>, opts: { weight?: 'regular' | 'bold', fontSize: number, lineHeight?: number, displayHeight: number }) {
  const { textImageMetaUrl } = useTextImageUrl()

  const url = computed(() => textImageMetaUrl(toValue(text), opts))

  const { data } = useAsyncData(
    () => `text-image-meta:${url.value}`,
    async () => {
      if (!url.value)
        return null
      const meta = await $fetch<{ width: number, height: number }>(url.value)
      return meta.height ? Math.round((meta.width / meta.height) * opts.displayHeight) : null
    },
    { watch: [url] },
  )

  return computed(() => data.value ?? undefined)
}

export function textImageStyle(width: ComputedRef<number | undefined>, height: number) {
  return computed(() => `display:block;border:0;height:${height}px;${width.value ? `width:${width.value}px;` : ''}`)
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined')
    return Buffer.from(buffer).toString('base64')

  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize)
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))

  return btoa(binary)
}

export function useTextImageDataUrl(text: MaybeRefOrGetter<string>, opts: { weight?: 'regular' | 'bold', fontSize: number, lineHeight?: number, scale?: number }) {
  const { textImageUrl } = useTextImageUrl()

  const url = computed(() => textImageUrl(toValue(text), opts))

  const { data } = useAsyncData(
    () => `text-image-data-url:${url.value}`,
    async () => {
      if (!url.value)
        return ''
      const buffer = await $fetch<ArrayBuffer>(url.value, { responseType: 'arrayBuffer' })
      return `data:image/png;base64,${arrayBufferToBase64(buffer)}`
    },
    { watch: [url] },
  )

  return computed(() => data.value ?? '')
}
