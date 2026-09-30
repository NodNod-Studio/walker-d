import type { SKRSContext2D } from '@napi-rs/canvas'
import { createCanvas } from '@napi-rs/canvas'

/**
 * The whole signature flattened into a single PNG, for clients where the
 * sliced HTML table can't be installed. Layout mirrors TheSignature.vue:
 * each text is measured exactly like /api/text-image and drawn stretched to
 * the same display box the <img> tags use, so both versions line up.
 */

export const SIGNATURE_IMAGE_VERSION = 7

/**
 * - 'full': the whole signature (legacy single image).
 * - 'header': wordmark, name/role and addresses only.
 * - 'left' / 'right': wordmark, name/role, addresses and phones, cut in two
 *   where "DRAWAS" starts (the NY column). For the Outlook version: the halves
 *   sit side by side, each linked to its office phone, so addresses and phones
 *   share one line of the email. Mail clients (the Gmail app especially) add
 *   several px after every line break, which images can't compensate.
 */
export type SignaturePart = 'full' | 'header' | 'left' | 'right'

// Phone row in the 'left'/'right' parts: 11px text + a gap before the
// site/Instagram row. Gmail desktop and Outlook show exactly this gap, the
// Gmail app adds ~8px of its own after the line break.
// - production: 2px (tight on desktop/Outlook, right on the app);
// - dev mode (`?dev-mode` on the generator page): 6px, being evaluated as a
//   compromise, since 2px looks "collapsed" on desktop and in Outlook.
const COLUMNS_PHONE_ROW_HEIGHT = 13
const DEV_COLUMNS_PHONE_ROW_HEIGHT = 17

export interface SignatureLayoutOptions {
  /** Experimental layout values, from the generator's `?dev-mode`. */
  devMode?: boolean
}

export interface SignatureTextItem {
  text: string
  weightKey: WeightKey
  fontSize: number
  displayHeight: number
  width: number
  sx: number
  sy: number
}

function textItem(text: string, weightKey: WeightKey, fontSize: number, displayHeight: number): SignatureTextItem {
  const box = measureTextBox([text], FONT_FAMILIES[weightKey], fontSize, 1.2)
  const width = Math.round((box.width / box.height) * displayHeight)
  return { text, weightKey, fontSize, displayHeight, width, sx: width / box.width, sy: displayHeight / box.height }
}

function drawItem(ctx: SKRSContext2D, item: SignatureTextItem, x: number, y: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(item.sx, item.sy)
  ctx.font = `${item.fontSize}px "${FONT_FAMILIES[item.weightKey]}"`
  ctx.fillText(item.text, 0, 0)
  ctx.restore()
}

/** Shared by /api/signature-image and /api/signature-image-meta so the PNG and its advertised size always agree. */
export function layoutSignature(fullname: string, role: string, part: SignaturePart = 'full', { devMode = false }: SignatureLayoutOptions = {}) {
  const { LA, NY } = COMPANY.offices
  const small = (text: string, weightKey: WeightKey = 'regular') => textItem(text, weightKey, 13, 11)

  const wordmark = textItem(COMPANY.wordmark, 'bold', 28, 39)
  // Trimmed because TheSignature measures it via /api/text-image-meta, which trims its text.
  const wordmarkPrefix = textItem(COMPANY.wordmark.replace(/DRAWAS$/, '').trim(), 'bold', 28, 39)
  // Same as TheSignature's laColWidth, so both versions put the NY column at the same x.
  const nyX = wordmarkPrefix.width + 10

  const rows: { la?: SignatureTextItem, ny?: SignatureTextItem, height: number }[] = []
  if (fullname || role)
    rows.push({ la: fullname ? small(fullname, 'bold') : undefined, ny: role ? small(role, 'bold') : undefined, height: 21 })
  rows.push({ la: small(LA.addressLine1), ny: small(NY.addressLine1), height: 12 })
  // In the Outlook 'header' part this is the last row: no 1px gap under it, as
  // mail clients (the Gmail app especially) already add space after each line.
  rows.push({ la: small(LA.addressLine2), ny: small(NY.addressLine2), height: part === 'header' ? 11 : 12 })
  if (part !== 'header') {
    const phoneRowHeight = part === 'full' ? 21 : devMode ? DEV_COLUMNS_PHONE_ROW_HEIGHT : COLUMNS_PHONE_ROW_HEIGHT
    rows.push({ la: small(`O: ${officePhoneDisplay(LA.phone)}`), ny: small(`O: ${officePhoneDisplay(NY.phone)}`), height: phoneRowHeight })
  }
  if (part === 'full')
    rows.push({ la: small(COMPANY.domain), ny: small(COMPANY.handle), height: 11 })

  // Wordmark row is 39px image + the 1px hidden-text line under it.
  const wordmarkRowHeight = 40
  const width = Math.max(
    wordmark.width,
    ...rows.map(row => Math.max(row.la?.width ?? 0, row.ny ? nyX + row.ny.width : 0)),
  )
  const height = wordmarkRowHeight + rows.reduce((sum, row) => sum + row.height, 0)

  // Horizontal slice of the drawing this part covers.
  const cropX = part === 'right' ? nyX : 0
  const cropWidth = part === 'left' ? nyX : part === 'right' ? width - nyX : width

  return { wordmark, wordmarkRowHeight, nyX, rows, width: cropWidth, height, fullWidth: width, cropX }
}

export function renderSignatureImage(fullname: string, role: string, scale: number, part: SignaturePart = 'full', options: SignatureLayoutOptions = {}) {
  const { wordmark, wordmarkRowHeight, nyX, rows, width, height, fullWidth, cropX } = layoutSignature(fullname, role, part, options)

  const canvas = createCanvas(Math.ceil(fullWidth * scale), Math.ceil(height * scale))
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.fillStyle = COLOR
  ctx.textBaseline = 'top'

  drawItem(ctx, wordmark, 0, 0)
  let y = wordmarkRowHeight
  for (const row of rows) {
    if (row.la)
      drawItem(ctx, row.la, 0, y)
    if (row.ny)
      drawItem(ctx, row.ny, nyX, y)
    y += row.height
  }

  if (width === fullWidth)
    return canvas.toBuffer('image/png')

  // 'left' / 'right': cut from the same drawing, so the halves join exactly.
  const slice = createCanvas(Math.ceil(width * scale), Math.ceil(height * scale))
  slice.getContext('2d').drawImage(canvas, -Math.round(cropX * scale), 0)
  return slice.toBuffer('image/png')
}

/** `devMode=1` on the image APIs (set by the generator when opened with `?dev-mode`). */
export function signatureQueryDevMode(value: unknown) {
  return value === '1' || value === 'true'
}

export function signatureQueryPart(value: unknown): SignaturePart {
  return value === 'header' || value === 'left' || value === 'right' ? value : 'full'
}

export function signatureQueryText(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value
  return String(raw ?? '').trim().slice(0, MAX_LINE_LENGTH)
}
