import { useRef, useCallback } from 'react';
import { MIN_WIDTH } from '../constants';
import './PlacedVariable.css';

export default function PlacedVariable({ placement, onMove, onRemove, onUpdate, scaleFactor, previewRow }) {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  // --- Box drag: Mouse (desktop) ---
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

  // --- Box drag: Touch (mobile) ---
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

  // --- Resize handle: Mouse ---
  const handleResizeMouseDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = placement.width;

    const handleMouseMove = (me) => {
      const delta = me.clientX - startX;
      const newWidth = Math.max(MIN_WIDTH, startWidth + delta);
      onUpdate(placement.id, { width: newWidth });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [placement.id, placement.width, onUpdate]);

  // --- Resize handle: Touch ---
  const handleResizeTouchStart = useCallback((e) => {
    e.stopPropagation();
    const touch = e.touches[0];
    resizeRef.current = {
      startX: touch.clientX,
      startWidth: placement.width,
    };
  }, [placement.width]);

  const handleResizeTouchMove = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!resizeRef.current) return;
    const touch = e.touches[0];
    const delta = touch.clientX - resizeRef.current.startX;
    const newWidth = Math.max(MIN_WIDTH, resizeRef.current.startWidth + delta);
    onUpdate(placement.id, { width: newWidth });
  }, [placement.id, onUpdate]);

  const handleResizeTouchEnd = useCallback((e) => {
    e.stopPropagation();
    resizeRef.current = null;
  }, []);

  // --- Font size controls ---
  const changeFontSize = useCallback((delta) => {
    const next = Math.min(72, Math.max(6, placement.fontSize + delta));
    onUpdate(placement.id, { fontSize: next });
  }, [placement.id, placement.fontSize, onUpdate]);

  const previewFontPx = placement.fontSize * scaleFactor;

  const previewing = !!previewRow;

  const displayText = previewRow
    ? (previewRow[placement.variable] ?? `{{${placement.variable}}}`)
    : `{{${placement.variable}}}`;

  return (
    <div
      className={`placed-variable${previewing ? ' previewing' : ''}`}
      style={{ left: placement.x, top: placement.y, width: placement.width }}
      onMouseDown={previewing ? undefined : handleMouseDown}
      onTouchStart={previewing ? undefined : handleTouchStart}
      onTouchMove={previewing ? undefined : handleTouchMove}
      onTouchEnd={previewing ? undefined : handleTouchEnd}
    >
      {!previewing && (
        <>
          {/* Toolbar */}
          <div className="pv-toolbar" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
            <div className="pv-font-controls">
              <button className="pv-btn" onClick={() => changeFontSize(-1)} title="Decrease font size">&minus;</button>
              <span className="pv-font-size">{placement.fontSize}</span>
              <button className="pv-btn" onClick={() => changeFontSize(1)} title="Increase font size">+</button>
            </div>
            <button
              className="pv-btn pv-close"
              onClick={() => onRemove(placement.id)}
              title="Remove"
            >
              &times;
            </button>
          </div>

          {/* Resize handle */}
          <div
            className="pv-resize-handle"
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeTouchStart}
            onTouchMove={handleResizeTouchMove}
            onTouchEnd={handleResizeTouchEnd}
          />
        </>
      )}

      {/* Content area */}
      <div
        className="pv-content"
        style={{ fontSize: previewFontPx, lineHeight: 1.2 }}
      >
        {displayText}
      </div>
    </div>
  );
}
