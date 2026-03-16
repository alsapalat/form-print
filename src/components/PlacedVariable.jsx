import { useRef, useCallback } from 'react';
import './PlacedVariable.css';

export default function PlacedVariable({ placement, onMove, onRemove }) {
  const dragRef = useRef(null);

  // --- Mouse (desktop) ---
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const overlay = e.currentTarget.parentElement;
    if (!overlay) return;

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (me) => {
      const overlayRect = overlay.getBoundingClientRect();
      const x = me.clientX - overlayRect.left - offsetX;
      const y = me.clientY - overlayRect.top - offsetY;
      onMove(placement.id, x, y);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [placement.id, onMove]);

  // --- Touch (mobile) ---
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
    };
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      e.preventDefault();
      if (!dragRef.current) return;
      const touch = e.touches[0];
      const overlay = e.currentTarget.parentElement;
      if (!overlay) return;
      const overlayRect = overlay.getBoundingClientRect();
      const x = touch.clientX - overlayRect.left - dragRef.current.offsetX;
      const y = touch.clientY - overlayRect.top - dragRef.current.offsetY;
      onMove(placement.id, x, y);
    },
    [placement.id, onMove],
  );

  const handleTouchEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div
      className="placed-variable"
      style={{ left: placement.x, top: placement.y }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <span className="placed-variable-label">{`{{${placement.variable}}}`}</span>
      <button
        className="placed-variable-remove"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => onRemove(placement.id)}
        title="Remove"
      >
        &times;
      </button>
    </div>
  );
}
