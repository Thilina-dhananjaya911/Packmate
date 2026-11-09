import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import {
  CheckCircle2,
  Compass,
  FolderSearch,
  History,
  Luggage,
  Sparkles,
} from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';

export type IllustrationVariant =
  | 'plan'
  | 'pack'
  | 'track'
  | 'empty-trips'
  | 'empty-history'
  | 'empty-items'
  | 'empty-search';

interface GeometricIllustrationProps {
  variant: IllustrationVariant;
  size?: number;
}

/**
 * Pure geometric vector artwork for Onboarding & Empty States.
 * Zero photographs, zero remote assets.
 */
export const GeometricIllustration: React.FC<GeometricIllustrationProps> = ({
  variant,
  size = 210,
}) => {
  const { theme } = useAppTheme();

  if (variant === 'plan' || variant === 'pack' || variant === 'track') {
    return (
      <View style={[styles.onboardingBox, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 220 220">
          <Defs>
            <LinearGradient id="orb1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#4C9AFF" stopOpacity="0.22" />
              <Stop offset="100%" stopColor="#36C9A5" stopOpacity="0.08" />
            </LinearGradient>
            <LinearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#172B4D" />
              <Stop offset="100%" stopColor="#264B84" />
            </LinearGradient>
          </Defs>

          <Circle cx="110" cy="110" r="96" fill="url(#orb1)" />
          <Circle
            cx="110"
            cy="110"
            r="74"
            stroke="#4C9AFF"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            fill="none"
          />

          {variant === 'plan' && (
            <>
              {/* Route Card & Flight Arc */}
              <Rect x="38" y="56" width="144" height="108" rx="22" fill="url(#cardGrad)" />
              <Rect x="54" y="74" width="54" height="8" rx="4" fill="#4C9AFF" />
              <Rect x="54" y="90" width="84" height="6" rx="3" fill="rgba(255,255,255,0.45)" />
              <Path
                d="M58 136 Q110 96 162 136"
                stroke="#36C9A5"
                strokeWidth="3"
                strokeDasharray="5 5"
                fill="none"
              />
              <Circle cx="58" cy="136" r="6" fill="#4C9AFF" />
              <Circle cx="162" cy="136" r="7" fill="#36C9A5" />
              <Circle cx="172" cy="54" r="18" fill="#36C9A5" />
              <Path
                d="M166 54 L170 58 L179 49"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </>
          )}

          {variant === 'pack' && (
            <>
              {/* Layered Smart Category Cards */}
              <Rect x="48" y="44" width="124" height="132" rx="22" fill="url(#cardGrad)" />
              <Rect x="64" y="66" width="92" height="22" rx="8" fill="rgba(255,255,255,0.12)" />
              <Circle cx="76" cy="77" r="5" fill="#36C9A5" />
              <Rect x="88" y="74" width="54" height="6" rx="3" fill="#FFFFFF" />

              <Rect x="64" y="98" width="92" height="22" rx="8" fill="rgba(255,255,255,0.12)" />
              <Circle cx="76" cy="109" r="5" fill="#4C9AFF" />
              <Rect x="88" y="106" width="60" height="6" rx="3" fill="#FFFFFF" />

              <Rect x="64" y="130" width="92" height="22" rx="8" fill="rgba(255,255,255,0.12)" />
              <Circle cx="76" cy="141" r="5" fill="#F59E0B" />
              <Rect x="88" y="138" width="44" height="6" rx="3" fill="#FFFFFF" />

              <Circle cx="168" cy="160" r="20" fill="#4C9AFF" />
              <Line x1="168" y1="152" x2="168" y2="168" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
              <Line x1="160" y1="160" x2="176" y2="160" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {variant === 'track' && (
            <>
              {/* Precision Progress Ring Card */}
              <Rect x="44" y="46" width="132" height="128" rx="24" fill="url(#cardGrad)" />
              <Circle
                cx="110"
                cy="104"
                r="36"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="9"
                fill="none"
              />
              <Circle
                cx="110"
                cy="104"
                r="36"
                stroke="#36C9A5"
                strokeWidth="9"
                strokeDasharray="180 226"
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d="M99 104 L107 112 L123 96"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Rect x="74" y="152" width="72" height="7" rx="3.5" fill="#4C9AFF" />
            </>
          )}
        </Svg>
      </View>
    );
  }

  // Compact Empty State Geometric Emblem
  const badgeSize = Math.min(size, 96);
  const renderCenterIcon = () => {
    switch (variant) {
      case 'empty-trips':
        return <Compass size={34} color={theme.colors.secondaryBlue} strokeWidth={2} />;
      case 'empty-history':
        return <History size={34} color={theme.colors.accentMint} strokeWidth={2} />;
      case 'empty-items':
        return <Luggage size={34} color={theme.colors.secondaryBlue} strokeWidth={2} />;
      case 'empty-search':
        return <FolderSearch size={34} color={theme.colors.secondaryText} strokeWidth={2} />;
      default:
        return <Sparkles size={34} color={theme.colors.secondaryBlue} strokeWidth={2} />;
    }
  };

  return (
    <View style={[styles.emptyOuter, { width: badgeSize + 24, height: badgeSize + 24 }]}>
      <View
        style={[
          styles.emptyHalo,
          {
            width: badgeSize + 18,
            height: badgeSize + 18,
            borderRadius: (badgeSize + 18) / 2,
            backgroundColor: theme.colors.infoSoft,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.emptyInner,
            {
              width: badgeSize - 12,
              height: badgeSize - 12,
              borderRadius: 24,
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {renderCenterIcon()}
        </View>
      </View>
      <View
        style={[
          styles.cornerDot,
          { backgroundColor: theme.colors.accentMint, borderColor: theme.colors.card },
        ]}
      >
        <CheckCircle2 size={14} color="#FFFFFF" strokeWidth={2.5} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  onboardingBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyHalo: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyInner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cornerDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
