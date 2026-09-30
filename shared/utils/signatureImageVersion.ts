/**
 * Version of the signature images (/api/signature-image). Bump it whenever
 * their layout or rendering changes (server/utils/signatureImage.ts).
 *
 * It's part of the server cache key AND of the image URLs (`v=`): the PNGs are
 * served as immutable, so without a new URL browsers, the CDN and Gmail's image
 * proxy keep showing the old image, stretched to the new size in the HTML.
 */
export const SIGNATURE_IMAGE_VERSION = 10
