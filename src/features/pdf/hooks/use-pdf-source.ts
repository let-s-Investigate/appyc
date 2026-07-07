import { useState } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useFilesStore } from '@/features/files/store/filesStore';
import { ScannedFile } from '@/features/files/types';
import { imagesToPdf } from '../services/images-to-pdf';
import { buildOutputTitle } from '../utils/naming';
import { useSaveOutput } from './use-save-output';

/**
 * Resolves tool input files from the three supported sources:
 * the in-app file manager, a fresh scan, or the device's storage.
 * Every source returns ScannedFile entries registered in the files store.
 */
export function usePdfSource() {
  const { files } = useFilesStore();
  const { saveOutput } = useSaveOutput();
  const [isSourceLoading, setIsSourceLoading] = useState(false);

  /** Files already in the file manager that point to a real PDF */
  const libraryFiles = files.filter((f) => !!f.uri);

  const pickFromDevice = async (multiple = false): Promise<ScannedFile[]> => {
    try {
      setIsSourceLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple,
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets) return [];

      const imported: ScannedFile[] = [];
      for (const asset of result.assets) {
        const title = (asset.name ?? 'Imported').replace(/\.pdf$/i, '');
        const output = await saveOutput({
          uri: asset.uri,
          sizeBytes: asset.size ?? 0,
          pageCount: 0,
          title,
        });
        const stored = useFilesStore.getState().files.find((f) => f.id === output.fileId);
        if (stored) imported.push(stored);
      }
      return imported;
    } catch (err) {
      console.warn('Document pick failed:', err);
      Alert.alert('Import Failed', 'Could not import the selected PDF.');
      return [];
    } finally {
      setIsSourceLoading(false);
    }
  };

  const scanNew = async (): Promise<ScannedFile[]> => {
    try {
      const DocumentScanner = require('react-native-document-scanner-plugin').default;
      const { scannedImages, status } = await DocumentScanner.scanDocument();
      if (status !== 'success' || !scannedImages || scannedImages.length === 0) return [];

      setIsSourceLoading(true);
      const title = buildOutputTitle('Scan');
      const result = await imagesToPdf(scannedImages, title);
      const output = await saveOutput({ ...result, title });
      const stored = useFilesStore.getState().files.find((f) => f.id === output.fileId);
      return stored ? [stored] : [];
    } catch (err) {
      console.warn('Scanner unavailable:', err);
      Alert.alert(
        'Scanner Unavailable',
        'The document scanner needs a physical device camera. Import a PDF from your device instead.'
      );
      return [];
    } finally {
      setIsSourceLoading(false);
    }
  };

  return { libraryFiles, pickFromDevice, scanNew, isSourceLoading };
}
