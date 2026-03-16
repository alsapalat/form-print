import { useEffect } from 'react';
import PlacedVariable from './PlacedVariable';
import './PdfPreview.css';

export default function PdfPreview({
  canvasRef,
  canvasSize,
  placements,
  currentPage,
  onDragOver,
  onDrop,
  onMove,
  onRemove,
  pdfDoc,
  renderCurrentPage,
}) {
  useEffect(() => {
    if (pdfDoc) {
      renderCurrentPage(currentPage);
    }
  }, [pdfDoc, currentPage, renderCurrentPage]);

  const pagePlacements = placements.filter((p) => p.page === currentPage);

  return (
    <div className="pdf-preview">
      <div className="pdf-preview-container">
        <canvas ref={canvasRef} className="pdf-canvas" />
        {canvasSize.width > 0 && (
          <div
            className="pdf-overlay"
            onDragOver={onDragOver}
            onDrop={onDrop}
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
            }}
          >
            {pagePlacements.map((p) => (
              <PlacedVariable
                key={p.id}
                placement={p}
                onMove={onMove}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
