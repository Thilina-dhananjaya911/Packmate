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
import { useAppTheme } from '../context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'mint' | 'outline' | 'danger';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
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
  style,
}) => {
  const { theme } = useAppTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getPalette = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: theme.colors.secondaryBlue,
          text: '#FFFFFF',
          border: 'transparent',
        };
      case 'mint':
        return {
          bg: theme.colors.accentMint,
          text: '#FFFFFF',
          border: 'transparent',
        };
      case 'outline':
        return {
          bg: theme.colors.card,
          text: theme.colors.primaryText,
          border: theme.colors.border,
        };
      case 'danger':
        return {
          bg: theme.colors.dangerSoft,
          text: theme.colors.danger,
          border: 'transparent',
        };
      case 'primary':
      default:
        return {
          bg: theme.colors.primaryNavy,
          text: '#FFFFFF',
          border: 'transparent',
        };
    }
  };

  const palette = getPalette();

  const getShadow = () => {
    switch (variant) {
      case 'secondary':
        return theme.shadows.blueGlow;
      case 'mint':
        return theme.shadows.mintGlow;
      case 'outline':
      case 'danger':
        return theme.shadows.xs;
      case 'primary':
      default:
        return theme.shadows.sm;
    }
  };

  const webPointerStyle =
    Platform.OS === 'web' && !disabled && !loading
      ? ({ cursor: 'pointer' } as unknown as ViewStyle)
      : null;

  return (
    <AnimatedPressable
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.975, { damping: 18, stiffness: 340 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 280 });
      }}
      style={[
        styles.button,
        compact ? styles.buttonCompact : styles.buttonRegular,
        {
          backgroundColor: palette.bg,
          borderColor:
            variant === 'outline'
              ? palette.border
              : 'rgba(255, 255, 255, 0.12)',
          borderWidth: 1,
          opacity: disabled ? 0.55 : 1,
        },
        getShadow(),
        webPointerStyle,
        style,
        animStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.text} />
      ) : (
        <View style={styles.row}>
          {icon ? <View style={styles.leftIcon}>{icon}</View> : null}
          <Text
            style={[
              compact ? styles.labelCompact : styles.label,
              { color: palette.text },
            ]}
          >
            {label}
          </Text>
          {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRegular: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  buttonCompact: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  labelCompact: {
    fontSize: 13,
    fontWeight: '700',
  },
});
