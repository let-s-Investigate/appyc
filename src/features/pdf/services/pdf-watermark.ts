import { StandardFonts, degrees, rgb } from '@cantoo/pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import { loadPdf, writePdf } from './pdf-io';
import { WatermarkOptions } from '../types';

const WATERMARK_COLOR = rgb(0.6, 0.6, 0.6);

/** Stamp a text or image watermark onto every page */
export async function watermarkPdf(
  sourceUri: string,
  options: WatermarkOptions,
  title: string
): Promise<{ uri: string; sizeBytes: number; pageCount: number }> {
  const doc = await loadPdf(sourceUri);

  let embeddedImage = null;
  if (options.imageUri) {
    const base64 = await FileSystem.readAsStringAsync(options.imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    embeddedImage = options.imageUri.toLowerCase().includes('.jpg') || options.imageUri.toLowerCase().includes('.jpeg')
      ? await doc.embedJpg(base64)
      : await doc.embedPng(base64);
  }

  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();

    const stamps: { x: number; y: number }[] =
      options.mode === 'tile'
        ? // 3x4 grid of stamps across the page
          Array.from({ length: 12 }, (_, i) => ({
            x: (i % 3) * (width / 3) + width / 12,
            y: Math.floor(i / 3) * (height / 4) + height / 10,
          }))
        : [{ x: width / 2, y: height / 2 }];

    for (const stamp of stamps) {
      if (embeddedImage) {
        const imgWidth = options.mode === 'tile' ? width / 4 : width / 2;
        const imgHeight = (embeddedImage.height / embeddedImage.width) * imgWidth;
        page.drawImage(embeddedImage, {
          x: stamp.x - imgWidth / 2,
          y: stamp.y - imgHeight / 2,
          width: imgWidth,
          height: imgHeight,
          opacity: options.opacity,
          rotate: degrees(options.rotation),
        });
      } else {
        const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
        page.drawText(options.text, {
          x: stamp.x - textWidth / 2,
          y: stamp.y,
          size: options.fontSize,
          font,
          color: WATERMARK_COLOR,
          opacity: options.opacity,
          rotate: degrees(options.rotation),
        });
      }
    }
  }

  const { uri, sizeBytes } = await writePdf(doc, title);
  return { uri, sizeBytes, pageCount: doc.getPageCount() };
}
