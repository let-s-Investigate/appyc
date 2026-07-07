import React from 'react';
import { Image, Pressable, Text, View, useColorScheme } from 'react-native';
import { Images } from '@/constants/images';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';

interface ToolItem {
  id: string;
  name: string;
  icon: any;
  lightBg: string;
  darkBg: string;
  tintColor: string;
  route?: string;
}

const TOOLS: ToolItem[] = [
  {
    id: 'scan',
    name: 'Scan Code',
    icon: Images.icons.scanCode,
    lightBg: '#FDEBDD',
    darkBg: 'rgba(255, 176, 32, 0.15)',
    tintColor: '#FFB020', // Warning color
  },
  {
    id: 'watermark',
    name: 'Watermark',
    icon: Images.icons.watermark,
    lightBg: '#FDEBDD',
    darkBg: 'rgba(255, 176, 32, 0.15)',
    tintColor: '#FFB020',
    route: '/pdf/watermark',
  },
  {
    id: 'esign',
    name: 'eSign PDF',
    icon: Images.icons.esign,
    lightBg: '#FDE3E3',
    darkBg: 'rgba(255, 77, 79, 0.15)',
    tintColor: '#FF4D4F', // Error color
    route: '/pdf/sign',
  },
  {
    id: 'split',
    name: 'Split PDF',
    icon: Images.icons.splitPdf,
    lightBg: '#EAEEFF',
    darkBg: 'rgba(61, 90, 254, 0.15)',
    tintColor: '#3D5AFE', // Primary color
    route: '/pdf/split',
  },
  {
    id: 'merge',
    name: 'Merge PDF',
    icon: Images.icons.mergePdf,
    lightBg: '#FDEBDD',
    darkBg: 'rgba(255, 176, 32, 0.15)',
    tintColor: '#FFB020',
    route: '/pdf/merge',
  },
  {
    id: 'protect',
    name: 'Protect PDF',
    icon: Images.icons.protectPdf,
    lightBg: '#DDF3EC',
    darkBg: 'rgba(34, 197, 94, 0.15)',
    tintColor: '#22C55E', // Success color
    route: '/pdf/protect',
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    icon: Images.icons.compressPdf,
    lightBg: '#FDEBDD',
    darkBg: 'rgba(255, 176, 32, 0.15)',
    tintColor: '#FFB020',
    route: '/pdf/compress',
  },
  {
    id: 'all_tools',
    name: 'All Tools',
    icon: Images.icons.allTools,
    lightBg: '#EAEEFF',
    darkBg: 'rgba(61, 90, 254, 0.15)',
    tintColor: '#3D5AFE',
    route: '/tools',
  },
];

export default function ToolGrid() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useTheme();

  return (
    <View className="flex-row flex-wrap justify-between py-md px-lg">
      {TOOLS.map((tool) => (
        <Pressable
          key={tool.id}
          onPress={() => {
            if (tool.route) {
              router.push(tool.route as any);
            }
          }}
          className="w-[23%] items-center mb-md active:opacity-70"
          style={{ minHeight: 90 }}
        >
          <View
            className="w-14 h-14 rounded-pill items-center justify-center"
            style={{
              backgroundColor: isDark ? tool.darkBg : tool.lightBg,
            }}
          >
            <Image
              source={tool.icon}
              className="w-6 h-6"
              style={{ tintColor: tool.tintColor }}
              resizeMode="contain"
            />
          </View>
          <Text 
            className="font-inter-medium text-center mt-xs px-half"
            style={{ color: theme.text, fontSize: 13, lineHeight: 14 }}
            numberOfLines={2}
          >
            {tool.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
