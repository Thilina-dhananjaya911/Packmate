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
  primaryNavy: '#0F1E36', // Rich, deep executive navy
  secondaryBlue: '#2563EB', // Vibrant, modern royal blue
  accentMint: '#10B981', // Crisp, refreshing mint emerald
  background: '#F8FAFC', // Ultra-clean, modern canvas background
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  surfaceSubtle: '#F1F5F9', // Soft cool neutral surface
  primaryText: '#0F172A', // High contrast slate-navy
  secondaryText: '#64748B', // Balanced midtone slate
  mutedText: '#94A3B8', // Soft neutral placeholder text
  border: '#E2E8F0', // Delicate, crisp border
  borderFocus: '#2563EB', // Royal blue focus ring
  white: '#FFFFFF',
  danger: '#EF4444',
  dangerSoft: 'rgba(239, 68, 68, 0.08)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.10)',
  success: '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.10)',
  infoSoft: 'rgba(37, 99, 235, 0.08)',
  navySoft: 'rgba(15, 30, 54, 0.06)',
  overlay: 'rgba(15, 23, 42, 0.65)',
  heroGradient: ['#0B1528', '#122344', '#1E3A70'],
  accentGradient: ['#2563EB', '#1D4ED8'],
  mintGradient: ['#10B981', '#059669'],
};

export const DARK_COLORS: ColorPalette = {
  primaryNavy: '#0B1528',
  secondaryBlue: '#3B82F6', // Luminous royal blue for dark contrast
  accentMint: '#34D399', // Bright mint for dark backgrounds
  background: '#090E1A', // Deep obsidian-navy canvas
  card: '#111C30', // Refined slate-navy card
  cardElevated: '#172642', // Elevated interactive surface
  surfaceSubtle: '#14223A',
  primaryText: '#F8FAFC',
  secondaryText: '#94A3B8',
  mutedText: '#64748B',
  border: '#1E2F4C',
  borderFocus: '#3B82F6',
  white: '#FFFFFF',
  danger: '#F87171',
  dangerSoft: 'rgba(239, 68, 68, 0.16)',
  warning: '#FBBF24',
  warningSoft: 'rgba(245, 158, 11, 0.16)',
  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.16)',
  infoSoft: 'rgba(59, 130, 246, 0.16)',
  navySoft: 'rgba(59, 130, 246, 0.12)',
  overlay: 'rgba(3, 7, 18, 0.78)',
  heroGradient: ['#080E1C', '#0F1E3A', '#1B3566'],
  accentGradient: ['#3B82F6', '#2563EB'],
  mintGradient: ['#34D399', '#10B981'],
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  blueGlow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  mintGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.26,
    shadowRadius: 14,
    elevation: 6,
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
