import './GenerateButton.css';

export default function GenerateButton({ disabled, onClick }) {
  return (
    <button
      className="generate-btn"
      disabled={disabled}
      onClick={onClick}
    >
      Generate PDFs
    </button>
  );
}
