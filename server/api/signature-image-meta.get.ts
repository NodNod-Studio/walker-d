/**
 * Display size (1x) of the matching /api/signature-image render, so the
 * <img> can carry exact width/height from SSR instead of resizing on load.
 */

export default defineEventHandler(async (event) => {
  await registerFonts()

  const query = getQuery(event)
  const { width, height, nyX } = layoutSignature(
    signatureQueryText(query.fullname),
    signatureQueryText(query.role),
    signatureQueryPart(query.part),
    { devMode: signatureQueryDevMode(query.devMode) },
  )

  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=31536000, immutable',
  })

  return { width, height, nyX }
})
