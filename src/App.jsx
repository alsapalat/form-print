import { useReducer, useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import FileUploadPanel from './components/FileUploadPanel';
import VariablePanel from './components/VariablePanel';
import PdfPreview from './components/PdfPreview';
import PageNavigation from './components/PageNavigation';
import GenerateButton from './components/GenerateButton';
import ProgressModal from './components/ProgressModal';
import { usePdfRenderer } from './hooks/usePdfRenderer';
import { useCsvParser } from './hooks/useCsvParser';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { generateAllPdfs } from './utils/pdfGenerator';
import { downloadAsZip } from './utils/zipDownloader';
import {
  saveTemplate,
  loadTemplate,
  exportTemplate,
  importTemplate,
} from './utils/templateStorage';
import { SNAP_GRID } from './constants';
import './App.css';

let nextId = 1;

function placementsReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [
        ...state,
        { id: String(nextId++), ...action.payload },
      ];
    case 'MOVE':
      return state.map((p) =>
        p.id === action.payload.id
          ? { ...p, x: action.payload.x, y: action.payload.y }
          : p,
      );
    case 'REMOVE':
      return state.filter((p) => p.id !== action.payload.id);
    case 'LOAD':
      return action.payload.map((p) => ({ id: String(nextId++), ...p }));
    case 'CLEAR_ALL':
      return [];
    default:
      return state;
  }
}

export default function App() {
  const [pdfName, setPdfName] = useState('');
  const [csvName, setCsvName] = useState('');
  const [placements, dispatch] = useReducer(placementsReducer, []);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [snapEnabled, setSnapEnabled] = useState(false);
  const importRef = useRef(null);

  const snapFn = useCallback(
    (x, y) => {
      if (!snapEnabled) return { x, y };
      return {
        x: Math.round(x / SNAP_GRID) * SNAP_GRID,
        y: Math.round(y / SNAP_GRID) * SNAP_GRID,
      };
    },
    [snapEnabled],
  );

  const {
    canvasRef,
    canvasSize,
    pdfDoc,
    pdfBytes,
    numPages,
    currentPage,
    pageDimsRef,
    loadPdf,
    renderCurrentPage,
    goToPage,
  } = usePdfRenderer();

  const { headers, rows, csvLoaded, loadCsv } = useCsvParser();

  const { handleDragStartNew, handleDragOver, handleDrop } =
    useDragAndDrop(dispatch, currentPage, snapFn);

  // Auto-save placements to localStorage when they change
  useEffect(() => {
    if (headers.length > 0 && placements.length > 0) {
      saveTemplate(headers, placements);
    }
  }, [headers, placements]);

  const handlePdfUpload = useCallback(
    async (file) => {
      setPdfName(file.name);
      dispatch({ type: 'CLEAR_ALL' });
      const doc = await loadPdf(file);
      await renderCurrentPage(1, doc);
    },
    [loadPdf, renderCurrentPage],
  );

  const handleCsvUpload = useCallback(
    async (file) => {
      setCsvName(file.name);
      const result = await loadCsv(file);
      // Auto-load saved template for these headers
      const saved = loadTemplate(result.headers);
      if (saved && saved.length > 0) {
        dispatch({ type: 'LOAD', payload: saved });
      }
    },
    [loadCsv],
  );

  const handleRemove = useCallback((id) => {
    dispatch({ type: 'REMOVE', payload: { id } });
  }, []);

  const handleMove = useCallback((id, x, y) => {
    const snapped = snapFn(x, y);
    dispatch({ type: 'MOVE', payload: { id, x: snapped.x, y: snapped.y } });
  }, [snapFn]);

  const handleTapAdd = useCallback(
    (variableName) => {
      if (!pdfDoc || canvasSize.width === 0) return;
      const x = canvasSize.width / 2 - 40;
      const y = canvasSize.height / 2 - 8;
      dispatch({
        type: 'ADD',
        payload: { variable: variableName, x, y, page: currentPage },
      });
    },
    [pdfDoc, canvasSize, currentPage],
  );

  const handleExport = useCallback(() => {
    if (headers.length === 0 || placements.length === 0) return;
    exportTemplate(headers, placements);
  }, [headers, placements]);

  const handleImport = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const data = await importTemplate(file);
        dispatch({ type: 'LOAD', payload: data.placements });
      } catch {
        alert('Invalid template file.');
      }
      // Reset input so the same file can be re-imported
      e.target.value = '';
    },
    [],
  );

  const canGenerate = pdfBytes && csvLoaded && rows.length > 0 && placements.length > 0;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    const pagesWithPlacements = [...new Set(placements.map((p) => p.page))];
    for (const pg of pagesWithPlacements) {
      if (!pageDimsRef.current.has(pg)) {
        await renderCurrentPage(pg);
      }
    }

    setProgress({ current: 0, total: rows.length });
    try {
      const results = await generateAllPdfs(
        pdfBytes,
        placements,
        rows,
        pageDimsRef.current,
        (cur, tot) => setProgress({ current: cur, total: tot }),
      );
      const baseName = pdfName.replace(/\.pdf$/i, '') || 'output';
      await downloadAsZip(results, baseName);
    } finally {
      setProgress({ current: 0, total: 0 });
    }
  }, [canGenerate, pdfBytes, placements, rows, pageDimsRef, pdfName, renderCurrentPage]);

  return (
    <div className="app">
      <Header>
        <GenerateButton disabled={!canGenerate} onClick={handleGenerate} />
      </Header>
      <FileUploadPanel
        onPdfUpload={handlePdfUpload}
        onCsvUpload={handleCsvUpload}
        pdfName={pdfName}
        csvName={csvName}
      />
      {pdfDoc && (
        <div className="toolbar">
          <label className="snap-toggle">
            <input
              type="checkbox"
              checked={snapEnabled}
              onChange={(e) => setSnapEnabled(e.target.checked)}
            />
            <span className="snap-toggle-label">Snap to grid</span>
          </label>
          <div className="toolbar-separator" />
          <button
            className="toolbar-btn"
            disabled={placements.length === 0}
            onClick={handleExport}
            title="Export template"
          >
            Export Template
          </button>
          <label className="toolbar-btn" title="Import template">
            Import Template
            <input
              ref={importRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              hidden
            />
          </label>
        </div>
      )}
      <div className="workspace">
        <VariablePanel
          headers={headers}
          onDragStart={handleDragStartNew}
          onTapAdd={handleTapAdd}
        />
        <div className="preview-area">
          {pdfDoc ? (
            <>
              <PdfPreview
                canvasRef={canvasRef}
                canvasSize={canvasSize}
                placements={placements}
                currentPage={currentPage}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onMove={handleMove}
                onRemove={handleRemove}
                pdfDoc={pdfDoc}
                renderCurrentPage={renderCurrentPage}
              />
              <PageNavigation
                currentPage={currentPage}
                numPages={numPages}
                onPageChange={goToPage}
              />
            </>
          ) : (
            <div className="preview-placeholder">
              Upload a PDF to get started
            </div>
          )}
        </div>
      </div>
      {progress.total > 0 && (
        <ProgressModal current={progress.current} total={progress.total} />
      )}
    </div>
  );
}
