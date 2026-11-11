import { Platform } from 'react-native';
import { ThemeMode } from '../types';

export interface ColorPalette {
  primaryNavy: string;
  secondaryBlue: string;
  accentMint: string;
  background: string;
  card: string;
  cardElevated: string;
  surfaceSubtle: string;
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
}

export const LIGHT_COLORS: ColorPalette = {
  primaryNavy: '#172B4D',
  secondaryBlue: '#4C9AFF',
  accentMint: '#36C9A5',
  background: '#F7F9FC',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  surfaceSubtle: '#EFF4FA',
  primaryText: '#172B4D',
  secondaryText: '#7A869A',
  mutedText: '#97A0AF',
  border: '#E8EDF3',
  borderFocus: '#4C9AFF',
  white: '#FFFFFF',
  danger: '#E5484D',
  dangerSoft: '#FEECEE',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  success: '#36C9A5',
  successSoft: '#E6F9F4',
  infoSoft: '#EBF4FF',
  navySoft: '#E9EEF6',
  overlay: 'rgba(23, 43, 77, 0.52)',
  heroGradient: ['#172B4D', '#1E3A68', '#264B84'],
  accentGradient: ['#4C9AFF', '#2575FC'],
  mintGradient: ['#36C9A5', '#1FA885'],
};

export const DARK_COLORS: ColorPalette = {
  primaryNavy: '#172B4D',
  secondaryBlue: '#4C9AFF',
  accentMint: '#36C9A5',
  background: '#0B1528',
  card: '#13223B',
  cardElevated: '#1A2D4D',
  surfaceSubtle: '#182A47',
  primaryText: '#F1F5F9',
  secondaryText: '#94A3B8',
  mutedText: '#64748B',
  border: '#223659',
  borderFocus: '#4C9AFF',
  white: '#FFFFFF',
  danger: '#F87171',
  dangerSoft: 'rgba(239, 68, 68, 0.16)',
  warning: '#FBBF24',
  warningSoft: 'rgba(245, 158, 11, 0.16)',
  success: '#36C9A5',
  successSoft: 'rgba(54, 201, 165, 0.16)',
  infoSoft: 'rgba(76, 154, 255, 0.16)',
  navySoft: 'rgba(76, 154, 255, 0.12)',
  overlay: 'rgba(5, 10, 22, 0.72)',
  heroGradient: ['#132544', '#1B3560', '#23457A'],
  accentGradient: ['#4C9AFF', '#2575FC'],
  mintGradient: ['#36C9A5', '#1FA885'],
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
  xxl: 30,
  full: 999,
} as const;

export const TYPOGRAPHY = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  hero: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
  },
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 17,
    lineHeight: 23,
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
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sm: {
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  md: {
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 6,
  },
  lg: {
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 26,
    elevation: 10,
  },
  blueGlow: {
    shadowColor: '#4C9AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 7,
  },
  mintGlow: {
    shadowColor: '#36C9A5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
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
