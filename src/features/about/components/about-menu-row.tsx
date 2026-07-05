import { Image, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Images } from '@/constants/images';
import { useTheme } from '@/hooks/use-theme';

type AboutMenuRowProps = {
  label: string;
  onPress: () => void;
  showDivider?: boolean;
};

export default function AboutMenuRow({ label, onPress, showDivider = true }: AboutMenuRowProps) {
  const theme = useTheme();

  return (
    <View>
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between px-lg py-4 active:bg-border/20"
        hitSlop={4}
      >
        <ThemedText className="font-inter-regular text-body-large">{label}</ThemedText>
        <Image
          source={Images.icons.arrowRight}
          className="w-5 h-5"
          style={{ tintColor: theme.textSecondary }}
          resizeMode="contain"
        />
      </Pressable>

      {showDivider ? <View className="h-[1px] mx-lg bg-[#E5E7EB] dark:bg-[#26262E] opacity-60" /> : null}
    </View>
  );
}
