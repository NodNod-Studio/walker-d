// Virtual module generated at build time by modules/signature-template.ts.
declare module '#signature-template' {
  /** The whole compiled MJML document, with {{placeholders}}. */
  export const document: string
  /** The <body> content, i.e. what gets pasted into mail clients, with {{placeholders}}. */
  export const fragment: string
  /** Layout sizes (px) the template was compiled with. */
  export const layout: {
    /** Signature (= wordmark) width. */
    total: number
    /** LA column width: where "DRAWAS" starts in the wordmark. */
    la: number
    /** NY column width. */
    ny: number
    linkHeight: number
    rowGap: number
  }
}
