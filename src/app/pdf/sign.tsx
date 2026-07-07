import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, PanResponder, Pressable, StatusBar, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import Svg, { Path } from 'react-native-svg';
import { Images } from '@/constants/images';
import { useTheme } from '@/hooks/use-theme';
import { useFilesStore } from '@/features/files/store/filesStore';
import { ScannedFile } from '@/features/files/types';
import SourcePickerSheet from '@/features/pdf/components/SourcePickerSheet';
import ToolProgress from '@/features/pdf/components/ToolProgress';
import ToolSuccess from '@/features/pdf/components/ToolSuccess';
import { signPdf } from '@/features/pdf/services/pdf-sign';
import { renderAllPages } from '@/features/pdf/services/pdf-thumbnails';
import { useSaveOutput } from '@/features/pdf/hooks/use-save-output';
import { buildOutputTitle } from '@/features/pdf/utils/naming';
import { PageThumb, SignatureInput, ToolOutput } from '@/features/pdf/types';

type SignMode = 'draw' | 'type' | 'image';
type Step = 'create' | 'place';

const SIZE_OPTIONS = [
  { key: 'S', w: 0.28 },
  { key: 'M', w: 0.4 },
  { key: 'L', w: 0.55 },
];

/** Dark-canvas eSign screens (per "signature-screens" mockup) */
export default function SignPdfScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { fileId } = useLocalSearchParams<{ fileId?: string }>();
  const { files } = useFilesStore();
  const { saveOutput } = useSaveOutput();

  const preselected = files.find((f) => f.id === fileId && !!f.uri);
  const [file, setFile] = useState<ScannedFile | null>(preselected ?? null);
  const [pickerVisible, setPickerVisible] = useState(!preselected);

  const [step, setStep] = useState<Step>('create');
  const [mode, setMode] = useState<SignMode>('draw');

  // Draw state: finished strokes + the stroke being drawn
  const [strokes, setStrokes] = useState<string[]>([]);
  const [activeStroke, setActiveStroke] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: windowWidth - 48, height: 220 });

  const [typedName, setTypedName] = useState('');
  const [importedUri, setImportedUri] = useState<string | null>(null);

  // Place state
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loadingPages, setLoadingPages] = useState(false);
  const [sigPos, setSigPos] = useState({ x: 0.3, y: 0.6 }); // top-left, page-relative
  const [sigSize, setSigSize] = useState(SIZE_OPTIONS[1]);
  const [working, setWorking] = useState(false);
  const [output, setOutput] = useState<ToolOutput | null>(null);

  const fileUri = file?.uri;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!fileUri || step !== 'place') return;
      setLoadingPages(true);
      const result = await renderAllPages(fileUri, 60);
      if (!cancelled) {
        setPages(result);
        setLoadingPages(false);
        if (result.length === 0) {
          Alert.alert('Could Not Read PDF', 'This file may be damaged or password protected.');
          setStep('create');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fileUri, step]);

  // ── Drawing pad ──
  const drawResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setActiveStroke(`M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`);
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setActiveStroke((prev) => `${prev} L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`);
        },
        onPanResponderRelease: () => {
          setActiveStroke((prev) => {
            if (prev) setStrokes((s) => [...s, prev]);
            return '';
          });
        },
      }),
    []
  );

  const pickImage = async () => {
    const ImagePicker = require('expo-image-picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImportedUri(result.assets[0].uri);
    }
  };

  const hasSignature =
    (mode === 'draw' && strokes.length > 0) ||
    (mode === 'type' && typedName.trim().length > 0) ||
    (mode === 'image' && !!importedUri);

  const buildSignatureInput = (): SignatureInput => {
    if (mode === 'draw') {
      return {
        kind: 'draw',
        pathData: strokes.join(' '),
        pathViewBox: { ...canvasSize },
      };
    }
    if (mode === 'type') {
      return { kind: 'type', text: typedName.trim() };
    }
    return { kind: 'image', imageUri: importedUri ?? undefined };
  };

  // ── Placement ──
  const page = pages[pageIndex] ?? null;
  const canvasWidth = windowWidth - 48;
  const pageAspect = page ? page.height / page.width : 1.414;
  const pageHeight = Math.min(canvasWidth * pageAspect, windowHeight * 0.55);
  const pageWidth = pageHeight / pageAspect;

  const sigAspect =
    mode === 'draw'
      ? canvasSize.height / canvasSize.width
      : mode === 'type'
        ? 0.25
        : 0.4;
  const sigW = sigSize.w * pageWidth;
  const sigH = sigW * sigAspect;

  const dragStart = useRef({ x: 0.3, y: 0.6 });
  const dragResponder = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs -- refs are only touched inside gesture callbacks, not during render
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStart.current = { ...sigPosRef.current };
        },
        onPanResponderMove: (_, gesture) => {
          const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
          setSigPos({
            x: clamp(dragStart.current.x + gesture.dx / pageWidthRef.current, 0, 1 - sigWRef.current / pageWidthRef.current),
            y: clamp(dragStart.current.y + gesture.dy / pageHeightRef.current, 0, 1 - sigHRef.current / pageHeightRef.current),
          });
        },
      }),
    []
  );

  // Refs so the long-lived responder reads fresh values
  const sigPosRef = useRef(sigPos);
  const pageWidthRef = useRef(pageWidth);
  const pageHeightRef = useRef(pageHeight);
  const sigWRef = useRef(sigW);
  const sigHRef = useRef(sigH);
  useEffect(() => {
    sigPosRef.current = sigPos;
    pageWidthRef.current = pageWidth;
    pageHeightRef.current = pageHeight;
    sigWRef.current = sigW;
    sigHRef.current = sigH;
  });

  const handleSave = async () => {
    if (!file?.uri || !hasSignature) return;
    setWorking(true);
    try {
      const title = buildOutputTitle('Signed');
      const result = await signPdf(
        file.uri,
        pageIndex,
        buildSignatureInput(),
        { x: sigPos.x, y: sigPos.y, w: sigW / pageWidth, h: sigH / pageHeight },
        title
      );
      const saved = await saveOutput({ ...result, title });
      setOutput(saved);
    } catch (err) {
      console.error('Sign failed:', err);
      Alert.alert('Signing Failed', 'This PDF could not be processed. It may be damaged or password protected.');
    } finally {
      setWorking(false);
    }
  };

  const renderSignaturePreview = (width: number, height: number) => {
    if (mode === 'draw') {
      const scale = width / canvasSize.width;
      return (
        <Svg width={width} height={height} viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}>
          {strokes.map((d, i) => (
            <Path key={i} d={d} stroke="#0D1440" strokeWidth={2 / scale > 4 ? 4 : 2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </Svg>
      );
    }
    if (mode === 'type') {
      return (
        <Text style={{ fontSize: height * 0.55, fontStyle: 'italic', fontWeight: '500', color: '#0D1440' }} numberOfLines={1} adjustsFontSizeToFit>
          {typedName}
        </Text>
      );
    }
    return importedUri ? (
      <Image source={{ uri: importedUri }} style={{ width, height }} resizeMode="contain" />
    ) : null;
  };

  const modeTab = (key: SignMode, label: string) => (
    <Pressable key={key} onPress={() => setMode(key)} style={{ flex: 1, alignItems: 'center', paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: mode === key ? theme.primary : 'transparent' }}>
      <Text style={{ color: mode === key ? '#FFFFFF' : 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D12' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D12" />
      <View style={{ height: insets.top, backgroundColor: '#0D0D12' }} />

      {/* Header */}
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <Pressable
          onPress={() => (step === 'place' ? setStep('create') : router.back())}
          hitSlop={8}
          style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'transparent' })}
        >
          <Image source={Images.icons.back} style={{ width: 22, height: 22, tintColor: '#FFFFFF' }} resizeMode="contain" />
        </Pressable>
        <Text style={{ flex: 1, color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginLeft: 4 }}>Add Digital Signature</Text>
      </View>

      {step === 'create' ? (
        <>
          {/* Signature creation */}
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8 }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
              Draw your signature or add from the library
            </Text>

            {/* Mode tabs */}
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              {modeTab('draw', 'Draw')}
              {modeTab('type', 'Type')}
              {modeTab('image', 'Import')}
            </View>

            {mode === 'draw' && (
              <>
                <View
                  {...drawResponder.panHandlers}
                  onLayout={(e) => {
                    setCanvasSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
                  }}
                  style={{ height: 220, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}
                >
                  <Svg width="100%" height="100%">
                    {[...strokes, activeStroke].filter(Boolean).map((d, i) => (
                      <Path key={i} d={d} stroke="#FFFFFF" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    ))}
                  </Svg>
                  {strokes.length === 0 && !activeStroke && (
                    <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 24, fontStyle: 'italic' }}>Sign here</Text>
                    </View>
                  )}
                </View>
                <Pressable onPress={() => { setStrokes([]); setActiveStroke(''); }} style={{ alignSelf: 'center', marginTop: 12, padding: 8 }} hitSlop={8}>
                  <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '600' }}>Clear</Text>
                </Pressable>
              </>
            )}

            {mode === 'type' && (
              <View style={{ height: 220, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
                <TextInput
                  value={typedName}
                  onChangeText={setTypedName}
                  placeholder="Type your name"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  style={{ color: '#FFFFFF', fontSize: 34, fontStyle: 'italic', textAlign: 'center', width: '100%' }}
                />
              </View>
            )}

            {mode === 'image' && (
              <Pressable
                onPress={pickImage}
                style={({ pressed }) => ({ height: 220, borderRadius: 16, backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' })}
              >
                {importedUri ? (
                  <Image source={{ uri: importedUri }} style={{ width: '80%', height: '80%' }} resizeMode="contain" />
                ) : (
                  <>
                    <SymbolView name={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }} size={32} tintColor="rgba(255,255,255,0.4)" />
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8 }}>Choose a signature image</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingBottom: insets.bottom + 16 }}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => ({ flex: 1, height: 48, borderRadius: 999, backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' })}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => (file ? setStep('place') : setPickerVisible(true))}
              disabled={!hasSignature}
              style={({ pressed }) => ({ flex: 1, height: 48, borderRadius: 999, backgroundColor: pressed ? theme.primary + 'CC' : theme.primary, alignItems: 'center', justifyContent: 'center', opacity: !hasSignature ? 0.4 : 1 })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Continue</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          {/* Placement */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {loadingPages || !page ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : (
              <View style={{ width: pageWidth, height: pageHeight, backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
                <Image source={{ uri: page.uri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                {/* Draggable signature */}
                <View
                  {...dragResponder.panHandlers}
                  style={{
                    position: 'absolute',
                    left: sigPos.x * pageWidth,
                    top: sigPos.y * pageHeight,
                    width: sigW,
                    height: sigH,
                    borderWidth: 1.5,
                    borderColor: theme.primary,
                    borderStyle: 'dashed',
                    borderRadius: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(61,90,254,0.06)',
                  }}
                >
                  {renderSignaturePreview(sigW - 8, sigH - 8)}
                </View>
              </View>
            )}
          </View>

          {/* Placement controls */}
          <View style={{ backgroundColor: '#1C1C24', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 16, paddingBottom: insets.bottom + 16, paddingHorizontal: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              {/* Page nav */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pressable
                  onPress={() => setPageIndex((i) => Math.max(0, i - 1))}
                  disabled={pageIndex === 0}
                  hitSlop={8}
                  style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', opacity: pageIndex === 0 ? 0.35 : 1 }}
                >
                  <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} size={16} tintColor="#FFFFFF" />
                </Pressable>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' }}>
                  Page {pageIndex + 1} of {pages.length}
                </Text>
                <Pressable
                  onPress={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
                  disabled={pageIndex >= pages.length - 1}
                  hitSlop={8}
                  style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', opacity: pageIndex >= pages.length - 1 ? 0.35 : 1 }}
                >
                  <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={16} tintColor="#FFFFFF" />
                </Pressable>
              </View>

              {/* Size chips */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {SIZE_OPTIONS.map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={() => setSigSize(option)}
                    style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: sigSize.key === option.key ? theme.primary : 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>{option.key}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable onPress={() => setStep('create')} style={({ pressed }) => ({ flex: 1, height: 48, borderRadius: 999, backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' })}>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Back</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={working || !page}
                style={({ pressed }) => ({ flex: 1, height: 48, borderRadius: 999, backgroundColor: pressed ? theme.primary + 'CC' : theme.primary, alignItems: 'center', justifyContent: 'center', opacity: !page ? 0.4 : 1 })}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}

      <SourcePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(picked) => setFile(picked[0] ?? null)}
      />
      <ToolProgress visible={working} label="Signing PDF..." />
      <ToolSuccess visible={!!output} output={output} onDone={() => { setOutput(null); router.back(); }} />
    </View>
  );
}
