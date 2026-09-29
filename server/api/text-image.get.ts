import type { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { createCanvas } from '@napi-rs/canvas'

function renderTextImage(text: string, weightKey: WeightKey, fontSize: number, lineHeight: number, scale: number) {
  const family = FONT_FAMILIES[weightKey]
  const lines = normalizeLines(text)
  const { width, height, lineHeightPx } = measureTextBox(lines, family, fontSize, lineHeight)

  const canvas = createCanvas(Math.ceil(width * scale), Math.ceil(height * scale))
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.font = `${fontSize}px "${family}"`
  ctx.fillStyle = COLOR
  ctx.textBaseline = 'top'

  lines.forEach((line, i) => {
    ctx.fillText(line, 0, i * lineHeightPx)
  })

  return canvas.toBuffer('image/png')
}

export default defineEventHandler(async (event) => {
  await registerFonts()

  const query = getQuery(event)
  const { text, weightKey, fontSize, lineHeight, scale } = parseTextQuery(query)

  if (!text) {
    throw createError({ statusCode: 400, statusMessage: 'Missing "text" query parameter' })
  }

  const cacheKey = createHash('sha1').update(`${weightKey}:${fontSize}:${lineHeight}:${scale}:${text}`).digest('hex')

  setResponseHeaders(event, {
    'Content-Type': 'image/png',
    'Content-Disposition': `inline; filename="text-${cacheKey}.png"`,
    'Cache-Control': 'public, max-age=31536000, immutable',
  })

  const cache = useStorage('cache')

  const cached = await cache.getItemRaw<Buffer>(`text-image:${cacheKey}.png`)
  if (cached)
    return cached

  const buffer = renderTextImage(text, weightKey, fontSize, lineHeight, scale)
  await cache.setItemRaw(`text-image:${cacheKey}.png`, buffer)

  return buffer
})
