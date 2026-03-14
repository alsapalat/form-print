import { useState, useCallback } from 'react';
import { parseCsv } from '../utils/csvParser';

export function useCsvParser() {
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [csvLoaded, setCsvLoaded] = useState(false);

  const loadCsv = useCallback(async (file) => {
    const result = await parseCsv(file);
    setHeaders(result.headers);
    setRows(result.rows);
    setCsvLoaded(true);
    return result;
  }, []);

  const clearCsv = useCallback(() => {
    setHeaders([]);
    setRows([]);
    setCsvLoaded(false);
  }, []);

  return { headers, rows, csvLoaded, loadCsv, clearCsv };
}
