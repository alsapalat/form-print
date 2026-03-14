import './PageNavigation.css';

export default function PageNavigation({ currentPage, numPages, onPageChange }) {
  if (numPages <= 1) return null;

  return (
    <div className="page-navigation">
      <button
        className="page-btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &lt; Prev
      </button>
      <span className="page-info">
        Page {currentPage} of {numPages}
      </span>
      <button
        className="page-btn"
        disabled={currentPage >= numPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next &gt;
      </button>
    </div>
  );
}
