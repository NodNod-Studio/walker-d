import { document, fragment, layout } from '#signature-template'

/**
 * Fills the build-time compiled MJML signature (server/templates/signature.mjml)
 * for one name/role: image URLs, links and alt text. Sizes are baked into the
 * template at build time (`layout`).
 *
 * All images are 1x (natural size = display size): Outlook writes image sizes
 * in inches, which Gmail drops when forwarding, and a 2x image would then show
 * at double size. See docs/outlook-signature.md.
 */

const TEXT_LINE_HEIGHT = 1.2
const LINK_FONT_SIZE = 13

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Font size that renders `baseFontSize` text at the same visual size as the
 * header image (text drawn at `baseFontSize` and shrunk to `displayHeight`), but
 * as an image whose natural 1x height is exactly `displayHeight`.
 */
function oneXFontSize(baseFontSize: number, displayHeight: number) {
  return baseFontSize * displayHeight / Math.ceil(baseFontSize * TEXT_LINE_HEIGHT)
}

function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!(key in values))
      throw new Error(`signature template: no value for {{${key}}}`)
    return escapeHtml(values[key]!)
  })
}

export function renderSignatureHtml(fullname: string, role: string, origin: string) {
  const linkFontSize = oneXFontSize(LINK_FONT_SIZE, layout.linkHeight)

  // Rendered exactly as wide as its column (transparent padding on the right),
  // matching the width the template gives the <img>.
  const linkSrc = (text: string, columnWidth: number) => {
    const params = new URLSearchParams({
      text,
      weight: 'regular',
      fontSize: String(linkFontSize),
      lineHeight: String(TEXT_LINE_HEIGHT),
      scale: '1',
      minWidth: String(columnWidth),
    })
    return `${origin}/api/text-image?${params}`
  }

  const { LA, NY } = COMPANY.offices
  const laPhoneText = `O: ${officePhoneDisplay(LA.phone)}`
  const nyPhoneText = `O: ${officePhoneDisplay(NY.phone)}`
  const headerQuery = new URLSearchParams({ fullname, role, part: 'header', scale: '1' })

  const values = {
    headerSrc: `${origin}/api/signature-image?${headerQuery}`,
    headerAlt: [COMPANY.wordmark, fullname, role].filter(Boolean).join(' – '),
    laPhoneSrc: linkSrc(laPhoneText, layout.la),
    laPhoneHref: officePhoneHref(LA.phone),
    laPhoneText,
    nyPhoneSrc: linkSrc(nyPhoneText, layout.ny),
    nyPhoneHref: officePhoneHref(NY.phone),
    nyPhoneText,
    domainSrc: linkSrc(COMPANY.domain, layout.la),
    domainHref: `https://${COMPANY.domain}`,
    domainText: COMPANY.domain,
    handleSrc: linkSrc(COMPANY.handle, layout.ny),
    handleHref: COMPANY.instagramUrl,
    handleText: COMPANY.handle,
  }

  return {
    /** Full HTML document, for Copy HTML / Download HTML. */
    document: fill(document, values),
    /** The signature itself, for pasting into a mail client. */
    fragment: fill(fragment, values),
    /** Plain-text clipboard fallback. */
    text: [COMPANY.wordmark, [fullname, role].filter(Boolean).join(' – ')].filter(Boolean).join('\n'),
  }
}
