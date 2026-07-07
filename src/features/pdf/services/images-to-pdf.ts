import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { buildOutputFilename } from '../utils/naming';

/**
 * Build a PDF from a list of image uris (one A4 page per image).
 * Same HTML pipeline the scan editor uses for its saved documents.
 */
export async function imagesToPdf(
  imageUris: string[],
  title: string
): Promise<{ uri: string; sizeBytes: number; pageCount: number }> {
  const pagesHtml = imageUris
    .map(
      (uri) => `
        <div style="page-break-after:always; width:595px; height:842px; display:flex; justify-content:center; align-items:center; box-sizing:border-box; padding:20px; background-color:#ffffff;">
          <img src="${uri}" style="width:100%; height:100%; object-fit:contain;" />
        </div>`
    )
    .join('');

  const html = `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;background:#fff;}</style></head><body>${pagesHtml}</body></html>`;
  const printResult = await Print.printToFileAsync({ html, base64: false });

  const uri = `${FileSystem.documentDirectory}${buildOutputFilename(title)}`;
  await FileSystem.copyAsync({ from: printResult.uri, to: uri });

  const info = await FileSystem.getInfoAsync(uri);
  return { uri, sizeBytes: info.exists ? info.size : 0, pageCount: imageUris.length };
}
