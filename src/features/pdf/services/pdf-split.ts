import { PDFDocument } from '@cantoo/pdf-lib';
import { loadPdf, writePdf } from './pdf-io';

/** Extract the given pages (0-indexed, in order) into a new PDF */
export async function splitPdf(
  sourceUri: string,
  pageIndices: number[],
  title: string
): Promise<{ uri: string; sizeBytes: number; pageCount: number }> {
  const source = await loadPdf(sourceUri);
  const output = await PDFDocument.create();

  const pages = await output.copyPages(source, pageIndices);
  pages.forEach((page) => output.addPage(page));

  const { uri, sizeBytes } = await writePdf(output, title);
  return { uri, sizeBytes, pageCount: output.getPageCount() };
}
