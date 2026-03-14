import { useRef, useCallback } from 'react';
import './PlacedVariable.css';

export default function PlacedVariable({ placement, onDragStart, onMove, onRemove }) {
  const touchRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    touchRef.current = {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
    };
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      e.preventDefault();
      if (!touchRef.current) return;
      const touch = e.touches[0];
      const overlay = e.currentTarget.parentElement;
      if (!overlay) return;
      const overlayRect = overlay.getBoundingClientRect();
      const x = touch.clientX - overlayRect.left - touchRef.current.offsetX;
      const y = touch.clientY - overlayRect.top - touchRef.current.offsetY;
      onMove(placement.id, x, y);
    },
    [placement.id, onMove],
  );

  const handleTouchEnd = useCallback(() => {
    touchRef.current = null;
  }, []);

  return (
    <div
      className="placed-variable"
      style={{ left: placement.x, top: placement.y }}
      draggable
      onDragStart={(e) => onDragStart(e, placement.id)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <span className="placed-variable-label">{`{{${placement.variable}}}`}</span>
      <button
        className="placed-variable-remove"
        onClick={() => onRemove(placement.id)}
        title="Remove"
      >
        &times;
      </button>
    </div>
  );
}
