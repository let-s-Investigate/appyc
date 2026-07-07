import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

/** Full-width pill CTA used by the tool screens (per design mockups) */
export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: PrimaryButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`w-full h-[52px] rounded-pill items-center justify-center active:opacity-90 ${
        isPrimary ? 'bg-primary' : 'bg-surface border border-border'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isPrimary ? '#FFFFFF' : theme.primary} />
      ) : (
        <Text
          className="font-inter-bold text-body-large"
          style={{ color: isPrimary ? '#FFFFFF' : theme.text }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
