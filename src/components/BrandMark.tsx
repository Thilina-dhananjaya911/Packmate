import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

interface BrandMarkProps {
  size?: number;
  variant?: 'light' | 'navy';
}

/**
 * Custom geometric PACKMATE vector brand emblem:
 * Combines a sleek travel case silhouette, violet handle, and electric lime checkmark.
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
              stopColor={isLightOnDark ? '#2B1663' : '#140D2E'}
            />
            <Stop
              offset="100%"
              stopColor={isLightOnDark ? '#140D2E' : '#2B1663'}
            />
          </LinearGradient>
          <LinearGradient id="pmLimeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#D4FF00" />
            <Stop offset="100%" stopColor="#8B5CF6" />
          </LinearGradient>
          <LinearGradient id="pmOrbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#C084FC" />
            <Stop offset="50%" stopColor="#8B5CF6" />
            <Stop offset="100%" stopColor="#38BDF8" />
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
          stroke={isLightOnDark ? 'rgba(212, 255, 0, 0.40)' : '#8B5CF6'}
          strokeWidth="2"
        />

        {/* Subtle Geometric Orbit Ring */}
        <Circle
          cx="76"
          cy="24"
          r="10"
          fill="rgba(212, 255, 0, 0.20)"
        />
        <Circle
          cx="22"
          cy="78"
          r="12"
          fill="rgba(139, 92, 246, 0.24)"
        />

        {/* Suitcase Handle */}
        <Path
          d="M39 31 V25 C39 21.5 41.8 19 45.2 19 H54.8 C58.2 19 61 21.5 61 25 V31"
          stroke="#D4FF00"
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

        {/* Central Lime/Violet Smart Check Emblem */}
        <Circle cx="50" cy="54" r="14" fill="url(#pmLimeGrad)" />
        <Path
          d="M43.5 54.2 L48 58.7 L57 49.5"
          stroke="#0A0618"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
};

export const HologramOrb: React.FC<{ size?: number }> = ({ size = 28 }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Defs>
          <LinearGradient id="holoOrbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E879F9" />
            <Stop offset="40%" stopColor="#818CF8" />
            <Stop offset="100%" stopColor="#38BDF8" />
          </LinearGradient>
        </Defs>
        <Circle cx="16" cy="16" r="14" fill="url(#holoOrbGrad)" />
        <Circle cx="12" cy="11" r="4" fill="rgba(255, 255, 255, 0.45)" />
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
