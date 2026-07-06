import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabSwipe } from '@/hooks/use-tab-swipe';
import AnimatedTabWrapper from '@/components/AnimatedTabWrapper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Images } from '@/constants/images';
import { BottomTabInset, ScreenTopPadding, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Import local home components
import ToolGrid from '@/features/home/components/ToolGrid';
import RecentFiles from '@/features/home/components/RecentFiles';
import FloatingActions from '@/features/home/components/FloatingActions';

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const scrollContentStyle = {
    paddingTop: safeAreaInsets.top + ScreenTopPadding,
    paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.six,
  };

  const swipeHandlers = useTabSwipe(null, '/files');

  return (
    <AnimatedTabWrapper index={0}>
      <ThemedView {...swipeHandlers} className="flex-1 relative">
        {/* Scrollable Content */}
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          {/* Brand Header */}
          <View className="flex-row justify-between items-center px-lg py-sm mb-sm">
            <View className="flex-row items-center">
              {/* Logo */}
              <View className="w-9 h-9 rounded-md items-center justify-center mr-sm bg-[#EAEEFF] dark:bg-[#3D5AFE]/20">
                <Image
                  source={Images.logo}
                  className="w-6 h-6"
                  style={{ tintColor: theme.primary }}
                  resizeMode="contain"
                />
              </View>
              {/* Brand Title */}
              <ThemedText className="font-inter-extrabold text-h3 tracking-tight">
                ProScan
              </ThemedText>
            </View>

            {/* Search Icon Button */}
            <Pressable 
              className="w-11 h-11 items-center justify-center rounded-full active:bg-border/20"
              hitSlop={8}
              onPress={() => router.push('/search')}
            >
              <Image
                source={Images.icons.search}
                className="w-6 h-6"
                style={{ tintColor: theme.text }}
                resizeMode="contain"
              />
            </Pressable>
          </View>

          {/* 8-Tool Grid */}
          <ToolGrid />

          {/* Divider */}
          <View className="h-[1px] bg-[#E5E7EB] dark:bg-[#26262E] mx-lg my-sm opacity-60" />

          {/* Recent Files List */}
          <RecentFiles />
        </ScrollView>

        {/* Floating Action Buttons (Camera & Gallery Scan) */}
        <FloatingActions />
      </ThemedView>
    </AnimatedTabWrapper>
  );
}
