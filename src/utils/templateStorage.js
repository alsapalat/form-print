const STORAGE_PREFIX = 'formprint_tpl_';

/**
 * Build a deterministic key from CSV headers.
 * Sort, join, then produce a simple hash string.
 */
function hashHeaders(headers) {
  const sorted = [...headers].sort().join('\0');
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    hash = ((hash << 5) - hash + sorted.charCodeAt(i)) | 0;
  }
  return STORAGE_PREFIX + (hash >>> 0).toString(36);
}

function buildTemplateData(placements) {
  return placements.map(({ variable, x, y, page }) => ({
    variable,
    x,
    y,
    page,
  }));
}

export function saveTemplate(headers, placements) {
  if (!headers.length || !placements.length) return;
  const key = hashHeaders(headers);
  const data = {
    headers: [...headers].sort(),
    placements: buildTemplateData(placements),
  };
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

export function loadTemplate(headers) {
  if (!headers.length) return null;
  const key = hashHeaders(headers);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.placements)) return null;
    return data.placements;
  } catch {
    return null;
  }
}

export function clearTemplate(headers) {
  if (!headers.length) return;
  const key = hashHeaders(headers);
  localStorage.removeItem(key);
}

export function exportTemplate(headers, placements) {
  const data = {
    headers: [...headers].sort(),
    placements: buildTemplateData(placements),
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'form-print-template.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importTemplate(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.placements)) {
          reject(new Error('Invalid template: missing placements'));
          return;
        }
        resolve(data);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
