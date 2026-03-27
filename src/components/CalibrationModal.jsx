import { useState, useCallback } from 'react';
import {
  PAPER_SIZES,
  MARKER_INSET_MM,
  generateTestPagePdf,
  computeCalibration,
  saveCalibration,
  clearCalibration,
  loadCalibration,
} from '../utils/calibration';
import './CalibrationModal.css';

export default function CalibrationModal({ isOpen, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [paperSize, setPaperSize] = useState('a4');
  const [measurements, setMeasurements] = useState({
    tlLeft: '',
    tlTop: '',
    brRight: '',
    brBottom: '',
  });
  const [result, setResult] = useState(null);

  const handleDownload = useCallback(async () => {
    const bytes = await generateTestPagePdf(paperSize);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calibration-test-${paperSize}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [paperSize]);

  const handleMeasurementChange = useCallback((field, value) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
  }, []);

  const allFilled =
    measurements.tlLeft !== '' &&
    measurements.tlTop !== '' &&
    measurements.brRight !== '' &&
    measurements.brBottom !== '';

  const handleCompute = useCallback(() => {
    const cal = computeCalibration(
      paperSize,
      parseFloat(measurements.tlLeft),
      parseFloat(measurements.tlTop),
      parseFloat(measurements.brRight),
      parseFloat(measurements.brBottom),
    );
    setResult(cal);
    setStep(3);
  }, [paperSize, measurements]);

  const handleSave = useCallback(() => {
    if (!result) return;
    saveCalibration(result, paperSize);
    onSave?.(loadCalibration());
    onClose();
    resetState();
  }, [result, paperSize, onSave, onClose]);

  const handleClear = useCallback(() => {
    clearCalibration();
    onSave?.(null);
    onClose();
    resetState();
  }, [onSave, onClose]);

  const resetState = () => {
    setStep(1);
    setMeasurements({ tlLeft: '', tlTop: '', brRight: '', brBottom: '' });
    setResult(null);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  if (!isOpen) return null;

  const existing = loadCalibration();

  return (
    <div className="cal-backdrop" onClick={handleClose}>
      <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="cal-title">Printer Calibration</h3>
        <p className="cal-step-label">Step {step} of 3</p>

        {step === 1 && (
          <>
            <p className="cal-section-label">Paper Size</p>
            <div className="cal-radio-group">
              {Object.entries(PAPER_SIZES).map(([key, val]) => (
                <label key={key}>
                  <input
                    type="radio"
                    name="paperSize"
                    value={key}
                    checked={paperSize === key}
                    onChange={() => setPaperSize(key)}
                  />
                  {val.label} ({val.widthMm}&times;{val.heightMm}mm)
                </label>
              ))}
            </div>
            <div className="cal-instructions">
              <ol>
                <li>Download and print the test page at <b>100% scale</b></li>
                <li>Do not use "fit to page" or "shrink to fit"</li>
                <li>Measure crosshair positions with a ruler (in mm)</li>
              </ol>
            </div>
            <div className="cal-btn-row">
              {existing && (
                <button className="cal-btn cal-btn-danger" onClick={handleClear}>
                  Clear Calibration
                </button>
              )}
              <button className="cal-btn" onClick={handleClose}>Cancel</button>
              <button className="cal-btn cal-btn-primary" onClick={handleDownload}>
                Download Test Page
              </button>
              <button className="cal-btn" onClick={() => setStep(2)}>
                Next &rarr;
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="cal-diagram">
              <div className="cal-diagram-box">
                <div className="cal-diagram-marker tl" />
                <div className="cal-diagram-marker br" />
                <span className="cal-diagram-arrow tl-left">&#8592; left</span>
                <span className="cal-diagram-arrow tl-top">&#8593; top</span>
                <span className="cal-diagram-arrow br-right">right &#8594;</span>
                <span className="cal-diagram-arrow br-bottom">bottom &#8595;</span>
              </div>
            </div>
            <p className="cal-section-label">
              Measurements (mm) &mdash; expected: {MARKER_INSET_MM}mm each
            </p>
            <div className="cal-measure-grid">
              <div className="cal-measure-field">
                <label>TL &rarr; left edge</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={String(MARKER_INSET_MM)}
                  value={measurements.tlLeft}
                  onChange={(e) => handleMeasurementChange('tlLeft', e.target.value)}
                />
              </div>
              <div className="cal-measure-field">
                <label>TL &rarr; top edge</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={String(MARKER_INSET_MM)}
                  value={measurements.tlTop}
                  onChange={(e) => handleMeasurementChange('tlTop', e.target.value)}
                />
              </div>
              <div className="cal-measure-field">
                <label>BR &rarr; right edge</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={String(MARKER_INSET_MM)}
                  value={measurements.brRight}
                  onChange={(e) => handleMeasurementChange('brRight', e.target.value)}
                />
              </div>
              <div className="cal-measure-field">
                <label>BR &rarr; bottom edge</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={String(MARKER_INSET_MM)}
                  value={measurements.brBottom}
                  onChange={(e) => handleMeasurementChange('brBottom', e.target.value)}
                />
              </div>
            </div>
            <div className="cal-btn-row">
              <button className="cal-btn" onClick={() => setStep(1)}>&larr; Back</button>
              <button
                className="cal-btn cal-btn-primary"
                disabled={!allFilled}
                onClick={handleCompute}
              >
                Calculate
              </button>
            </div>
          </>
        )}

        {step === 3 && result && (
          <>
            <div className="cal-results">
              <p className="cal-results-title">Calibration Results</p>
              <p>Scale X: {(result.sx * 100).toFixed(2)}%</p>
              <p>Scale Y: {(result.sy * 100).toFixed(2)}%</p>
              <p>Offset X: {result.dxMm.toFixed(2)} mm ({result.dxPt.toFixed(2)} pt)</p>
              <p>Offset Y: {result.dyMm.toFixed(2)} mm ({result.dyPt.toFixed(2)} pt)</p>
            </div>
            <div className="cal-btn-row">
              <button className="cal-btn" onClick={() => setStep(2)}>&larr; Back</button>
              <button className="cal-btn" onClick={handleClose}>Cancel</button>
              <button className="cal-btn cal-btn-primary" onClick={handleSave}>
                Save Calibration
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
