import { createCanvas, GlobalFonts } from '@napi-rs/canvas'

const FONT_FAMILIES = {
  regular: 'ABCPelikan',
  bold: 'ABCPelikan-Bold',
} as const

const COLOR = '#000000'

const MAX_LINE_LENGTH = 80
const MAX_LINES = 4
const MAX_WIDTH = 900
const MAX_HEIGHT = 400

let fontsReady: Promise<void> | null = null

function registerFonts() {
  if (!fontsReady) {
    fontsReady = (async () => {
      const storage = useStorage('assets:server:fonts')
      const [regular, bold] = await Promise.all([
        storage.getItemRaw('ABCPelikan-Regular.woff2'),
        storage.getItemRaw('ABCPelikan-Bold.woff2'),
      ])
      if (regular)
        GlobalFonts.register(regular as Buffer, FONT_FAMILIES.regular)
      if (bold)
        GlobalFonts.register(bold as Buffer, FONT_FAMILIES.bold)
    })()
  }
  return fontsReady
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const num = Number(value)
  if (!Number.isFinite(num))
    return fallback
  return Math.min(Math.max(num, min), max)
}

export default defineEventHandler(async (event) => {
  await registerFonts()

  const query = getQuery(event)

  const rawText = Array.isArray(query.text) ? query.text[0] : query.text
  const text = String(rawText ?? '').trim()
  if (!text) {
    throw createError({ statusCode: 400, statusMessage: 'Missing "text" query parameter' })
  }

  const weightKey: keyof typeof FONT_FAMILIES = query.weight === 'bold' ? 'bold' : 'regular'
  const family = FONT_FAMILIES[weightKey]

  const fontSize = clampNumber(query.fontSize, 8, 72, 16)
  const lineHeight = clampNumber(query.lineHeight, 0.8, 3, 1.2)
  const scale = clampNumber(query.scale, 1, 4, 3)

  const lines = text
    .split('\n')
    .slice(0, MAX_LINES)
    .map(line => line.slice(0, MAX_LINE_LENGTH))

  const lineHeightPx = fontSize * lineHeight

  const measureCanvas = createCanvas(1, 1)
  const measureCtx = measureCanvas.getContext('2d')
  measureCtx.font = `${fontSize}px "${family}"`
  const textWidth = Math.max(...lines.map(line => measureCtx.measureText(line).width), 1)

  const width = Math.min(Math.ceil(textWidth), MAX_WIDTH)
  const height = Math.min(Math.ceil(lineHeightPx * lines.length), MAX_HEIGHT)

  const canvas = createCanvas(Math.ceil(width * scale), Math.ceil(height * scale))
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.font = `${fontSize}px "${family}"`
  ctx.fillStyle = COLOR
  ctx.textBaseline = 'top'

  lines.forEach((line, i) => {
    ctx.fillText(line, 0, i * lineHeightPx)
  })

  const buffer = canvas.toBuffer('image/png')

  setResponseHeaders(event, {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=31536000, immutable',
  })

  return buffer
})
