import { loadPdf, writePdf } from './pdf-io';

/** Encrypt a PDF with a user password (AES via @cantoo/pdf-lib) */
export async function protectPdf(
  sourceUri: string,
  password: string,
  title: string
): Promise<{ uri: string; sizeBytes: number; pageCount: number }> {
  const doc = await loadPdf(sourceUri);

  await doc.encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: { printing: 'highResolution', copying: false, modifying: false },
  });

  const { uri, sizeBytes } = await writePdf(doc, title);
  return { uri, sizeBytes, pageCount: doc.getPageCount() };
}
