import { Image, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Images } from '@/constants/images';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import AboutMenuRow from '@/features/about/components/about-menu-row';
import { ABOUT_MENU_ITEMS, APP_VERSION } from '@/features/about/constants/about-content';
import { useAboutActions } from '@/features/about/hooks/use-about-actions';

export default function AboutScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { openUrl } = useAboutActions();

  return (
    <ThemedView className="flex-1">
      <View className="flex-row items-center px-lg py-sm" style={{ paddingTop: insets.top + Spacing.two }}>
        <Pressable
          onPress={() => router.back()}
          className="w-11 h-11 -ml-2 items-center justify-center rounded-full active:bg-border/20"
          hitSlop={8}
        >
          <Image
            source={Images.icons.back}
            className="w-6 h-6"
            style={{ tintColor: theme.text }}
            resizeMode="contain"
          />
        </Pressable>
        <ThemedText className="font-inter-bold text-h3 ml-sm">About ProScan</ThemedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.five }}
      >
        <View className="items-center px-lg pt-lg pb-xl">
          <Image source={Images.logo} className="w-24 h-24 mb-md" resizeMode="contain" />
          <ThemedText className="font-inter-bold text-h3">ProScan v{APP_VERSION}</ThemedText>
        </View>

        <View className="h-[1px] bg-[#E5E7EB] dark:bg-[#26262E] opacity-60" />

        {ABOUT_MENU_ITEMS.map((item, index) => (
          <AboutMenuRow
            key={item.id}
            label={item.label}
            onPress={() => openUrl(item.url)}
            showDivider={index < ABOUT_MENU_ITEMS.length - 1}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}
