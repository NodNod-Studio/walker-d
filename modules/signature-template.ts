import { readFile } from 'node:fs/promises'
import { GlobalFonts } from '@napi-rs/canvas'
import mjml2html from 'mjml'
import { addServerTemplate, createResolver, defineNuxtModule } from 'nuxt/kit'
import { COMPANY } from '../shared/utils/company'
import { FONT_FAMILIES, measureTextBox } from '../server/utils/signatureText'

// Wordmark as drawn in the header image (server/utils/signatureImage.ts).
const WORDMARK_FONT_SIZE = 28
const WORDMARK_HEIGHT = 39
const TEXT_LINE_HEIGHT = 1.2
// Gap between the "WALKER • " prefix and the NY column, as in the header image.
const COLUMN_GAP = 10

/** Display width of wordmark text, measured exactly like the header image does. */
function wordmarkWidth(text: string) {
  const box = measureTextBox([text], FONT_FAMILIES.bold, WORDMARK_FONT_SIZE, TEXT_LINE_HEIGHT)
  return Math.round((box.width / box.height) * WORDMARK_HEIGHT)
}

/**
 * Compiles server/templates/signature.mjml once, at build time (and on dev
 * start), into the `#signature-template` server module. At runtime the server
 * only fills its {{placeholders}}: mjml itself never ships with the app.
 *
 * mjml needs real px sizes to build its tables, so the layout ([[placeholders]])
 * is computed here from the wordmark font: the LA column ends where "DRAWAS"
 * starts, the NY column takes the rest of the wordmark width.
 */
export default defineNuxtModule({
  meta: { name: 'signature-template' },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const source = resolve('../server/templates/signature.mjml')

    // Restart dev when the template changes, so it's recompiled.
    nuxt.options.watch.push(source)

    addServerTemplate({
      filename: '#signature-template',
      async getContents() {
        GlobalFonts.registerFromPath(resolve('../server/assets/fonts/ABCPelikan-Bold.woff2'), FONT_FAMILIES.bold)

        const total = wordmarkWidth(COMPANY.wordmark)
        // Trimmed like the header image's measurement of the prefix.
        const la = wordmarkWidth(COMPANY.wordmark.replace(/DRAWAS$/, '').trim()) + COLUMN_GAP
        const layout = { total, la, ny: total - la, linkHeight: 11, rowGap: 4 }

        const mjml = (await readFile(source, 'utf8')).replace(/\[\[(\w+)\]\]/g, (_, key: string) => {
          if (!(key in layout))
            throw new Error(`signature.mjml: no layout value for [[${key}]]`)
          return String(layout[key as keyof typeof layout])
        })

        const { html: compiled, errors } = await mjml2html(mjml, {
          validationLevel: 'strict',
          keepComments: false,
          filePath: source,
        })
        if (errors.length)
          throw new Error(`signature.mjml: ${errors.map(error => error.formattedMessage).join('\n')}`)

        // mjml always centres sections in the page (`margin:0px auto` on the
        // wrapper, `align="center"` on its tables and Outlook ghost tables), with
        // no attribute to change it. A signature sits left-aligned in the email,
        // so pin it to the left.
        const html = compiled
          .replace(/margin:0px auto;/g, 'margin:0px;')
          .replace(/align="center"/g, 'align="left"')

        // What gets pasted into mail clients: the body content (<head> styles
        // don't survive a paste anyway).
        const fragment = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1]?.trim()
        if (!fragment)
          throw new Error('signature.mjml: <body> not found in the compiled HTML')

        return [
          `export const document = ${JSON.stringify(html)}`,
          `export const fragment = ${JSON.stringify(fragment)}`,
          `export const layout = ${JSON.stringify(layout)}`,
        ].join('\n')
      },
    })
  },
})
