import { Alert } from 'react-native';

export function useFileActions() {
  const handleOpenFile = async (file: { uri?: string; title: string }) => {
    if (file.uri) {
      try {
        const Sharing = require('expo-sharing');
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(file.uri, {
            mimeType: 'application/pdf',
            dialogTitle: file.title,
            UTI: 'com.adobe.pdf'
          });
        } else {
          Alert.alert('File Location', file.uri);
        }
      } catch (err) {
        console.error('Failed to share/open file:', err);
        Alert.alert('Error', 'Failed to open document preview.');
      }
    } else {
      Alert.alert(
        file.title,
        'This is a placeholder sample file. Only newly scanned document PDFs can be opened/previewed.'
      );
    }
  };

  return { handleOpenFile };
}
