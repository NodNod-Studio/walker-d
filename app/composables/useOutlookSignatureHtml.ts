/**
 * Classic Outlook for Windows composes with Word, which rewrites any pasted
 * HTML into its own model: every cell becomes a `p.MsoNormal`, images become
 * inline characters of that paragraph, and CSS it doesn't know (display:block,
 * font-size:0, rgba colors…) is dropped. See docs/outlook-signature.md.
 *
 * The whole signature is ONE paragraph, its rows separated by <br>:
 * 1. one image for everything without links (wordmark, name/role, addresses);
 * 2. LA + NY phone links;
 * 4. site + Instagram links.
 * A single paragraph because Word never writes a real top margin on paragraphs
 * (only `mso-margin-top-alt`, ignored by browsers), and clients that drop
 * Outlook's <head> styles (the Gmail app) then give every paragraph a default
 * ~1em margin: one paragraph per row, or a table (a paragraph per cell), puts
 * that margin between rows. Line breaks inside one paragraph have none.
 * The left image of rows 2 and 4 is padded with transparent space up to the NY
 * column's x (`minWidth`), so the right image lines up under "DRAWAS".
 *
 * Other rules, all verified on emails sent by Outlook:
 * - `font-size:1pt` + `line-height:1pt` ("at least" in Word, see paragraph());
 * - every size in pt, as styles only (no px `width`/`height` attributes);
 * - images rendered at 1x, i.e. natural size = display size. Outlook writes
 *   image sizes in inches, which Gmail drops when forwarding: a 2x image would
 *   then show at double size, a 1x one stays right.
 */

const PX_TO_PT = 0.75

function pt(px: number) {
  return `${+(px * PX_TO_PT).toFixed(2)}pt`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface OutlookImage {
  src: string
  width: number | undefined
  height: number
  alt: string
  href?: string
}

function image({ src, width, height, alt, href }: OutlookImage) {
  const style = `${width ? `width:${pt(width)};` : ''}height:${pt(height)};border:0;`
  const img = `<img border="0" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="${style}">`
  return href
    ? `<a href="${escapeHtml(href)}" style="text-decoration:none;">${img}</a>`
    : img
}

// .05pt (1 twip, Word's smallest step) rather than 0, so Word writes the bottom
// margin inline instead of relying on the <head> style some clients drop. The
// top one still comes out as `mso-margin-top-alt` (ignored by browsers), which
// is why the signature is a single paragraph.
const PARAGRAPH_MARGIN = 'margin-top:.05pt;margin-right:0;margin-bottom:.05pt;margin-left:0;'

/**
 * `line-height:1pt` with no `mso-line-height-rule`, which Word reads as "at
 * least 1pt": each line still grows to fit its images, so nothing is cropped.
 * Browsers size lines from the paragraph's own font (Outlook's 11pt
 * `p.MsoNormal`, scaled up further by the Gmail app; Word moves our font-size
 * onto an inner span) and centre it in the line height: with a 1pt line there's
 * no room left for descender space, so each line is exactly as tall as its images.
 * Word keeps this on a top-level paragraph (inside table cells it turns it into
 * `mso-line-height-alt`, ignored by browsers). An *exact* line height as tall as
 * the image is worse for big images: browsers put half the leftover height under
 * the baseline (~28px under a 64px image).
 */
function paragraph(content: string) {
  return `<p class="MsoNormal" style="${PARAGRAPH_MARGIN}font-size:1.0pt;line-height:1.0pt;font-family:Arial,sans-serif;">${content}</p>`
}

const TEXT_LINE_HEIGHT = 1.2
const LINK_HEIGHT = 11
const LINK_FONT_SIZE = 13
// Space between the phones and site/Instagram rows (TheSignature uses 10px).
// Small because mail clients add a few px after each line on their own (the
// Gmail app ~4-5px): 4px read as too much there.
const PHONE_ROW_GAP = 2

/**
 * Font size that renders `baseFontSize` text at the same visual size as the
 * preview (a 2x/3x image of `baseFontSize` shrunk to `displayHeight`), but
 * as an image whose natural 1x height is exactly `displayHeight`.
 */
function oneXFontSize(baseFontSize: number, displayHeight: number) {
  return baseFontSize * displayHeight / Math.ceil(baseFontSize * TEXT_LINE_HEIGHT)
}

export function useOutlookSignatureHtml(fullname: MaybeRefOrGetter<string>, role: MaybeRefOrGetter<string>) {
  const origin = useRequestURL().origin
  const { textImageUrl } = useTextImageUrl()

  const headerQuery = computed(() => new URLSearchParams({
    fullname: toValue(fullname),
    role: toValue(role),
    part: 'header',
  }).toString())

  const { data: header } = useAsyncData(
    () => `signature-image-meta:${headerQuery.value}`,
    () => $fetch<{ width: number, height: number, nyX: number }>(`${origin}/api/signature-image-meta?${headerQuery.value}`),
    { watch: [headerQuery] },
  )

  const linkOpts = { fontSize: oneXFontSize(LINK_FONT_SIZE, LINK_HEIGHT) }
  const linkWidth = (text: string) => useTextImageWidth(text, { ...linkOpts, displayHeight: LINK_HEIGHT })

  const laPhoneText = `O: ${officePhoneDisplay(COMPANY.offices.LA.phone)}`
  const nyPhoneText = `O: ${officePhoneDisplay(COMPANY.offices.NY.phone)}`

  const widths = {
    laPhone: linkWidth(laPhoneText),
    nyPhone: linkWidth(nyPhoneText),
    domain: linkWidth(COMPANY.domain),
    handle: linkWidth(COMPANY.handle),
  }

  // The gap under the phones is transparent space at the bottom of the phone
  // images (a taller line height; the text is drawn at the top), not a separate
  // spacer row: the Gmail app blew a row holding just a 4px image up to ~30px.
  const phoneOpts = {
    ...linkOpts,
    // Just under the target, so the rendered height (rounded up) is exactly it.
    lineHeight: (LINK_HEIGHT + PHONE_ROW_GAP - 0.01) / linkOpts.fontSize,
  }

  return computed(() => {
    const nyX = header.value?.nyX

    // Left image of a row: padded to the NY column so the next one lines up.
    const left = (text: string, width: number | undefined, href: string, opts = linkOpts, height = LINK_HEIGHT) => image({
      src: textImageUrl(text, { ...opts, scale: 1, minWidth: nyX }),
      width: nyX ? Math.max(width ?? 0, nyX) : width,
      height,
      alt: text,
      href,
    })
    const right = (text: string, width: number | undefined, href: string, opts = linkOpts, height = LINK_HEIGHT) => image({
      src: textImageUrl(text, { ...opts, scale: 1 }),
      width,
      height,
      alt: text,
      href,
    })

    const alt = [COMPANY.wordmark, toValue(fullname), toValue(role)].filter(Boolean).join(' – ')

    // No whitespace between the images of a row: it would render as a gap.
    return paragraph([
      image({
        src: `${origin}/api/signature-image?${headerQuery.value}&scale=1`,
        width: header.value?.width,
        height: header.value?.height ?? 0,
        alt,
      }),
      left(laPhoneText, widths.laPhone.value, officePhoneHref(COMPANY.offices.LA.phone), phoneOpts, LINK_HEIGHT + PHONE_ROW_GAP)
      + right(nyPhoneText, widths.nyPhone.value, officePhoneHref(COMPANY.offices.NY.phone), phoneOpts, LINK_HEIGHT + PHONE_ROW_GAP),
      left(COMPANY.domain, widths.domain.value, `https://${COMPANY.domain}`)
      + right(COMPANY.handle, widths.handle.value, COMPANY.instagramUrl),
    ].join('<br>'))
  })
}

/**
 * Puts `html` on the clipboard verbatim. Copying a DOM selection (or the
 * async Clipboard API, which sanitizes) would let the browser rewrite it
 * with computed styles before Word ever sees it.
 */
export function copyRawHtml(html: string, plainText: string) {
  const onCopy = (event: ClipboardEvent) => {
    event.preventDefault()
    event.clipboardData?.setData('text/html', html)
    event.clipboardData?.setData('text/plain', plainText)
  }
  document.addEventListener('copy', onCopy, { once: true })
  try {
    return document.execCommand('copy')
  }
  finally {
    document.removeEventListener('copy', onCopy)
  }
}
