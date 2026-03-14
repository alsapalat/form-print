import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { overlayToPdf } from './coordinateMapper';
import { DEFAULT_FONT_SIZE } from '../constants';

export async function generateSinglePdf(
  originalBytes,
  placements,
  row,
  pageDimsMap,
) {
  const pdfDoc = await PDFDocument.load(originalBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();

  for (const placement of placements) {
    const page = pages[placement.page - 1];
    if (!page) continue;

    const dims = pageDimsMap.get(placement.page);
    if (!dims) continue;

    const { pdfX, pdfY } = overlayToPdf(placement.x, placement.y, dims);
    const text = row[placement.variable] ?? '';

    page.drawText(String(text), {
      x: pdfX,
      y: pdfY - DEFAULT_FONT_SIZE,
      size: DEFAULT_FONT_SIZE,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return pdfDoc.save();
}

export async function generateAllPdfs(
  originalBytes,
  placements,
  rows,
  pageDimsMap,
  onProgress,
) {
  const results = [];
  for (let i = 0; i < rows.length; i++) {
    const pdfBytes = await generateSinglePdf(
      originalBytes,
      placements,
      rows[i],
      pageDimsMap,
    );
    results.push({ index: i, bytes: pdfBytes });
    onProgress?.(i + 1, rows.length);
  }
  return results;
}
