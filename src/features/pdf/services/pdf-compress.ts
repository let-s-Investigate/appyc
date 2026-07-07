import { PDFDocument } from '@cantoo/pdf-lib';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { renderAllPages } from './pdf-thumbnails';
import { writePdf, getFileSize } from './pdf-io';
import { CompressionLevel, CompressionResult } from '../types';

// Render quality (pdf->image) and JPEG re-encode settings per level.
// "high" compression = smallest file, lowest quality.
const LEVELS: Record<CompressionLevel, { renderQuality: number; jpegQuality: number; maxWidth: number }> = {
  high: { renderQuality: 60, jpegQuality: 0.4, maxWidth: 1000 },
  medium: { renderQuality: 75, jpegQuality: 0.6, maxWidth: 1400 },
  low: { renderQuality: 90, jpegQuality: 0.8, maxWidth: 1800 },
};

/**
 * Compress by rasterizing each page and re-encoding as JPEG.
 * Effective for scanned/image PDFs; text pages become images.
 */
export async function compressPdf(
  sourceUri: string,
  level: CompressionLevel,
  title: string
): Promise<CompressionResult> {
  const settings = LEVELS[level];
  const beforeBytes = await getFileSize(sourceUri);

  const pageImages = await renderAllPages(sourceUri, settings.renderQuality);
  if (pageImages.length === 0) {
    throw new Error('Could not read pages from this PDF.');
  }

  const output = await PDFDocument.create();

  for (const pageImage of pageImages) {
    const context = ImageManipulator.manipulate(pageImage.uri);
    if (pageImage.width > settings.maxWidth) {
      context.resize({ width: settings.maxWidth });
    }
    const rendered = await context.renderAsync();
    const saved = await rendered.saveAsync({ compress: settings.jpegQuality, format: SaveFormat.JPEG });

    const jpegBase64 = await FileSystem.readAsStringAsync(saved.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const embedded = await output.embedJpg(jpegBase64);

    // Keep the original page aspect ratio at A4-equivalent point size
    const aspect = pageImage.height / pageImage.width;
    const pageWidth = 595;
    const pageHeight = pageWidth * aspect;
    const page = output.addPage([pageWidth, pageHeight]);
    page.drawImage(embedded, { x: 0, y: 0, width: pageWidth, height: pageHeight });
  }

  const { uri, sizeBytes } = await writePdf(output, title);
  return { uri, beforeBytes, afterBytes: sizeBytes, pageCount: pageImages.length };
}
