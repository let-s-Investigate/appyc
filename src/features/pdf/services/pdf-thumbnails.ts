import PdfThumbnail from 'react-native-pdf-thumbnail';
import { PageThumb } from '../types';

/** Render the first page of a PDF as an image (for file cards) */
export async function renderFirstPage(uri: string, quality = 80): Promise<PageThumb | null> {
  try {
    return await PdfThumbnail.generate(uri, 0, quality);
  } catch (err) {
    console.warn('Thumbnail generation failed:', err);
    return null;
  }
}

/** Render every page of a PDF as images (for previewer / page pickers) */
export async function renderAllPages(uri: string, quality = 80): Promise<PageThumb[]> {
  try {
    return await PdfThumbnail.generateAllPages(uri, quality);
  } catch (err) {
    console.warn('Page rendering failed:', err);
    return [];
  }
}
