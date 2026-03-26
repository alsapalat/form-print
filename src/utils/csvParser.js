import Papa from 'papaparse';

export async function parseCsv(file) {
  const buffer = await file.arrayBuffer();

  // Try UTF-8 first; if it produces replacement chars, fall back to Windows-1252
  // (Excel on Windows saves CSVs in Windows-1252 by default)
  let text = new TextDecoder('utf-8').decode(buffer);
  if (text.includes('\uFFFD')) {
    text = new TextDecoder('windows-1252').decode(buffer);
  }

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data,
        });
      },
      error(err) {
        reject(err);
      },
    });
  });
}
