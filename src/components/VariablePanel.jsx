import { useState } from 'react';
import VariableChip from './VariableChip';
import './VariablePanel.css';

export default function VariablePanel({ headers, onDragStart, onTapAdd }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (headers.length === 0) {
    return (
      <aside className="variable-panel">
        <h3 className="variable-panel-title">Variables</h3>
        <p className="variable-panel-empty">Upload a CSV to see variables</p>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="variable-drawer-toggle"
        onClick={() => setDrawerOpen((o) => !o)}
      >
        {drawerOpen ? 'Hide Variables' : `Variables (${headers.length})`}
      </button>

      {/* Backdrop for closing drawer on mobile */}
      {drawerOpen && (
        <div
          className="variable-drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <aside className={`variable-panel ${drawerOpen ? 'variable-panel--open' : ''}`}>
        <h3 className="variable-panel-title">Variables</h3>
        <p className="variable-panel-hint desktop-only">Drag onto PDF to place</p>
        <p className="variable-panel-hint mobile-only">Tap to place on PDF</p>
        <div className="variable-list">
          {headers.map((h) => (
            <VariableChip
              key={h}
              name={h}
              onDragStart={onDragStart}
              onTap={(name) => {
                onTapAdd?.(name);
                setDrawerOpen(false);
              }}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
