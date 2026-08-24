/**
 * Returns the natural (unscaled) pixel box a /api/text-image render would
 * produce for the same params, so callers can set explicit width/height on
 * the <img> instead of leaving Outlook to guess proportions from height alone.
 */

export default defineEventHandler(async (event) => {
  await registerFonts()

  const query = getQuery(event)
  const { text, weightKey, fontSize, lineHeight } = parseTextQuery(query)

  if (!text) {
    throw createError({ statusCode: 400, statusMessage: 'Missing "text" query parameter' })
  }

  const family = FONT_FAMILIES[weightKey]
  const lines = normalizeLines(text)
  const { width, height } = measureTextBox(lines, family, fontSize, lineHeight)

  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=31536000, immutable',
  })

  return { width, height }
})
