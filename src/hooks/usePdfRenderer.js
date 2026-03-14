import { useState, useRef, useCallback } from 'react';
import { loadPdfDocument, renderPage } from '../utils/pdfRenderer';

export function usePdfRenderer() {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDimsMap, setPageDimsMap] = useState(new Map());
  const [pdfBytes, setPdfBytes] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef(null);
  const pageDimsRef = useRef(new Map());

  const loadPdf = useCallback(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    setPdfBytes(bytes);

    const doc = await loadPdfDocument(bytes.slice().buffer);
    setPdfDoc(doc);
    setNumPages(doc.numPages);
    setCurrentPage(1);
    pageDimsRef.current = new Map();
    setPageDimsMap(new Map());
    return doc;
  }, []);

  const renderCurrentPage = useCallback(
    async (pageNum, doc) => {
      const d = doc || pdfDoc;
      if (!d || !canvasRef.current) return null;
      const dims = await renderPage(d, pageNum, canvasRef.current);
      setCanvasSize({ width: dims.canvasW, height: dims.canvasH });
      pageDimsRef.current.set(pageNum, dims);
      setPageDimsMap((prev) => {
        const next = new Map(prev);
        next.set(pageNum, dims);
        return next;
      });
      return dims;
    },
    [pdfDoc],
  );

  const goToPage = useCallback(
    async (pageNum) => {
      if (pageNum < 1 || pageNum > numPages) return;
      setCurrentPage(pageNum);
      await renderCurrentPage(pageNum);
    },
    [numPages, renderCurrentPage],
  );

  return {
    canvasRef,
    canvasSize,
    pdfDoc,
    pdfBytes,
    numPages,
    currentPage,
    pageDimsMap,
    pageDimsRef,
    loadPdf,
    renderCurrentPage,
    goToPage,
    setCurrentPage,
  };
}
