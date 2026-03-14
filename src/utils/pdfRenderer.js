import * as pdfjsLib from 'pdfjs-dist';
import { PDF_WORKER_SRC, SCALE_FACTOR } from '../constants';

pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

export async function loadPdfDocument(arrayBuffer) {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  return loadingTask.promise;
}

export async function renderPage(pdfDoc, pageNumber, canvas) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: SCALE_FACTOR });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;

  const originalViewport = page.getViewport({ scale: 1 });
  return {
    canvasW: viewport.width,
    canvasH: viewport.height,
    pdfW: originalViewport.width,
    pdfH: originalViewport.height,
  };
}
