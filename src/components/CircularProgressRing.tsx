import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAppTheme } from '../context/ThemeContext';

interface CircularProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  subtitle?: string;
  sublabel?: string;
  lightText?: boolean;
  textColor?: string;
  strokeColor?: string;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  percentage,
  size = 128,
  strokeWidth = 11,
  subtitle,
  sublabel,
  lightText = false,
  textColor,
  strokeColor,
}) => {
  const { theme } = useAppTheme();
  const clamped = Math.min(100, Math.max(0, Math.round(percentage)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const displaySubtitle = subtitle ?? sublabel;
  const activeStroke =
    strokeColor ??
    (clamped >= 100 ? theme.colors.accentLime : theme.colors.secondaryBlue);
  const trackStroke = lightText
    ? 'rgba(255, 255, 255, 0.16)'
    : theme.colors.surfaceSubtle;

  const resolvedTextColor =
    textColor ?? (lightText ? '#FFFFFF' : theme.colors.primaryText);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackStroke}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeStroke}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.centerOverlay}>
        <Text
          style={[
            styles.percentText,
            {
              color: resolvedTextColor,
              fontSize: size >= 110 ? 24 : 16,
            },
          ]}
        >
          {clamped}%
        </Text>
        {displaySubtitle ? (
          <Text
            style={[
              styles.subText,
              {
                color: textColor ?? (lightText
                  ? 'rgba(255,255,255,0.76)'
                  : theme.colors.secondaryText),
              },
            ]}
          >
            {displaySubtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
