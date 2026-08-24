import type { Buffer } from 'node:buffer'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'

/**
 * Shared logic for /api/text-image and /api/text-image-meta: both need the
 * same font registration and text-measuring math, kept in sync here so the
 * measured box always matches what actually gets rendered.
 */

export const FONT_FAMILIES = {
  regular: 'ABCPelikan',
  bold: 'ABCPelikan-Bold',
} as const

export type WeightKey = keyof typeof FONT_FAMILIES

export const COLOR = '#000000'

export const MAX_LINE_LENGTH = 80
export const MAX_LINES = 4
export const MAX_WIDTH = 900
export const MAX_HEIGHT = 400

let fontsReady: Promise<void> | null = null

export function registerFonts() {
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

export function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const num = Number(value)
  if (!Number.isFinite(num))
    return fallback
  return Math.min(Math.max(num, min), max)
}

export function normalizeLines(text: string) {
  return text
    .split('\n')
    .slice(0, MAX_LINES)
    .map(line => line.slice(0, MAX_LINE_LENGTH))
}

export function measureTextBox(lines: string[], family: string, fontSize: number, lineHeight: number) {
  const lineHeightPx = fontSize * lineHeight

  const measureCanvas = createCanvas(1, 1)
  const measureCtx = measureCanvas.getContext('2d')
  measureCtx.font = `${fontSize}px "${family}"`
  const textWidth = Math.max(...lines.map(line => measureCtx.measureText(line).width), 1)

  const width = Math.min(Math.ceil(textWidth), MAX_WIDTH)
  const height = Math.min(Math.ceil(lineHeightPx * lines.length), MAX_HEIGHT)

  return { width, height, lineHeightPx }
}

export function parseTextQuery(query: Record<string, unknown>) {
  const rawText = Array.isArray(query.text) ? query.text[0] : query.text
  const text = String(rawText ?? '').trim()

  const weightKey: WeightKey = query.weight === 'bold' ? 'bold' : 'regular'

  const fontSize = clampNumber(query.fontSize, 8, 72, 16)
  const lineHeight = clampNumber(query.lineHeight, 0.8, 3, 1.2)
  const scale = clampNumber(query.scale, 1, 4, 3)

  return { text, weightKey, fontSize, lineHeight, scale }
}
