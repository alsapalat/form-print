import './PageNavigation.css';

export default function DataPreviewToggle({ previewRowIndex, numRows, onToggle, onRowChange }) {
  if (numRows === 0) return null;

  const active = previewRowIndex !== null;

  if (!active) {
    return (
      <div className="page-navigation">
        <button className="page-btn" onClick={() => onToggle(true)}>
          Preview Data
        </button>
      </div>
    );
  }

  return (
    <div className="page-navigation">
      <button className="page-btn" onClick={() => onToggle(false)}>
        Template
      </button>
      <button
        className="page-btn"
        disabled={previewRowIndex <= 0}
        onClick={() => onRowChange(previewRowIndex - 1)}
      >
        &lt; Prev
      </button>
      <span className="page-info">
        Row {previewRowIndex + 1} of {numRows}
      </span>
      <button
        className="page-btn"
        disabled={previewRowIndex >= numRows - 1}
        onClick={() => onRowChange(previewRowIndex + 1)}
      >
        Next &gt;
      </button>
    </div>
  );
}
