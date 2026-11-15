import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

interface BrandMarkProps {
  size?: number;
  variant?: 'light' | 'navy';
}

/**
 * Custom geometric PACKMATE vector brand emblem:
 * Combines a sleek travel case silhouette, luggage handle, and precision mint checkmark.
 * 100% pure vector SVG — zero bitmap or external assets.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 84,
  variant = 'light',
}) => {
  const isLightOnDark = variant === 'light';

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="pmBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop
              offset="0%"
              stopColor={isLightOnDark ? '#1E3A70' : '#0B1528'}
            />
            <Stop
              offset="100%"
              stopColor={isLightOnDark ? '#0F1E36' : '#1A335F'}
            />
          </LinearGradient>
          <LinearGradient id="pmBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#10B981" />
          </LinearGradient>
        </Defs>

        {/* Outer Squircle Badge */}
        <Rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="26"
          fill="url(#pmBgGrad)"
          stroke={isLightOnDark ? 'rgba(59, 130, 246, 0.45)' : '#2563EB'}
          strokeWidth="2"
        />

        {/* Subtle Geometric Orbit Ring */}
        <Circle
          cx="76"
          cy="24"
          r="10"
          fill="rgba(16, 185, 129, 0.18)"
        />
        <Circle
          cx="22"
          cy="78"
          r="12"
          fill="rgba(37, 99, 235, 0.16)"
        />

        {/* Suitcase Handle */}
        <Path
          d="M39 31 V25 C39 21.5 41.8 19 45.2 19 H54.8 C58.2 19 61 21.5 61 25 V31"
          stroke="#2563EB"
          strokeWidth="4.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Suitcase Body */}
        <Rect
          x="23"
          y="31"
          width="54"
          height="46"
          rx="12"
          fill="#FFFFFF"
        />

        {/* Side Geometric Ribbing */}
        <Rect x="30" y="38" width="3" height="32" rx="1.5" fill="#E2E8F0" />
        <Rect x="67" y="38" width="3" height="32" rx="1.5" fill="#E2E8F0" />

        {/* Central Mint/Blue Smart Check Emblem */}
        <Circle cx="50" cy="54" r="14" fill="url(#pmBlueGrad)" />
        <Path
          d="M43.5 54.2 L48 58.7 L57 49.5"
          stroke="#FFFFFF"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
