/**
 * Classic Outlook for Windows composes with Word, which rewrites any pasted
 * HTML into its own model: every cell becomes a `p.MsoNormal`, images become
 * inline characters of that paragraph, and CSS it doesn't know (display:block,
 * font-size:0, rgba colors…) is dropped. See docs/outlook-signature.md.
 *
 * The whole signature is ONE paragraph, its two rows separated by a <br>:
 * 1. wordmark, name/role, addresses and phones, as ONE drawing cut in two
 *    images where "DRAWAS" starts (`part=left|right`), each linked to its
 *    office phone. Mail clients add several px after every line break (the
 *    Gmail app ~8px, more than any image can compensate), so addresses and
 *    phones must share one line of the email;
 * 2. site + Instagram links.
 * A single paragraph because Word never writes a real top margin on paragraphs
 * (only `mso-margin-top-alt`, ignored by browsers), and clients that drop
 * Outlook's <head> styles (the Gmail app) then give every paragraph a default
 * ~1em margin: one paragraph per row, or a table (a paragraph per cell), puts
 * that margin between rows. Line breaks inside one paragraph have none.
 * The left image of row 2 is padded with transparent space up to the NY
 * column's x (`minWidth`), so the right image lines up under "DRAWAS".
 *
 * Other rules, all verified on emails sent by Outlook:
 * - `font-size:1pt` + `line-height:1pt` ("at least" in Word, see paragraph());
 * - every size in pt, as styles only (no px `width`/`height` attributes);
 * - images rendered at 1x (IMAGE_SCALE), i.e. natural size = display size:
 *   2x images showed at double size (the pt styles alone don't hold them).
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

/**
 * Pixel density of the signature images: must stay 1. With 2 the signature
 * showed at double size, as mail clients fall back to the file's natural size
 * (Gmail when forwarding, and in the 2x test also direct emails).
 * See docs/outlook-signature.md.
 */
const IMAGE_SCALE = 1

const TEXT_LINE_HEIGHT = 1.2
const LINK_HEIGHT = 11
const LINK_FONT_SIZE = 13

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

  const columnQuery = (part: 'left' | 'right') => new URLSearchParams({
    fullname: toValue(fullname),
    role: toValue(role),
    part,
  }).toString()

  // Sizes of the two halves of the top block (the gap under the phones is
  // part of them, see server/utils/signatureImage.ts).
  const { data: columns } = useAsyncData(
    () => `signature-columns:${toValue(fullname)}:${toValue(role)}`,
    async () => {
      const meta = (part: 'left' | 'right') => $fetch<{ width: number, height: number, nyX: number }>(`${origin}/api/signature-image-meta?${columnQuery(part)}`)
      const [left, right] = await Promise.all([meta('left'), meta('right')])
      return { left, right }
    },
    { watch: [() => toValue(fullname), () => toValue(role)] },
  )

  const linkOpts = { fontSize: oneXFontSize(LINK_FONT_SIZE, LINK_HEIGHT) }
  const linkWidth = (text: string) => useTextImageWidth(text, { ...linkOpts, displayHeight: LINK_HEIGHT })

  const widths = {
    domain: linkWidth(COMPANY.domain),
    handle: linkWidth(COMPANY.handle),
  }

  return computed(() => {
    const nyX = columns.value?.left.nyX
    const { LA, NY } = COMPANY.offices
    const [fullnameValue, roleValue] = [toValue(fullname), toValue(role)]

    const column = (part: 'left' | 'right', office: typeof LA | typeof NY, alt: string) => image({
      src: `${origin}/api/signature-image?${columnQuery(part)}&scale=${IMAGE_SCALE}`,
      width: columns.value?.[part].width,
      height: columns.value?.[part].height ?? 0,
      alt,
      href: officePhoneHref(office.phone),
    })

    const link = (text: string, width: number | undefined, href: string, minWidth?: number) => image({
      src: textImageUrl(text, { ...linkOpts, scale: IMAGE_SCALE, minWidth }),
      width: minWidth ? Math.max(width ?? 0, minWidth) : width,
      height: LINK_HEIGHT,
      alt: text,
      href,
    })

    // No whitespace between the images of a row: it would render as a gap.
    return paragraph([
      column('left', LA, [COMPANY.wordmark, fullnameValue, `O: ${officePhoneDisplay(LA.phone)}`].filter(Boolean).join(' – '))
      + column('right', NY, [roleValue, `O: ${officePhoneDisplay(NY.phone)}`].filter(Boolean).join(' – ')),
      // Left image padded to the NY column, so the right one lines up under "DRAWAS".
      link(COMPANY.domain, widths.domain.value, `https://${COMPANY.domain}`, nyX)
      + link(COMPANY.handle, widths.handle.value, COMPANY.instagramUrl),
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
