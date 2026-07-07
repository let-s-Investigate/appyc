import { StandardFonts, rgb } from '@cantoo/pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import { loadPdf, writePdf } from './pdf-io';
import { SignatureInput, PlacementRect } from '../types';

const INK_COLOR = rgb(0.05, 0.08, 0.25);

/**
 * Place a signature onto one page of a PDF.
 * Placement rect is page-relative (0..1, origin top-left).
 */
export async function signPdf(
  sourceUri: string,
  pageIndex: number,
  signature: SignatureInput,
  placement: PlacementRect,
  title: string
): Promise<{ uri: string; sizeBytes: number; pageCount: number }> {
  const doc = await loadPdf(sourceUri);
  const page = doc.getPage(pageIndex);
  const { width: pageWidth, height: pageHeight } = page.getSize();

  // Convert top-left relative rect to PDF bottom-left points
  const rect = {
    x: placement.x * pageWidth,
    y: pageHeight - (placement.y + placement.h) * pageHeight,
    w: placement.w * pageWidth,
    h: placement.h * pageHeight,
  };

  if (signature.kind === 'draw' && signature.pathData && signature.pathViewBox) {
    // Scale the captured SVG path into the placement rect.
    // drawSvgPath's origin is top-left of the path space, y grows downward,
    // so we pass the TOP of the rect and scale to fit.
    const scale = Math.min(
      rect.w / signature.pathViewBox.width,
      rect.h / signature.pathViewBox.height
    );
    page.drawSvgPath(signature.pathData, {
      x: rect.x,
      y: rect.y + rect.h,
      scale,
      borderColor: INK_COLOR,
      borderWidth: 2 / scale,
    });
  } else if (signature.kind === 'type' && signature.text) {
    const font = await doc.embedFont(StandardFonts.TimesRomanItalic);
    // Fit text into the rect width
    let fontSize = rect.h * 0.6;
    while (fontSize > 8 && font.widthOfTextAtSize(signature.text, fontSize) > rect.w) {
      fontSize -= 1;
    }
    page.drawText(signature.text, {
      x: rect.x,
      y: rect.y + rect.h / 2 - fontSize / 2,
      size: fontSize,
      font,
      color: INK_COLOR,
    });
  } else if (signature.kind === 'image' && signature.imageUri) {
    const base64 = await FileSystem.readAsStringAsync(signature.imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const isJpeg = /\.jpe?g$/i.test(signature.imageUri);
    const embedded = isJpeg ? await doc.embedJpg(base64) : await doc.embedPng(base64);
    // Fit image into rect preserving aspect
    const imgAspect = embedded.height / embedded.width;
    let drawW = rect.w;
    let drawH = drawW * imgAspect;
    if (drawH > rect.h) {
      drawH = rect.h;
      drawW = drawH / imgAspect;
    }
    page.drawImage(embedded, {
      x: rect.x + (rect.w - drawW) / 2,
      y: rect.y + (rect.h - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  } else {
    throw new Error('No signature content provided.');
  }

  const { uri, sizeBytes } = await writePdf(doc, title);
  return { uri, sizeBytes, pageCount: doc.getPageCount() };
}
