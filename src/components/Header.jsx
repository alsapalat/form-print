import './Header.css';

export default function Header({ children }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Form Print</h1>
        <p className="header-subtitle">
          Map CSV data onto PDF templates, then batch-generate filled PDFs
        </p>
      </div>
      {children && <div className="header-right">{children}</div>}
    </header>
  );
}
