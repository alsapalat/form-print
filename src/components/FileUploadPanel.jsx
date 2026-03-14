import './FileUploadPanel.css';

export default function FileUploadPanel({ onPdfUpload, onCsvUpload, pdfName, csvName }) {
  const handlePdf = (e) => {
    const file = e.target.files?.[0];
    if (file) onPdfUpload(file);
  };

  const handleCsv = (e) => {
    const file = e.target.files?.[0];
    if (file) onCsvUpload(file);
  };

  return (
    <div className="file-upload-panel">
      <label className="upload-btn">
        {pdfName ? `PDF: ${pdfName}` : 'Upload PDF'}
        <input type="file" accept=".pdf" onChange={handlePdf} hidden />
      </label>
      <label className="upload-btn">
        {csvName ? `CSV: ${csvName}` : 'Upload CSV'}
        <input type="file" accept=".csv" onChange={handleCsv} hidden />
      </label>
    </div>
  );
}
