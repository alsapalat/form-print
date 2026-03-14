import './GenerateButton.css';

export default function GenerateButton({ disabled, onClick }) {
  return (
    <div className="generate-bar">
      <button
        className="generate-btn"
        disabled={disabled}
        onClick={onClick}
      >
        Generate PDFs
      </button>
    </div>
  );
}
