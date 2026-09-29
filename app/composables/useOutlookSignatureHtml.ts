/**
 * Classic Outlook for Windows composes with Word, which rewrites any pasted
 * HTML into its own model: every cell becomes a `p.MsoNormal`, images become
 * inline characters of that paragraph, and CSS it doesn't know (display:block,
 * font-size:0, rgba colors…) is dropped. Instead of fighting that conversion,
 * this builds the signature directly in the markup Word itself would save,
 * so there is nothing left for it to rewrite:
 * - explicit `margin:0` on each paragraph (Word's Normal style adds space after);
 * - `font-size:1pt` + exact line spacing 1px taller than the image: Word keeps
 *   it on the sent `p`, so browsers don't size each row from Outlook's default
 *   11pt paragraph font (extra gaps), while Word doesn't crop the image
 *   (it only does when the exact line is shorter than the image);
 * - sizes in pt on cells/images, alongside the px `width`/`height` attributes;
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
  const size = width ? `width="${width}" ` : ''
  const style = `${width ? `width:${pt(width)};` : ''}height:${pt(height)};border:0;`
  const img = `<img border="0" ${size}height="${height}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="${style}">`
  return href
    ? `<a href="${escapeHtml(href)}" style="text-decoration:none;">${img}</a>`
    : img
}

function paragraph(content: string, imageHeight: number) {
  return `<p class="MsoNormal" style="margin:0;font-size:1.0pt;line-height:${pt(imageHeight + 1)};mso-line-height-rule:exactly;font-family:Arial,sans-serif;">${content}</p>`
}

function cell(content: string, opts: { width: number, height: number, colspan?: number, paddingBottom?: number }) {
  const colspan = opts.colspan ? ` colspan="${opts.colspan}"` : ''
  const padding = opts.paddingBottom ? `0 0 ${pt(opts.paddingBottom)} 0` : '0'
  return `<td width="${opts.width}"${colspan} valign="top" style="width:${pt(opts.width)};padding:${padding};border:none;">${paragraph(content, opts.height)}</td>`
}

const TEXT_LINE_HEIGHT = 1.2

/**
 * Font size that renders `baseFontSize` text at the same visual size as the
 * preview (a 2x/3x image of `baseFontSize` shrunk to `displayHeight`), but
 * as an image whose natural 1x height is exactly `displayHeight`.
 */
function oneXFontSize(baseFontSize: number, displayHeight: number) {
  return baseFontSize * displayHeight / Math.ceil(baseFontSize * TEXT_LINE_HEIGHT)
}

export function useOutlookSignatureHtml(fullname: MaybeRefOrGetter<string>, role: MaybeRefOrGetter<string>) {
  const laPhoneText = `O: ${officePhoneDisplay(COMPANY.offices.LA.phone)}`
  const nyPhoneText = `O: ${officePhoneDisplay(COMPANY.offices.NY.phone)}`

  const regular = { fontSize: 13 }
  const bold = { weight: 'bold', fontSize: 13 } as const
  const wordmarkOpts = { weight: 'bold', fontSize: 28 } as const

  function textImage(text: MaybeRefOrGetter<string>, opts: { weight?: 'regular' | 'bold', fontSize: number }, displayHeight: number) {
    const oneX = { ...opts, fontSize: oneXFontSize(opts.fontSize, displayHeight) }
    return {
      src: useTextImageSrc(text, { ...oneX, scale: 1 }),
      width: useTextImageWidth(text, { ...oneX, displayHeight }),
    }
  }

  const wordmark = textImage(COMPANY.wordmark, wordmarkOpts, 39)
  const wordmarkPrefix = textImage(COMPANY.wordmark.replace(/DRAWAS$/, ''), wordmarkOpts, 39)
  const name = textImage(fullname, bold, 11)
  const roleImg = textImage(role, bold, 11)
  const laLine1 = textImage(COMPANY.offices.LA.addressLine1, regular, 11)
  const laLine2 = textImage(COMPANY.offices.LA.addressLine2, regular, 11)
  const laPhone = textImage(laPhoneText, regular, 11)
  const nyLine1 = textImage(COMPANY.offices.NY.addressLine1, regular, 11)
  const nyLine2 = textImage(COMPANY.offices.NY.addressLine2, regular, 11)
  const nyPhone = textImage(nyPhoneText, regular, 11)
  const domain = textImage(COMPANY.domain, regular, 11)
  const handle = textImage(COMPANY.handle, regular, 11)

  const spacerSrc = useSpacerImageSrc()

  return computed(() => {
    const laWidth = (wordmarkPrefix.width.value ?? 168) + 10
    const nyWidth = (wordmark.width.value && wordmarkPrefix.width.value)
      ? Math.max(wordmark.width.value - wordmarkPrefix.width.value, 1)
      : 139

    const text = (img: { src: ComputedRef<string>, width: ComputedRef<number | undefined> }, alt: string, href?: string) =>
      image({ src: img.src.value, width: img.width.value, height: 11, alt, href })
    const spacer = image({ src: spacerSrc, width: 1, height: 11, alt: '' })

    const nameValue = toValue(fullname)
    const roleValue = toValue(role)

    const rows = [
      cell(image({ src: wordmark.src.value, width: wordmark.width.value, height: 39, alt: 'Walker • Drawas' }), { width: laWidth + nyWidth, height: 39, colspan: 2 }),
    ]
    if (nameValue || roleValue) {
      rows.push(
        cell(nameValue ? text(name, nameValue) : spacer, { width: laWidth, height: 11, paddingBottom: 10 })
        + cell(roleValue ? text(roleImg, roleValue) : spacer, { width: nyWidth, height: 11, paddingBottom: 10 }),
      )
    }
    rows.push(
      cell(text(laLine1, COMPANY.offices.LA.addressLine1), { width: laWidth, height: 11, paddingBottom: 1 })
      + cell(text(nyLine1, COMPANY.offices.NY.addressLine1), { width: nyWidth, height: 11, paddingBottom: 1 }),
      cell(text(laLine2, COMPANY.offices.LA.addressLine2), { width: laWidth, height: 11, paddingBottom: 1 })
      + cell(text(nyLine2, COMPANY.offices.NY.addressLine2), { width: nyWidth, height: 11, paddingBottom: 1 }),
      cell(text(laPhone, laPhoneText, officePhoneHref(COMPANY.offices.LA.phone)), { width: laWidth, height: 11, paddingBottom: 10 })
      + cell(text(nyPhone, nyPhoneText, officePhoneHref(COMPANY.offices.NY.phone)), { width: nyWidth, height: 11, paddingBottom: 10 }),
      cell(text(domain, COMPANY.domain, `https://${COMPANY.domain}`), { width: laWidth, height: 11 })
      + cell(text(handle, COMPANY.handle, COMPANY.instagramUrl), { width: nyWidth, height: 11 }),
    )

    return `<table class="MsoNormalTable" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;mso-padding-alt:0pt 0pt 0pt 0pt;">`
      + `<tbody>${rows.map(row => `<tr>${row}</tr>`).join('')}</tbody></table>`
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
