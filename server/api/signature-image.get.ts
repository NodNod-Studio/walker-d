import type { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
  await registerFonts()

  const query = getQuery(event)
  const fullname = signatureQueryText(query.fullname)
  const role = signatureQueryText(query.role)
  const scale = clampNumber(query.scale, 1, 4, 2)
  const part = signatureQueryPart(query.part)
  const devMode = signatureQueryDevMode(query.devMode)

  // SIGNATURE_IMAGE_VERSION (shared/utils): bump it when the layout or rendering changes.
  const cacheKey = createHash('sha1').update(`signature:${SIGNATURE_IMAGE_VERSION}:${part}:${devMode ? 'dev:' : ''}${scale}:${fullname}:${role}`).digest('hex')

  setResponseHeaders(event, {
    'Content-Type': 'image/png',
    'Content-Disposition': `inline; filename="signature-${cacheKey}.png"`,
    'Cache-Control': 'public, max-age=31536000, immutable',
  })

  const cache = useStorage('cache')

  const cached = await cache.getItemRaw<Buffer>(`signature-image:${cacheKey}.png`)
  if (cached)
    return cached

  const buffer = renderSignatureImage(fullname, role, scale, part, { devMode })
  await cache.setItemRaw(`signature-image:${cacheKey}.png`, buffer)

  return buffer
})
