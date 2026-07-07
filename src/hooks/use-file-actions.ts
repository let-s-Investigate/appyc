import { Alert } from 'react-native';
import { router } from 'expo-router';

export function useFileActions() {
  /** Opens a file in the in-app PDF previewer */
  const handleOpenFile = (file: { id: string; uri?: string; title: string }) => {
    if (file.uri) {
      router.push({ pathname: '/viewer', params: { fileId: file.id } });
    } else {
      Alert.alert(
        file.title,
        'This is a placeholder sample file. Only newly scanned document PDFs can be opened/previewed.'
      );
    }
  };

  return { handleOpenFile };
}
