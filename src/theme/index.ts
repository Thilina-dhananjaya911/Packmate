import { Platform } from 'react-native';
import { ThemeMode } from '../types';

export interface ColorPalette {
  primaryNavy: string;
  secondaryBlue: string;
  accentMint: string;
  accentLime: string;
  limeSoft: string;
  limeText: string;
  accentViolet: string;
  violetSoft: string;
  background: string;
  card: string;
  cardElevated: string;
  surfaceSubtle: string;
  glassSurface: string;
  glassBorder: string;
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  border: string;
  borderFocus: string;
  white: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  success: string;
  successSoft: string;
  infoSoft: string;
  navySoft: string;
  overlay: string;
  heroGradient: [string, string, string];
  accentGradient: [string, string];
  mintGradient: [string, string];
  limeGradient: [string, string];
  hologramGradient: [string, string, string];
}

export const LIGHT_COLORS: ColorPalette = {
  primaryNavy: '#160E30', // Deep luxury violet-navy
  secondaryBlue: '#7C3AED', // Vivid royal violet
  accentMint: '#059669', // Crisp emerald
  accentLime: '#84CC16', // High-contrast volt lime for light backgrounds
  limeSoft: 'rgba(132, 204, 22, 0.14)',
  limeText: '#141E03',
  accentViolet: '#7C3AED',
  violetSoft: 'rgba(124, 58, 237, 0.10)',
  background: '#F6F4FF', // Light lavender-tinted background
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  surfaceSubtle: '#EDE8FB',
  glassSurface: 'rgba(255, 255, 255, 0.88)',
  glassBorder: 'rgba(124, 58, 237, 0.14)',
  primaryText: '#140C2E', // High contrast deep violet-slate
  secondaryText: '#625880', // Midtone slate violet
  mutedText: '#988FB6',
  border: '#E4DCFA',
  borderFocus: '#7C3AED',
  white: '#FFFFFF',
  danger: '#EF4444',
  dangerSoft: 'rgba(239, 68, 68, 0.08)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.10)',
  success: '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.10)',
  infoSoft: 'rgba(124, 58, 237, 0.08)',
  navySoft: 'rgba(22, 14, 48, 0.06)',
  overlay: 'rgba(14, 8, 30, 0.65)',
  heroGradient: ['#1A103D', '#2B1663', '#492296'],
  accentGradient: ['#7C3AED', '#6D28D9'],
  mintGradient: ['#10B981', '#059669'],
  limeGradient: ['#84CC16', '#65A30D'],
  hologramGradient: ['#A855F7', '#6366F1', '#38BDF8'],
};

export const DARK_COLORS: ColorPalette = {
  primaryNavy: '#130C28', // Deep twilight violet
  secondaryBlue: '#8B5CF6', // Electric violet
  accentMint: '#10B981', // Crisp mint
  accentLime: '#D4FF00', // Signature electric lime / neon volt from reference
  limeSoft: 'rgba(212, 255, 0, 0.16)',
  limeText: '#0A0618', // High contrast text on lime
  accentViolet: '#A855F7',
  violetSoft: 'rgba(168, 85, 247, 0.18)',
  background: '#0B0718', // Cosmic twilight background
  card: '#160F2E', // Frosted deep violet card
  cardElevated: '#1F153E', // Elevated interactive surface
  surfaceSubtle: '#1C1338',
  glassSurface: 'rgba(28, 19, 54, 0.76)',
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  primaryText: '#FFFFFF',
  secondaryText: '#9E97B8', // Soft lavender slate
  mutedText: '#6D648B',
  border: '#271B48',
  borderFocus: '#D4FF00',
  white: '#FFFFFF',
  danger: '#FF5C5C',
  dangerSoft: 'rgba(255, 92, 92, 0.16)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.16)',
  success: '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.16)',
  infoSoft: 'rgba(139, 92, 246, 0.18)',
  navySoft: 'rgba(22, 14, 48, 0.50)',
  overlay: 'rgba(8, 5, 18, 0.84)',
  heroGradient: ['#170F35', '#261452', '#3F1C7E'],
  accentGradient: ['#8B5CF6', '#6D28D9'],
  mintGradient: ['#10B981', '#059669'],
  limeGradient: ['#D4FF00', '#B4E600'],
  hologramGradient: ['#C084FC', '#6366F1', '#06B6D4'],
};

export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 44,
} as const;

export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  full: 9999,
} as const;

export const TYPOGRAPHY = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  hero: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
  },
  h1: {
    fontSize: 25,
    lineHeight: 33,
    fontWeight: '800' as const,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500' as const,
  },
  overline: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700' as const,
    letterSpacing: 0.9,
  },
} as const;

export const SHADOWS = {
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
  blueGlow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  mintGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 6,
  },
  limeGlow: {
    shadowColor: '#D4FF00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 16,
    elevation: 6,
  },
  violetGlow: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 7,
  },
} as const;

export interface AppTheme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorPalette;
  spacing: typeof SPACING;
  radius: typeof RADIUS;
  typography: typeof TYPOGRAPHY;
  shadows: typeof SHADOWS;
}

export function getAppTheme(mode: ThemeMode): AppTheme {
  return {
    mode,
    isDark: mode === 'dark',
    colors: mode === 'dark' ? DARK_COLORS : LIGHT_COLORS,
    spacing: SPACING,
    radius: RADIUS,
    typography: TYPOGRAPHY,
    shadows: SHADOWS,
  };
}
