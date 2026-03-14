import Papa from 'papaparse';

export function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
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
