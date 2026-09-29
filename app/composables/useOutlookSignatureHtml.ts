/**
 * Classic Outlook for Windows composes with Word, which rewrites any pasted
 * HTML into its own model: every cell becomes a `p.MsoNormal`, images become
 * inline characters of that paragraph, and CSS it doesn't know (display:block,
 * font-size:0, rgba colors…) is dropped. Each of those paragraphs also adds a
 * few px below its images (Outlook's default 11pt paragraph font), so this
 * version keeps the number of paragraphs as low as possible:
 * 1. one image for everything without links (wordmark, name/role, addresses);
 * 2. a 2×2 table for the linked texts (phones, then site + Instagram). A table
 *    rather than inline images side by side, since browsers may wrap between
 *    two inline images; its first column ends where "DRAWAS" starts.
 *
 * The markup is what Word itself would save, so there is nothing to rewrite:
 * - explicit `margin:0` on each paragraph (Word's Normal style adds space after);
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

/**
 * `line-height:1pt` with no `mso-line-height-rule`, which Word reads as "at
 * least 1pt": the line still grows to fit the image, so nothing is cropped.
 * Browsers instead size the line from the paragraph's own font (Outlook's 11pt
 * `p.MsoNormal`; Word moves our font-size onto an inner span) and centre that
 * font in the line height: with a 1pt line there's no room left for descender
 * space under the image, so each row is exactly as tall as its image.
 * An *exact* line height the size of the image did the opposite: browsers put
 * half of the leftover height under the baseline, i.e. under the image
 * (~28px under the 64px header).
 */
function paragraph(content: string) {
  return `<p class="MsoNormal" style="margin:0;font-size:1.0pt;line-height:1.0pt;font-family:Arial,sans-serif;">${content}</p>`
}

function cell(content: string, width: number | undefined, paddingBottom = 0) {
  const style = `${width ? `width:${pt(width)};` : ''}padding:0 0 ${pt(paddingBottom)} 0;border:none;`
  return `<td valign="top" style="${style}">${paragraph(content)}</td>`
}

const TEXT_LINE_HEIGHT = 1.2
const LINK_HEIGHT = 11
const LINK_FONT_SIZE = 13
// Smaller than TheSignature's 10px: each Outlook paragraph already adds a few
// px under its image, and 10px on top of that read as too much.
const PHONE_ROW_GAP = 4

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

  return computed(() => {
    const nyX = header.value?.nyX
    const nyColWidth = (widths.nyPhone.value && widths.handle.value)
      ? Math.max(widths.nyPhone.value, widths.handle.value)
      : undefined

    const link = (text: string, width: number | undefined, href: string) => image({
      src: textImageUrl(text, { ...linkOpts, scale: 1 }),
      width,
      height: LINK_HEIGHT,
      alt: text,
      href,
    })

    const alt = [COMPANY.wordmark, toValue(fullname), toValue(role)].filter(Boolean).join(' – ')

    const links = `<table class="MsoNormalTable" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;mso-padding-alt:0pt 0pt 0pt 0pt;"><tbody>`
      + `<tr>${cell(link(laPhoneText, widths.laPhone.value, officePhoneHref(COMPANY.offices.LA.phone)), nyX, PHONE_ROW_GAP)}`
      + `${cell(link(nyPhoneText, widths.nyPhone.value, officePhoneHref(COMPANY.offices.NY.phone)), nyColWidth, PHONE_ROW_GAP)}</tr>`
      + `<tr>${cell(link(COMPANY.domain, widths.domain.value, `https://${COMPANY.domain}`), nyX)}`
      + `${cell(link(COMPANY.handle, widths.handle.value, COMPANY.instagramUrl), nyColWidth)}</tr>`
      + `</tbody></table>`

    const headerHeight = header.value?.height ?? 0
    return paragraph(image({
      src: `${origin}/api/signature-image?${headerQuery.value}&scale=1`,
      width: header.value?.width,
      height: headerHeight,
      alt,
    })) + links
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
