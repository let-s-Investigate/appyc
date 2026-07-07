import { PDFDocument } from '@cantoo/pdf-lib';
import { loadPdf, writePdf } from './pdf-io';

/** Combine multiple PDFs into one, in the given order */
export async function mergePdfs(
  uris: string[],
  title: string
): Promise<{ uri: string; sizeBytes: number; pageCount: number }> {
  const output = await PDFDocument.create();

  for (const uri of uris) {
    const source = await loadPdf(uri);
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }

  const { uri, sizeBytes } = await writePdf(output, title);
  return { uri, sizeBytes, pageCount: output.getPageCount() };
}
