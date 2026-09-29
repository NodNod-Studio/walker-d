/**
 * Returns the natural (unscaled) pixel box a /api/text-image render would
 * produce for the same params, so callers can set explicit width/height on
 * the <img> instead of leaving Outlook to guess proportions from height alone.
 */

export default defineEventHandler(async (event) => {
  await registerFonts()

  const query = getQuery(event)
  const { text, weightKey, fontSize, lineHeight, minWidth } = parseTextQuery(query)

  if (!text) {
    throw createError({ statusCode: 400, statusMessage: 'Missing "text" query parameter' })
  }

  const family = FONT_FAMILIES[weightKey]
  const lines = normalizeLines(text)
  const box = measureTextBox(lines, family, fontSize, lineHeight)
  const width = Math.max(box.width, minWidth)
  const { height } = box

  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=31536000, immutable',
  })

  return { width, height }
})
