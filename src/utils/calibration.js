import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const MM_TO_PT = 72 / 25.4;
export const MARKER_INSET_MM = 20;

export const PAPER_SIZES = {
  a4: { label: 'A4', widthMm: 210, heightMm: 297 },
  letter: { label: 'Letter', widthMm: 215.9, heightMm: 279.4 },
};

function drawCrosshair(page, x, y, size, font) {
  const arm = size / 2;
  // Horizontal line
  page.drawLine({
    start: { x: x - arm, y },
    end: { x: x + arm, y },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  // Vertical line
  page.drawLine({
    start: { x, y: y - arm },
    end: { x, y: y + arm },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  // Center circle
  page.drawCircle({
    x,
    y,
    size: 1.5,
    color: rgb(0, 0, 0),
  });
}

function drawRulerTicks(page, paperWidthPt, paperHeightPt, font) {
  const tickLen = 3 * MM_TO_PT;
  const smallTickLen = 1.5 * MM_TO_PT;
  const maxMmX = Math.floor((paperWidthPt / MM_TO_PT));
  const maxMmY = Math.floor((paperHeightPt / MM_TO_PT));

  // Top edge ticks
  for (let mm = 10; mm <= maxMmX - 10; mm += 10) {
    const x = mm * MM_TO_PT;
    const len = mm % 50 === 0 ? tickLen : smallTickLen;
    page.drawLine({
      start: { x, y: paperHeightPt },
      end: { x, y: paperHeightPt - len },
      thickness: 0.3,
      color: rgb(0.5, 0.5, 0.5),
    });
    if (mm % 50 === 0) {
      page.drawText(`${mm}`, {
        x: x - 4,
        y: paperHeightPt - len - 8,
        size: 5,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  }

  // Left edge ticks
  for (let mm = 10; mm <= maxMmY - 10; mm += 10) {
    const y = paperHeightPt - mm * MM_TO_PT;
    const len = mm % 50 === 0 ? tickLen : smallTickLen;
    page.drawLine({
      start: { x: 0, y },
      end: { x: len, y },
      thickness: 0.3,
      color: rgb(0.5, 0.5, 0.5),
    });
    if (mm % 50 === 0) {
      page.drawText(`${mm}`, {
        x: len + 2,
        y: y - 2,
        size: 5,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
  }
}

export async function generateTestPagePdf(paperSize = 'a4') {
  const paper = PAPER_SIZES[paperSize];
  const wPt = paper.widthMm * MM_TO_PT;
  const hPt = paper.heightMm * MM_TO_PT;
  const insetPt = MARKER_INSET_MM * MM_TO_PT;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([wPt, hPt]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const crossSize = 10 * MM_TO_PT;

  // 4 crosshair markers at 20mm inset from each corner
  const markers = [
    { x: insetPt, y: hPt - insetPt, label: 'TL' },              // top-left
    { x: wPt - insetPt, y: hPt - insetPt, label: 'TR' },        // top-right
    { x: insetPt, y: insetPt, label: 'BL' },                     // bottom-left
    { x: wPt - insetPt, y: insetPt, label: 'BR' },               // bottom-right
  ];

  for (const m of markers) {
    drawCrosshair(page, m.x, m.y, crossSize, font);
    page.drawText(m.label, {
      x: m.x + 5,
      y: m.y + 5,
      size: 7,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  // Ruler ticks
  drawRulerTicks(page, wPt, hPt, font);

  // Title and instructions
  const titleSize = 16;
  const textSize = 10;
  const cx = wPt / 2;
  const titleY = hPt * 0.65;

  const title = 'Printer Calibration Test Page';
  const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
  page.drawText(title, {
    x: cx - titleWidth / 2,
    y: titleY,
    size: titleSize,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  const instructions = [
    `Paper: ${paper.label} (${paper.widthMm} x ${paper.heightMm} mm)`,
    `Markers placed at ${MARKER_INSET_MM}mm inset from each edge.`,
    '',
    'Instructions:',
    '1. Print this page at 100% scale (no "fit to page")',
    '2. Measure with a ruler from the left edge to the TL crosshair center',
    '3. Measure from the top edge to the TL crosshair center',
    '4. Measure from the right edge to the BR crosshair center',
    '5. Measure from the bottom edge to the BR crosshair center',
    '6. Enter all 4 measurements (in mm) into the calibration dialog',
  ];

  for (let i = 0; i < instructions.length; i++) {
    const line = instructions[i];
    const lineWidth = font.widthOfTextAtSize(line, textSize);
    page.drawText(line, {
      x: cx - lineWidth / 2,
      y: titleY - 24 - i * 14,
      size: textSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  return pdfDoc.save();
}

export function computeCalibration(paperSize, tlLeft, tlTop, brRight, brBottom) {
  const paper = PAPER_SIZES[paperSize];
  const W = paper.widthMm;
  const H = paper.heightMm;
  const M = MARKER_INSET_MM;

  // Expected distance between markers
  const expectedHoriz = W - 2 * M;
  const expectedVert = H - 2 * M;

  // Actual distance between markers from measurements
  const actualHoriz = W - brRight - tlLeft;
  const actualVert = H - brBottom - tlTop;

  const sx = actualHoriz / expectedHoriz;
  const sy = actualVert / expectedVert;

  const dxMm = tlLeft - M * sx;
  const dyMm = tlTop - M * sy;

  const dxPt = dxMm * MM_TO_PT;
  const dyPt = dyMm * MM_TO_PT;

  return { sx, sy, dxMm, dyMm, dxPt, dyPt, paperSize };
}

export function applyCalibration(pdfX, pdfY, pageHeight, cal) {
  const adjustedX = (pdfX - cal.dxPt) / cal.sx;
  const adjustedY = pageHeight - (pageHeight - pdfY - cal.dyPt) / cal.sy;
  return { pdfX: adjustedX, pdfY: adjustedY };
}

const STORAGE_KEY = 'formprint_calibration';

export function saveCalibration(cal, paperSize) {
  const data = { ...cal, paperSize, savedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function loadCalibration() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCalibration() {
  localStorage.removeItem(STORAGE_KEY);
}
