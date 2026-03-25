import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { overlayToPdf } from './coordinateMapper';
import { wrapText, LINE_HEIGHT_FACTOR } from './textWrapper';
import { DEFAULT_FONT_SIZE, DEFAULT_WIDTH, SCALE_FACTOR } from '../constants';

export async function generateSinglePdf(
  originalBytes,
  placements,
  row,
  pageDimsMap,
  { textOnly = false } = {},
) {
  const srcDoc = await PDFDocument.load(originalBytes);
  let pdfDoc;
  let pages;

  if (textOnly) {
    pdfDoc = await PDFDocument.create();
    const srcPages = srcDoc.getPages();
    for (const sp of srcPages) {
      const { width, height } = sp.getSize();
      pdfDoc.addPage([width, height]);
    }
    pages = pdfDoc.getPages();
  } else {
    pdfDoc = srcDoc;
    pages = pdfDoc.getPages();
  }

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const placement of placements) {
    const page = pages[placement.page - 1];
    if (!page) continue;

    const dims = pageDimsMap.get(placement.page);
    if (!dims) continue;

    const { pdfX, pdfY } = overlayToPdf(placement.x, placement.y, dims);
    const text = String(row[placement.variable] ?? '');
    const fontSize = placement.fontSize ?? DEFAULT_FONT_SIZE;
    const pdfWidth = (placement.width ?? DEFAULT_WIDTH) / SCALE_FACTOR;

    const lines = wrapText(text, font, fontSize, pdfWidth);

    for (let i = 0; i < lines.length; i++) {
      page.drawText(lines[i], {
        x: pdfX,
        y: pdfY - fontSize - i * fontSize * LINE_HEIGHT_FACTOR,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }

  return pdfDoc.save();
}

export async function generateAllPdfs(
  originalBytes,
  placements,
  rows,
  pageDimsMap,
  onProgress,
  { textOnly = false } = {},
) {
  const results = [];
  for (let i = 0; i < rows.length; i++) {
    const pdfBytes = await generateSinglePdf(
      originalBytes,
      placements,
      rows[i],
      pageDimsMap,
      { textOnly },
    );
    results.push({ index: i, bytes: pdfBytes });
    onProgress?.(i + 1, rows.length);
  }
  return results;
}
