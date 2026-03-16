import './GenerateButton.css';

export default function GenerateButton({ disabled, onClick, onClickTextOnly }) {
  return (
    <div className="generate-group">
      <button
        className="generate-btn"
        disabled={disabled}
        onClick={onClick}
      >
        Generate PDFs
      </button>
      <button
        className="generate-btn generate-btn--text-only"
        disabled={disabled}
        onClick={onClickTextOnly}
        title="Text only — for printing on pre-printed paper"
      >
        Print Only
      </button>
    </div>
  );
}
