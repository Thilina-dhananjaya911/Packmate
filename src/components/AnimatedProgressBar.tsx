import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '../context/ThemeContext';

interface AnimatedProgressBarProps {
  percentage: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  percentage,
  height = 8,
  trackColor,
  fillColor,
}) => {
  const { theme } = useAppTheme();
  const clamped = Math.min(100, Math.max(0, percentage));
  const progress = useSharedValue(clamped);

  useEffect(() => {
    progress.value = withTiming(clamped, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, progress]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const resolvedFill =
    fillColor ??
    (clamped >= 100 ? theme.colors.accentMint : theme.colors.secondaryBlue);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor ?? theme.colors.surfaceSubtle,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: resolvedFill,
          },
          animatedFillStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    minWidth: 0,
  },
});
