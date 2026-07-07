import { useFilesStore } from '@/features/files/store/filesStore';
import { renderFirstPage } from '../services/pdf-thumbnails';
import { ToolOutput } from '../types';

/**
 * Registers a tool's output PDF in the file manager:
 * generates a thumbnail, stamps date/time, and adds it to the files store.
 */
export function useSaveOutput() {
  const addFile = useFilesStore((s) => s.addFile);

  const saveOutput = async (result: {
    uri: string;
    sizeBytes: number;
    pageCount: number;
    title: string;
  }): Promise<ToolOutput> => {
    const thumb = await renderFirstPage(result.uri);

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const date = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const fileId = addFile({
      title: result.title,
      date,
      time,
      thumbnail: thumb ? { uri: thumb.uri } : null,
      uri: result.uri,
      folderId: null,
      sizeBytes: result.sizeBytes,
      pageCount: result.pageCount,
    });

    return {
      fileId,
      uri: result.uri,
      title: result.title,
      sizeBytes: result.sizeBytes,
      pageCount: result.pageCount,
    };
  };

  return { saveOutput };
}
