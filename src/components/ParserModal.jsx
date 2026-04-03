import { useState, useCallback } from 'react';
import './ParserModal.css';

export default function ParserModal({ isOpen, onClose }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const parseInput = useCallback((text) => {
    setInput(text);
    setCopied(false);

    if (!text.trim()) {
      setOutput('');
      return;
    }

    const lines = text.trim().split('\n');
    const parsed = lines
      .map((line) => {
        const cols = line.split('\t');
        if (cols.length >= 3) {
          const col1 = cols[0].trim();
          const col2 = cols[1].trim();
          const col3 = cols[2].trim();
          if (col1 && col2 && col3) return `${col1} ${col2} (${col3})`;
          if (col1 && col2) return `${col1} ${col2}`;
          if (col1) return col1;
        } else if (cols.length === 2) {
          const col1 = cols[0].trim();
          const col2 = cols[1].trim();
          if (col1 && col2) return `${col1} (${col2})`;
          if (col1) return col1;
        }
        return line.trim();
      })
      .filter(Boolean)
      .join('\n');

    setOutput(parsed);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleClose = () => {
    onClose();
    setInput('');
    setOutput('');
    setCopied(false);
  };

  if (!isOpen) return null;

  return (
    <div className="parser-backdrop" onClick={handleClose}>
      <div className="parser-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="parser-title">Table Parser</h3>
        <p className="parser-desc">
          Paste a table below. 2 columns: <code>Col1 (Col2)</code>. 3 columns: <code>Col1 Col2 (Col3)</code>.
        </p>

        <textarea
          className="parser-input"
          placeholder="Paste table data here (tab-separated columns)..."
          value={input}
          onChange={(e) => parseInput(e.target.value)}
          rows={6}
        />

        {output && (
          <div className="parser-output-section">
            <div className="parser-output-header">
              <span className="parser-output-label">Result</span>
              <button className="parser-copy-btn" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            <pre className="parser-output">{output}</pre>
          </div>
        )}

        <div className="parser-btn-row">
          <button className="parser-btn" onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
