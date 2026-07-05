import React from 'react';
import { Image, Pressable, ScrollView, View, Alert, Switch, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'nativewind';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Images } from '@/constants/images';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTabSwipe } from '@/hooks/use-tab-swipe';
import AnimatedTabWrapper from '@/components/AnimatedTabWrapper';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const swipeHandlers = useTabSwipe('/premium', null);

  const toggleDarkMode = () => {
    setColorScheme(isDarkMode ? 'light' : 'dark');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of ProScan?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const menuItems = [
    {
      label: 'Personal Info',
      icon: 'person',
      type: 'chevron',
      onPress: () => {},
    },
    {
      label: 'Preferences',
      icon: 'gear',
      type: 'chevron',
      onPress: () => {},
    },
    {
      label: 'Security',
      icon: 'shield',
      type: 'chevron',
      onPress: () => {},
    },
    {
      label: 'Language',
      icon: 'doc.text',
      type: 'value-chevron',
      value: 'English (US)',
      onPress: () => {},
    },
    {
      label: 'Dark Mode',
      icon: 'eye',
      type: 'switch',
      value: isDarkMode,
      onPress: toggleDarkMode,
    },
  ];

  const helpItems = [
    {
      label: 'Help Center',
      icon: 'doc.plaintext',
      type: 'chevron',
      onPress: () => {},
    },
    {
      label: 'About ProScan',
      icon: 'info.circle',
      type: 'chevron',
      onPress: () => {},
    },
    {
      label: 'Logout',
      icon: 'rectangle.portrait.and.arrow.right',
      type: 'logout',
      onPress: handleLogout,
    },
  ];

  return (
    <AnimatedTabWrapper index={3}>
      <ThemedView {...swipeHandlers} className="flex-1" style={{ paddingTop: insets.top }}>
        {/* Header bar */}
        <View className="flex-row justify-between items-center px-lg py-xs mb-xs">
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
            {/* Page Title */}
            <ThemedText className="font-inter-extrabold text-h2 tracking-tight">
              Account
            </ThemedText>
          </View>

          {/* Options Circle */}
          <Pressable 
            className="w-11 h-11 items-center justify-center rounded-full active:bg-border/20"
            hitSlop={8}
          >
            <SymbolView
              name={{ ios: 'ellipsis.circle', android: 'more_vert', web: 'more_vert' }}
              size={24}
              tintColor={theme.text}
            />
          </Pressable>
        </View>

        {/* Scroll Content */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + BottomTabInset + Spacing.four }}
          showsVerticalScrollIndicator={false}
          className="flex-1 px-lg"
        >
          {/* User Profile Card */}
          <View className="p-md rounded-xl bg-[#F6F7FB] dark:bg-[#16161C] border border-[#E5E7EB] dark:border-[#26262E] mb-md">
            <View className="flex-row items-center">
              {/* Avatar image */}
              <Image
                source={Images.placeholders.avatar}
                className="w-14 h-14 rounded-full border border-border/40 mr-md"
                resizeMode="cover"
              />

              {/* Profile Details */}
              <View className="flex-1 justify-center">
                <View className="flex-row items-center">
                  <ThemedText className="font-inter-bold text-body-large">
                    Andrew Ainsley
                  </ThemedText>
                  
                  {/* Basic Badge */}
                  <View className="bg-primary/10 border border-primary/20 rounded px-[6px] py-[2px] ml-sm">
                    <ThemedText className="text-[10px] font-inter-semibold text-primary">
                      Basic
                    </ThemedText>
                  </View>
                </View>

                {/* Storage info */}
                <ThemedText themeColor="textSecondary" className="font-inter-medium text-body-small mt-xs">
                  465 MB / 1024 MB
                </ThemedText>
              </View>
            </View>

            {/* Storage Progress bar */}
            <View className="h-1.5 w-full bg-border/40 dark:bg-border/20 rounded-full mt-md overflow-hidden">
              <View className="h-full bg-primary rounded-full" style={{ width: '45.4%' }} />
            </View>
          </View>

          {/* Premium banner Upgrade promo card */}
          <View 
            style={{ backgroundColor: '#3D5AFE', borderColor: '#2C3EE0', borderWidth: 1 }}
            className="flex-row items-center p-md rounded-xl mb-lg relative overflow-hidden"
          >
            {/* Background elements */}
            <View className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-white/5" />
            
            {/* Golden Star Circle */}
            <View className="w-11 h-11 rounded-full bg-[#FFB020] items-center justify-center mr-md">
              <SymbolView
                name="star.fill"
                size={18}
                tintColor="#FFFFFF"
              />
            </View>

            {/* Details */}
            <View className="flex-1">
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
                Go to PREMIUM!
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, marginTop: 2 }}>
                Enjoy all the benefits
              </Text>
            </View>

            {/* Upgrade Action */}
            <Pressable 
              style={{ backgroundColor: '#FFFFFF' }}
              className="px-md py-sm rounded-full active:opacity-90"
            >
              <Text style={{ color: '#3D5AFE', fontSize: 13, fontWeight: '700' }}>
                Upgrade
              </Text>
            </Pressable>
          </View>

          {/* Primary Settings list */}
          <View className="mb-md">
            {menuItems.map((item, idx) => (
              <Pressable
                key={idx}
                onPress={item.type !== 'switch' ? item.onPress : undefined}
                className="flex-row items-center py-md border-b border-border/10 active:opacity-75"
              >
                {/* Left Icon */}
                <View className="mr-md w-6 items-center justify-center">
                  <SymbolView
                    name={{ ios: item.icon, android: item.icon === 'eye' ? 'visibility' : item.icon, web: item.icon } as any}
                    size={20}
                    tintColor={theme.text}
                  />
                </View>

                {/* Label */}
                <ThemedText className="font-inter-semibold text-body-large flex-1">
                  {item.label}
                </ThemedText>

                {/* Right side component */}
                {item.type === 'chevron' && (
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                    size={16}
                    tintColor={theme.textSecondary}
                  />
                )}

                {item.type === 'value-chevron' && (
                  <View className="flex-row items-center gap-xs">
                    <ThemedText themeColor="textSecondary" className="font-inter-medium text-body-medium">
                      {item.value}
                    </ThemedText>
                    <SymbolView
                      name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                      size={16}
                      tintColor={theme.textSecondary}
                    />
                  </View>
                )}

                {item.type === 'switch' && (
                  <Switch
                    value={item.value as boolean}
                    onValueChange={item.onPress}
                    trackColor={{ false: '#767577', true: theme.primary }}
                    thumbColor="#f4f3f4"
                    ios_backgroundColor="#3e3e3e"
                  />
                )}
              </Pressable>
            ))}
          </View>

          {/* Help & Logout section */}
          <View>
            {helpItems.map((item, idx) => (
              <Pressable
                key={idx}
                onPress={item.onPress}
                className="flex-row items-center py-md border-b border-border/10 active:opacity-75"
              >
                {/* Left Icon */}
                <View className="mr-md w-6 items-center justify-center">
                  <SymbolView
                    name={{ ios: item.icon, android: item.icon === 'rectangle.portrait.and.arrow.right' ? 'logout' : 'help', web: item.icon } as any}
                    size={20}
                    tintColor={item.type === 'logout' ? theme.error : theme.text}
                  />
                </View>

                {/* Label */}
                <ThemedText 
                  className="font-inter-semibold text-body-large flex-1"
                  style={{ color: item.type === 'logout' ? theme.error : theme.text }}
                >
                  {item.label}
                </ThemedText>

                {/* Right side Chevron (only for non-logout) */}
                {item.type !== 'logout' && (
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                    size={16}
                    tintColor={theme.textSecondary}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </ThemedView>
    </AnimatedTabWrapper>
  );
}
