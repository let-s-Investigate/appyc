import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StatusBar, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Images } from '@/constants/images';
import { useTheme } from '@/hooks/use-theme';
import { useFilesStore } from '@/features/files/store/filesStore';
import { ScannedFile } from '@/features/files/types';
import SourcePickerSheet from '@/features/pdf/components/SourcePickerSheet';
import ToolProgress from '@/features/pdf/components/ToolProgress';
import ToolSuccess from '@/features/pdf/components/ToolSuccess';
import { watermarkPdf } from '@/features/pdf/services/pdf-watermark';
import { renderFirstPage } from '@/features/pdf/services/pdf-thumbnails';
import { useSaveOutput } from '@/features/pdf/hooks/use-save-output';
import { buildOutputTitle } from '@/features/pdf/utils/naming';
import { PageThumb, ToolOutput, WatermarkMode } from '@/features/pdf/types';

const OPACITY_OPTIONS = [0.15, 0.3, 0.5];
const ROTATION_OPTIONS = [0, 45];

/** Dark-canvas watermark screen (per "watermark adding screens" mockup) */
export default function WatermarkPdfScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { fileId } = useLocalSearchParams<{ fileId?: string }>();
  const { files } = useFilesStore();
  const { saveOutput } = useSaveOutput();

  const preselected = files.find((f) => f.id === fileId && !!f.uri);
  const [file, setFile] = useState<ScannedFile | null>(preselected ?? null);
  const [preview, setPreview] = useState<PageThumb | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [tab, setTab] = useState<'text' | 'logo'>('text');
  const [text, setText] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [mode, setMode] = useState<WatermarkMode>('tile');

  const [pickerVisible, setPickerVisible] = useState(!preselected);
  const [working, setWorking] = useState(false);
  const [output, setOutput] = useState<ToolOutput | null>(null);

  const fileUri = file?.uri;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!fileUri) {
        setPreview(null);
        return;
      }
      setLoadingPreview(true);
      const thumb = await renderFirstPage(fileUri, 85);
      if (!cancelled) {
        setPreview(thumb);
        setLoadingPreview(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fileUri]);

  const pickLogo = async () => {
    const ImagePicker = require('expo-image-picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const canSave = !!file && (tab === 'text' ? text.trim().length > 0 : !!logoUri);

  const handleSave = async () => {
    if (!file?.uri || !canSave) return;
    setWorking(true);
    try {
      const title = buildOutputTitle('Watermarked');
      const result = await watermarkPdf(
        file.uri,
        {
          text: text.trim(),
          imageUri: tab === 'logo' ? logoUri ?? undefined : undefined,
          opacity,
          rotation,
          mode,
          fontSize: 28,
        },
        title
      );
      const saved = await saveOutput({ ...result, title });
      setOutput(saved);
    } catch (err) {
      console.error('Watermark failed:', err);
      Alert.alert('Watermark Failed', 'This PDF could not be processed. It may be damaged or password protected.');
    } finally {
      setWorking(false);
    }
  };

  // Preview page sizing
  const canvasWidth = windowWidth - 64;
  const pageAspect = preview ? preview.height / preview.width : 1.414;
  const pageHeight = Math.min(canvasWidth * pageAspect, windowHeight * 0.42);
  const pageWidth = pageHeight / pageAspect;

  // Watermark stamp positions matching the service (tile: 3x4 grid)
  const stamps =
    mode === 'tile'
      ? Array.from({ length: 12 }, (_, i) => ({
          left: ((i % 3) / 3 + 1 / 12) * pageWidth,
          top: (Math.floor(i / 3) / 4 + 1 / 10) * pageHeight,
        }))
      : [{ left: pageWidth / 2, top: pageHeight / 2 }];

  const chip = (selected: boolean) => ({
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: selected ? theme.primary : 'rgba(255,255,255,0.06)',
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D12' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D12" />
      <View style={{ height: insets.top, backgroundColor: '#0D0D12' }} />

      {/* Header */}
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'transparent' })}
        >
          <Image source={Images.icons.back} style={{ width: 22, height: 22, tintColor: '#FFFFFF' }} resizeMode="contain" />
        </Pressable>
        <Text style={{ flex: 1, color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginLeft: 4 }}>Add Watermark</Text>
      </View>

      {/* Canvas */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {!file ? (
          <Pressable onPress={() => setPickerVisible(true)} style={{ alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Tap to select a PDF</Text>
          </Pressable>
        ) : loadingPreview || !preview ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : (
          <View style={{ width: pageWidth, height: pageHeight, backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
            <Image source={{ uri: preview.uri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            {/* Watermark preview overlay */}
            {stamps.map((stamp, idx) => (
              <View
                key={idx}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: stamp.left,
                  top: stamp.top,
                  transform: [{ translateX: -60 }, { translateY: -12 }, { rotate: `-${rotation}deg` }],
                  opacity,
                  width: 120,
                  alignItems: 'center',
                }}
              >
                {tab === 'logo' && logoUri ? (
                  <Image source={{ uri: logoUri }} style={{ width: mode === 'tile' ? 48 : 96, height: mode === 'tile' ? 48 : 96 }} resizeMode="contain" />
                ) : (
                  <Text style={{ color: '#999999', fontSize: mode === 'tile' ? 13 : 22, fontWeight: '700' }} numberOfLines={1}>
                    {text || 'Watermark'}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Options panel */}
      <View style={{ backgroundColor: '#1C1C24', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingBottom: insets.bottom + 16, paddingHorizontal: 20 }}>
        <View style={{ alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 16 }} />

        {/* Tabs */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {(['text', 'logo'] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1, alignItems: 'center', paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: tab === t ? theme.primary : 'transparent' }}>
              <Text style={{ color: tab === t ? '#FFFFFF' : 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600' }}>
                {t === 'text' ? 'Watermark Text' : 'Watermark Logo'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Content */}
        {tab === 'text' ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 6 }}>Your Text</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Enter watermark text"
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.15)', paddingBottom: 8 }}
            />
          </View>
        ) : (
          <Pressable
            onPress={pickLogo}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 14, marginBottom: 16, backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' })}
          >
            {logoUri ? (
              <>
                <Image source={{ uri: logoUri }} style={{ width: 28, height: 28, marginRight: 8 }} resizeMode="contain" />
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Change Logo</Text>
              </>
            ) : (
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Choose Logo Image</Text>
            )}
          </Pressable>
        )}

        {/* Opacity / rotation / layout chips */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, width: 64 }}>Opacity</Text>
          {OPACITY_OPTIONS.map((value) => (
            <Pressable key={value} onPress={() => setOpacity(value)} style={chip(opacity === value)}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>{Math.round(value * 100)}%</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, width: 64 }}>Style</Text>
          {ROTATION_OPTIONS.map((value) => (
            <Pressable key={value} onPress={() => setRotation(value)} style={chip(rotation === value)}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>{value === 0 ? 'Straight' : 'Diagonal'}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setMode(mode === 'tile' ? 'single' : 'tile')} style={chip(mode === 'tile')}>
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>Tiled</Text>
          </Pressable>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({ flex: 1, height: 48, borderRadius: 999, backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' })}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={!canSave || working}
            style={({ pressed }) => ({ flex: 1, height: 48, borderRadius: 999, backgroundColor: pressed ? theme.primary + 'CC' : theme.primary, alignItems: 'center', justifyContent: 'center', opacity: !canSave ? 0.4 : 1 })}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Save</Text>
          </Pressable>
        </View>
      </View>

      <SourcePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(picked) => setFile(picked[0] ?? null)}
      />
      <ToolProgress visible={working} label="Applying watermark..." />
      <ToolSuccess visible={!!output} output={output} onDone={() => { setOutput(null); router.back(); }} />
    </View>
  );
}
