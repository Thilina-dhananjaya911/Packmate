import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TRIP_TYPES } from '../constants';
import { useAppTheme } from '../context/ThemeContext';
import { TripStatus, TripType } from '../types';
import { DynamicIcon } from './DynamicIcon';

export const StatusBadge: React.FC<{ status: TripStatus }> = ({ status }) => {
  const { theme } = useAppTheme();

  const getStyle = () => {
    switch (status) {
      case 'Ongoing':
        return {
          bg: theme.colors.limeSoft,
          fg: theme.colors.accentLime,
          dot: theme.colors.accentLime,
          border: 'rgba(212, 255, 0, 0.35)',
        };
      case 'Completed':
        return {
          bg: theme.colors.infoSoft,
          fg: theme.colors.secondaryBlue,
          dot: theme.colors.secondaryBlue,
          border: 'rgba(139, 92, 246, 0.30)',
        };
      case 'Upcoming':
      default:
        return {
          bg: theme.colors.warningSoft,
          fg: '#FBBF24',
          dot: '#F59E0B',
          border: 'rgba(245, 158, 11, 0.30)',
        };
    }
  };

  const s = getStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: s.bg,
          borderColor: s.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: s.dot }]} />
      <Text style={[styles.badgeText, { color: s.fg }]}>{status}</Text>
    </View>
  );
};

export const CategoryBadge: React.FC<{
  name: string;
  color: string;
  iconName?: string;
  compact?: boolean;
}> = ({ name, color, iconName, compact = false }) => {
  return (
    <View
      style={[
        styles.catBadge,
        compact && styles.catBadgeCompact,
        {
          backgroundColor: `${color}18`,
          borderColor: `${color}35`,
          borderWidth: 1,
        },
      ]}
    >
      {iconName ? (
        <View style={{ marginRight: 5 }}>
          <DynamicIcon name={iconName} size={compact ? 11 : 13} color={color} />
        </View>
      ) : null}
      <Text
        style={[
          styles.catText,
          compact && { fontSize: 11 },
          { color },
        ]}
      >
        {name}
      </Text>
    </View>
  );
};

export const TripTypeBadge: React.FC<{ tripType: TripType }> = ({ tripType }) => {
  const meta = TRIP_TYPES.find((t) => t.value === tripType);
  const accent = meta?.accentColor ?? '#8B5CF6';
  const icon = meta?.icon ?? 'Compass';

  return (
    <View
      style={[
        styles.catBadge,
        {
          backgroundColor: `${accent}18`,
          borderColor: `${accent}35`,
          borderWidth: 1,
        },
      ]}
    >
      <View style={{ marginRight: 5 }}>
        <DynamicIcon name={icon} size={13} color={accent} />
      </View>
      <Text style={[styles.catText, { color: accent }]}>{tripType}</Text>
    </View>
  );
};

export const GlassPillBadge: React.FC<{
  label: string;
  icon?: string;
  variant?: 'frosted' | 'lime' | 'violet';
}> = ({ label, icon, variant = 'frosted' }) => {
  const { theme } = useAppTheme();

  const getColors = () => {
    switch (variant) {
      case 'lime':
        return {
          bg: theme.colors.accentLime,
          text: theme.colors.limeText,
          border: 'transparent',
        };
      case 'violet':
        return {
          bg: theme.colors.infoSoft,
          text: theme.colors.secondaryBlue,
          border: 'rgba(139, 92, 246, 0.35)',
        };
      case 'frosted':
      default:
        return {
          bg: 'rgba(15, 11, 30, 0.65)',
          text: '#FFFFFF',
          border: 'rgba(255, 255, 255, 0.16)',
        };
    }
  };

  const c = getColors();

  return (
    <View
      style={[
        styles.glassPill,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          borderWidth: c.border !== 'transparent' ? 1 : 0,
        },
      ]}
    >
      {icon ? (
        <View style={{ marginRight: 4 }}>
          <DynamicIcon name={icon} size={11} color={c.text} />
        </View>
      ) : null}
      <Text style={[styles.glassPillText, { color: c.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  catBadgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catText: {
    fontSize: 12,
    fontWeight: '700',
  },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  glassPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
