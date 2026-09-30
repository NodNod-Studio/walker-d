/**
 * The email signature for one name/role, from the MJML template compiled at
 * build time. The preview, Copy Signature, Copy HTML and Download HTML all use
 * this same output.
 */

export default defineEventHandler(async (event) => {
  await registerFonts()

  const query = getQuery(event)
  const fullname = signatureQueryText(query.fullname)
  const role = signatureQueryText(query.role)

  // Absolute image URLs: the HTML is pasted into mail clients.
  const siteUrl = useRuntimeConfig(event).public.siteUrl
  const origin = (siteUrl || getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin).replace(/\/$/, '')

  return renderSignatureHtml(fullname, role, origin)
})
