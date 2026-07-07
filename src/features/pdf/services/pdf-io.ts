import { PDFDocument } from '@cantoo/pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import { buildOutputFilename } from '../utils/naming';

/** Read a PDF from disk into a pdf-lib document */
export async function loadPdf(uri: string, password?: string): Promise<PDFDocument> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return PDFDocument.load(base64, {
    ignoreEncryption: !password,
    password,
  } as any);
}

/** Write a pdf-lib document into the app's document directory */
export async function writePdf(
  doc: PDFDocument,
  title: string
): Promise<{ uri: string; sizeBytes: number }> {
  const base64 = await doc.saveAsBase64();
  const uri = `${FileSystem.documentDirectory}${buildOutputFilename(title)}`;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const info = await FileSystem.getInfoAsync(uri);
  return { uri, sizeBytes: info.exists ? info.size : 0 };
}

export async function getFileSize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists ? info.size : 0;
}

export async function getPageCount(uri: string): Promise<number> {
  const doc = await loadPdf(uri);
  return doc.getPageCount();
}
