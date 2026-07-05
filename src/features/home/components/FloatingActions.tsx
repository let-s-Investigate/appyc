import React from 'react';
import { Image, Pressable, View, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Images } from '@/constants/images';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useScannerStore } from '@/features/scanner/store/scannerStore';

export default function FloatingActions() {
  const { setPages } = useScannerStore();
  
  const bottomInset = Platform.select({
    ios: BottomTabInset + 12,     // 62px (just above the bottom tab bar on iOS)
    android: 20,                  // 20px (just above the bottom tab bar on Android)
    default: 50,
  }) ?? 20;

  const handleGalleryImport = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow access to photos to select documents.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uris = result.assets.map((asset) => asset.uri);
        setPages(uris);
        router.push('/editor');
      }
    } catch (err) {
      console.error('Gallery import failed:', err);
      Alert.alert('Error', 'Failed to import images from gallery.');
    }
  };

  const handleCameraScan = async () => {
    try {
      // Check camera permission first using ImagePicker to be friendly
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow camera access to scan documents.');
        return;
      }

      const DocumentScanner = require('react-native-document-scanner-plugin').default;
      const { scannedImages, status: scanStatus } = await DocumentScanner.scanDocument();
      
      if (scanStatus === 'success' && scannedImages && scannedImages.length > 0) {
        setPages(scannedImages);
        router.push('/editor');
      }
    } catch (err) {
      console.warn('Native Document Scanner failed or not available:', err);
      // Fallback for emulator / testing environment: allow choosing gallery photos
      Alert.alert(
        'Scanner Mock Sandbox',
        'The native edge-detection scanner requires a physical device. Would you like to select photos from your library to test the custom editor?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Select Photos', onPress: handleGalleryImport }
        ]
      );
    }
  };

  return (
    <View 
      className="absolute flex-row gap-md items-center z-50"
      style={{
        right: Spacing.four,
        bottom: bottomInset,
      }}
    >
      {/* Camera Scan FAB */}
      <Pressable 
        onPress={handleCameraScan}
        className="w-[52px] h-[52px] rounded-full bg-primary items-center justify-center shadow-lg active:opacity-80"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 5,
          elevation: 6,
        }}
      >
        <Image
          source={Images.icons.camera}
          className="w-6 h-6"
          style={{ tintColor: '#FFFFFF' }}
          resizeMode="contain"
        />
      </Pressable>

      {/* Gallery Import FAB */}
      <Pressable 
        onPress={handleGalleryImport}
        className="w-[52px] h-[52px] rounded-full bg-primary items-center justify-center shadow-lg active:opacity-80"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 5,
          elevation: 6,
        }}
      >
        <Image
          source={Images.icons.gallery}
          className="w-6 h-6"
          style={{ tintColor: '#FFFFFF' }}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
}
