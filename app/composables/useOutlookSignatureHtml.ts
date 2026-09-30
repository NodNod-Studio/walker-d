/**
 * Classic Outlook for Windows composes with Word, which rewrites any pasted
 * HTML into its own model: every cell becomes a `p.MsoNormal`, images become
 * inline characters of that paragraph, and CSS it doesn't know (display:block,
 * font-size:0, rgba colors…) is dropped. See docs/outlook-signature.md.
 *
 * The signature is a ONE-ROW table with two fixed-width cells, LA and NY. Each
 * cell holds a single paragraph with two lines split by a <br>:
 * 1. its half of one drawing (wordmark, name/role, addresses, phone) cut where
 *    "DRAWAS" starts (`part=left|right`), linked to the office phone. Mail
 *    clients add several px after every line break (the Gmail app ~8px), so
 *    addresses and phones must share one image;
 * 2. the site (LA) / Instagram (NY) link.
 * Why the table: Gmail drops image sizes when forwarding (natural file size +
 * `max-width:100%`) but keeps cell widths, so the cells hold 2x images at their
 * display size. Why ONE row: Word never writes a real top margin on paragraphs
 * (only `mso-margin-top-alt`), and the Gmail app gives each paragraph a default
 * ~1em margin: with a single row it only lands above the signature, never
 * between its lines.
 *
 * Other rules, all verified on emails sent by Outlook:
 * - `font-size:1pt` + `line-height:1pt` ("at least" in Word, see paragraph());
 * - every size in pt as styles, plus px `width`/`height` attributes (image());
 * - images rendered at 2x (IMAGE_SCALE) for sharp text on retina screens,
 *   held at their display size by px width/height attributes (see image()).
 *   A signature forwarded from Gmail still shows at double size.
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

/**
 * Display size twice: as px `width`/`height` attributes, which Word keeps as the
 * image size (with pt styles alone it fell back to the file's natural size, so
 * 2x images showed at double size), and as pt styles for everything else.
 */
function image({ src, width, height, alt, href }: OutlookImage) {
  const size = `${width ? `width="${Math.round(width)}" ` : ''}height="${Math.round(height)}"`
  const style = `${width ? `width:${pt(width)};` : ''}height:${pt(height)};border:0;`
  const img = `<img border="0" ${size} src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="${style}">`
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
 * Fixed-width cell: the px `width` attribute is what Gmail keeps when
 * forwarding, and what caps the 2x images (`max-width:100%`) at display size.
 */
function cell(content: string, width: number | undefined) {
  const size = width ? `width="${Math.round(width)}" ` : ''
  const style = `${width ? `width:${pt(width)};` : ''}padding:0;border:none;`
  return `<td ${size}valign="top" style="${style}">${paragraph(content)}</td>`
}

/**
 * Pixel density of the signature images. 2 = sharp on retina screens; the
 * display size comes from the px attributes (image()) and, when Gmail drops
 * them on forward, from the cell widths (cell()). 1 = safe everywhere but
 * grainy on retina. See docs/outlook-signature.md.
 */
const IMAGE_SCALE = 2

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

  // `?dev-mode` on the generator page: experimental layout values for the
  // column images (see server/utils/signatureImage.ts), without touching what
  // production users copy.
  const route = useRoute()
  const devMode = computed(() => 'dev-mode' in route.query)

  const columnQuery = (part: 'left' | 'right') => new URLSearchParams({
    fullname: toValue(fullname),
    role: toValue(role),
    part,
    ...(devMode.value ? { devMode: '1' } : {}),
  }).toString()

  // Sizes of the two halves of the top block (the gap under the phones is
  // part of them, see server/utils/signatureImage.ts).
  const { data: columns } = useAsyncData(
    () => `signature-columns:${devMode.value ? 'dev:' : ''}${toValue(fullname)}:${toValue(role)}`,
    async () => {
      const meta = (part: 'left' | 'right') => $fetch<{ width: number, height: number, nyX: number }>(`${origin}/api/signature-image-meta?${columnQuery(part)}`)
      const [left, right] = await Promise.all([meta('left'), meta('right')])
      return { left, right }
    },
    { watch: [() => toValue(fullname), () => toValue(role), devMode] },
  )

  const linkOpts = { fontSize: oneXFontSize(LINK_FONT_SIZE, LINK_HEIGHT) }

  return computed(() => {
    const { LA, NY } = COMPANY.offices
    const [fullnameValue, roleValue] = [toValue(fullname), toValue(role)]

    const column = (part: 'left' | 'right', office: typeof LA | typeof NY, alt: string) => image({
      src: `${origin}/api/signature-image?${columnQuery(part)}&scale=${IMAGE_SCALE}`,
      width: columns.value?.[part].width,
      height: columns.value?.[part].height ?? 0,
      alt,
      href: officePhoneHref(office.phone),
    })

    // As wide as its cell (transparent padding on the right, `minWidth`), like the
    // column images: when Gmail forwards, `max-width:100%` only shrinks images
    // wider than the cell, so a narrower 2x image would stay at double size.
    const link = (text: string, columnWidth: number | undefined, href: string) => image({
      src: textImageUrl(text, { ...linkOpts, scale: IMAGE_SCALE, minWidth: columnWidth }),
      width: columnWidth,
      height: LINK_HEIGHT,
      alt: text,
      href,
    })

    const la = column('left', LA, [COMPANY.wordmark, fullnameValue, `O: ${officePhoneDisplay(LA.phone)}`].filter(Boolean).join(' – '))
      + '<br>'
      + link(COMPANY.domain, columns.value?.left.width, `https://${COMPANY.domain}`)
    const ny = column('right', NY, [roleValue, `O: ${officePhoneDisplay(NY.phone)}`].filter(Boolean).join(' – '))
      + '<br>'
      + link(COMPANY.handle, columns.value?.right.width, COMPANY.instagramUrl)

    return '<table class="MsoNormalTable" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;mso-padding-alt:0pt 0pt 0pt 0pt;">'
      + `<tbody><tr>${cell(la, columns.value?.left.width)}${cell(ny, columns.value?.right.width)}</tr></tbody></table>`
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

/**
 * The "Image (legacy)" signature (one PNG of the whole signature) in the same
 * Outlook-safe markup as useOutlookSignatureHtml(): a one-cell table exactly as
 * wide as the image, holding it at 2x with px size attributes. When Gmail
 * forwards the email it drops the image size, but keeps the cell width and adds
 * `max-width:100%`, so the image stays at its display size.
 * No hidden fallback text (unlike the legacy tab's regular copy).
 *
 * The file is kept under MAX_IMAGE_FILE_WIDTH pixels: at a full 2x (620px) Spark
 * blew the forwarded signature up to the message width, as clients treat images
 * over ~600px as full-width content. The split signature's images (≤338px) are
 * fine.
 */
const MAX_IMAGE_FILE_WIDTH = 600

export function useOutlookImageSignatureHtml(fullname: MaybeRefOrGetter<string>, role: MaybeRefOrGetter<string>) {
  const origin = useRequestURL().origin

  const query = computed(() => new URLSearchParams({ fullname: toValue(fullname), role: toValue(role) }).toString())

  const { data: size } = useAsyncData(
    () => `signature-image-meta:${query.value}`,
    () => $fetch<{ width: number, height: number }>(`${origin}/api/signature-image-meta?${query.value}`),
    { watch: [query] },
  )

  return computed(() => {
    // Density just under the file width cap (rounded down), 2x when it fits.
    const scale = size.value
      ? Math.min(IMAGE_SCALE, Math.floor(MAX_IMAGE_FILE_WIDTH / size.value.width * 100) / 100)
      : IMAGE_SCALE
    const content = image({
      src: `${origin}/api/signature-image?${query.value}&scale=${scale}`,
      width: size.value?.width,
      height: size.value?.height ?? 0,
      alt: [COMPANY.wordmark, toValue(fullname), toValue(role)].filter(Boolean).join(' – '),
      href: `https://${COMPANY.domain}`,
    })

    return '<table class="MsoNormalTable" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;mso-padding-alt:0pt 0pt 0pt 0pt;">'
      + `<tbody><tr>${cell(content, size.value?.width)}</tr></tbody></table>`
  })
}
