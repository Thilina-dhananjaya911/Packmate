import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { RADIUS, useAppTheme } from '../context/ThemeContext';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'lime'
  | 'mint'
  | 'outline'
  | 'danger'
  | 'glass';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  pill?: boolean;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  rightIcon,
  loading = false,
  disabled = false,
  compact = false,
  pill = true,
  style,
}) => {
  const { theme } = useAppTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getPalette = () => {
    switch (variant) {
      case 'lime':
        return {
          bg: theme.colors.accentLime,
          text: theme.colors.limeText,
          border: 'transparent',
          shadow: theme.shadows.limeGlow,
        };
      case 'secondary':
        return {
          bg: theme.colors.secondaryBlue,
          text: '#FFFFFF',
          border: 'transparent',
          shadow: theme.shadows.blueGlow,
        };
      case 'mint':
        return {
          bg: theme.colors.accentMint,
          text: '#FFFFFF',
          border: 'transparent',
          shadow: theme.shadows.mintGlow,
        };
      case 'glass':
        return {
          bg: theme.colors.glassSurface,
          text: theme.colors.primaryText,
          border: theme.colors.glassBorder,
          shadow: theme.shadows.sm,
        };
      case 'outline':
        return {
          bg: theme.colors.card,
          text: theme.colors.primaryText,
          border: theme.colors.border,
          shadow: theme.shadows.xs,
        };
      case 'danger':
        return {
          bg: theme.colors.dangerSoft,
          text: theme.colors.danger,
          border: 'transparent',
          shadow: theme.shadows.xs,
        };
      case 'primary':
      default:
        return {
          bg: theme.colors.secondaryBlue,
          text: '#FFFFFF',
          border: 'transparent',
          shadow: theme.shadows.blueGlow,
        };
    }
  };

  const palette = getPalette();

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 350 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 350 });
      }}
      style={[
        styles.base,
        compact ? styles.compact : styles.regular,
        pill ? styles.pill : styles.rounded,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: palette.border !== 'transparent' ? 1 : 0,
        },
        palette.shadow,
        disabled && styles.disabled,
        Platform.OS === 'web' && ({ cursor: disabled ? 'not-allowed' : 'pointer' } as any),
        animStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={palette.text}
          style={styles.spinner}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
          <Text
            style={[
              styles.label,
              compact ? styles.labelCompact : styles.labelRegular,
              { color: palette.text },
            ]}
          >
            {label}
          </Text>
          {rightIcon ? <View style={styles.rightIconSlot}>{rightIcon}</View> : null}
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    borderRadius: 9999,
  },
  rounded: {
    borderRadius: RADIUS.lg,
  },
  regular: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    minHeight: 52,
  },
  compact: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    marginRight: 8,
  },
  rightIconSlot: {
    marginLeft: 8,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelRegular: {
    fontSize: 15,
  },
  labelCompact: {
    fontSize: 13,
  },
  disabled: {
    opacity: 0.5,
  },
  spinner: {
    paddingVertical: 2,
  },
});
