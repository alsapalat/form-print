export const SCALE_FACTOR = 1.5;
export const DEFAULT_FONT_SIZE = 12;
export const DEFAULT_WIDTH = 150; // CSS px (= 100 PDF pt at SCALE_FACTOR 1.5)
export const MIN_WIDTH = 30; // CSS px (= 20 PDF pt)
export const SNAP_GRID = 15;
export const PDF_WORKER_SRC = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href;
