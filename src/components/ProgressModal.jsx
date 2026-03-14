import './ProgressModal.css';

export default function ProgressModal({ current, total }) {
  if (total === 0) return null;

  const pct = Math.round((current / total) * 100);

  return (
    <div className="progress-backdrop">
      <div className="progress-modal">
        <h3 className="progress-title">Generating PDFs&hellip;</h3>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="progress-text">
          {current} / {total} ({pct}%)
        </p>
      </div>
    </div>
  );
}
