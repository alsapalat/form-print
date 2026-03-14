import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function downloadAsZip(pdfResults, baseFileName = 'output') {
  const zip = new JSZip();

  for (const { index, bytes } of pdfResults) {
    const name = `${baseFileName}_${String(index + 1).padStart(3, '0')}.pdf`;
    zip.file(name, bytes);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${baseFileName}.zip`);
}
