import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';

export function useAboutActions() {
  const openUrl = useCallback(async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Unable to open', 'No app is available to handle this link.');
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert('Something went wrong', 'Please try again later.');
    }
  }, []);

  return { openUrl };
}
