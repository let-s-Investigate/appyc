import React from 'react';
import { Image, Pressable, ScrollView, View, Text, useWindowDimensions } from 'react-native';
import { SymbolView } from 'expo-symbols';
import ScreenContainer from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Images } from '@/constants/images';
import { useTheme } from '@/hooks/use-theme';
import { useTabSwipe } from '@/hooks/use-tab-swipe';
import AnimatedTabWrapper from '@/components/AnimatedTabWrapper';

interface PlanItem {
  price: string;
  duration: string;
  headline: string;
  bgColor: string;
  btnTextColor: string;
}

export default function PremiumScreen() {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const swipeHandlers = useTabSwipe('/files', '/account');

  // Subscription Plans
  const PLANS: PlanItem[] = [
    {
      price: '$4.99',
      duration: '/ 1 month',
      headline: 'Go Pemium, and enjoy the benefits',
      bgColor: '#EF5350', // Red background
      btnTextColor: '#EF5350',
    },
    {
      price: '$9.99',
      duration: '/ 3 months',
      headline: 'Go Pemium, and enjoy the benefits',
      bgColor: '#FFA726', // Orange background
      btnTextColor: '#FFA726',
    },
    {
      price: '$39.99',
      duration: '/ 12 months',
      headline: 'Go Pemium, and enjoy the benefits',
      bgColor: '#3D5AFE', // Blue background
      btnTextColor: '#3D5AFE',
    },
  ];

  // Features list
  const FEATURES = [
    'Unlimited Documents',
    'Remove Ads',
    'Remove Watermark',
    'Export to Word, Excel, & PowerPoint',
    'HD Resolution',
    'Recognize Text (OCR)',
    'Collage',
    'Translation',
    '25GB Cloud Storage Space',
  ];

  // Carousel layout math
  const cardWidth = screenWidth - 56; // Left and right margins
  const cardGap = 16;
  const snapToInterval = cardWidth + cardGap;

  return (
    <AnimatedTabWrapper index={2}>
      <ScreenContainer {...swipeHandlers} className="animate-fadeIn">
        {/* Header Bar */}
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
            {/* Title */}
            <ThemedText className="font-inter-extrabold text-h2 tracking-tight">
              Premium
            </ThemedText>
          </View>
        </View>

        {/* Carousel Scroll Container (Centered vertically) */}
        <View className="flex-1 justify-center items-center">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={snapToInterval}
            snapToAlignment="center"
            contentContainerStyle={{
              paddingHorizontal: (screenWidth - cardWidth) / 2,
              alignItems: 'center', // Centers cards vertically inside container
            }}
            className="w-full flex-row"
          >
            {PLANS.map((plan, index) => (
              <View
                key={index}
                style={{
                  width: cardWidth,
                  height: 480, // Fixed card height
                  backgroundColor: plan.bgColor,
                  marginRight: index === PLANS.length - 1 ? 0 : cardGap,
                }}
                className="rounded-3xl p-lg justify-between shadow-lg"
              >
                {/* Header Info */}
                <View>
                  <View className="flex-row items-baseline mb-xs">
                    <Text className="font-inter-extrabold text-[36px] text-white">
                      {plan.price}
                    </Text>
                    <Text className="font-inter-bold text-[15px] text-white/90 ml-xs">
                      {plan.duration}
                    </Text>
                  </View>
                  
                  <Text className="font-inter-medium text-[13px] text-white/90 mb-md">
                    {plan.headline}
                  </Text>

                  {/* Horizontal line divider */}
                  <View className="h-[1px] bg-white/20 mb-md" />

                  {/* Features Checklist */}
                  <View className="gap-sm">
                    {FEATURES.map((feat, featIdx) => (
                      <View key={featIdx} className="flex-row items-center">
                        {/* Check icon inside a circle */}
                        <View className="mr-sm">
                          <SymbolView
                            name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                            size={18}
                            tintColor="#FFFFFF"
                          />
                        </View>
                        <Text className="font-inter-semibold text-[13px] text-white flex-1">
                          {feat}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Action Button */}
                <Pressable
                  style={{ backgroundColor: '#FFFFFF' }}
                  className="w-full h-[52px] rounded-full items-center justify-center mt-lg active:opacity-90"
                >
                  <Text 
                    style={{
                      color: plan.btnTextColor,
                      fontSize: 14,
                      fontWeight: '700',
                    }}
                  >
                    Select Plan
                  </Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScreenContainer>
    </AnimatedTabWrapper>
  );
}
