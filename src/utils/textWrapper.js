export const LINE_HEIGHT_FACTOR = 1.2;

/**
 * Word-level greedy text wrapping using pdf-lib font metrics.
 * Falls back to character-level splitting for words wider than maxWidth.
 *
 * @param {string} text - The text to wrap
 * @param {import('pdf-lib').PDFFont} font - Embedded pdf-lib font
 * @param {number} fontSize - Font size in PDF points
 * @param {number} maxWidth - Maximum line width in PDF points
 * @returns {string[]} Array of lines
 */
export function wrapText(text, font, fontSize, maxWidth) {
  if (!text) return [''];
  if (maxWidth <= 0) return [text];

  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  const spaceWidth = font.widthOfTextAtSize(' ', fontSize);

  for (const word of words) {
    const wordWidth = font.widthOfTextAtSize(word, fontSize);

    // Word itself exceeds maxWidth — split by character
    if (wordWidth > maxWidth) {
      // Flush current line first
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      let charBuf = '';
      for (const ch of word) {
        const testWidth = font.widthOfTextAtSize(charBuf + ch, fontSize);
        if (testWidth > maxWidth && charBuf) {
          lines.push(charBuf);
          charBuf = ch;
        } else {
          charBuf += ch;
        }
      }
      if (charBuf) currentLine = charBuf;
      continue;
    }

    if (!currentLine) {
      currentLine = word;
    } else {
      const testWidth = font.widthOfTextAtSize(currentLine, fontSize) + spaceWidth + wordWidth;
      if (testWidth <= maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : [''];
}
