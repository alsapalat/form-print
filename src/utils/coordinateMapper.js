import { SCALE_FACTOR } from '../constants';

/**
 * Convert overlay (CSS pixel) coordinates to pdf-lib coordinates.
 * Overlay: top-left origin, Y down.
 * pdf-lib: bottom-left origin, Y up, in PDF points.
 */
export function overlayToPdf(overlayX, overlayY, pageDims) {
  const pdfX = overlayX / SCALE_FACTOR;
  const pdfY = pageDims.pdfH - overlayY / SCALE_FACTOR;
  return { pdfX, pdfY };
}

export function pdfToOverlay(pdfX, pdfY, pageDims) {
  const overlayX = pdfX * SCALE_FACTOR;
  const overlayY = (pageDims.pdfH - pdfY) * SCALE_FACTOR;
  return { overlayX, overlayY };
}
