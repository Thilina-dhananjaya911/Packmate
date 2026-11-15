import React from 'react';
import { Platform, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface AnimatedPressableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  scaleDown?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedPressableCard: React.FC<AnimatedPressableCardProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  scaleDown = 0.982,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const webPointerStyle =
    Platform.OS === 'web' && onPress && !disabled
      ? ({ cursor: 'pointer' } as unknown as ViewStyle)
      : null;

  return (
    <AnimatedPressable
      disabled={disabled || !onPress}
      onPress={onPress}
      onPressIn={() => {
        if (!disabled && onPress) {
          scale.value = withSpring(scaleDown, { damping: 18, stiffness: 320 });
        }
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 280 });
      }}
      style={[webPointerStyle, style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};
