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
          bg: theme.colors.successSoft,
          fg: theme.colors.accentMint,
          dot: theme.colors.accentMint,
        };
      case 'Completed':
        return {
          bg: theme.colors.navySoft,
          fg: theme.colors.secondaryBlue,
          dot: theme.colors.secondaryBlue,
        };
      case 'Upcoming':
      default:
        return {
          bg: theme.colors.warningSoft,
          fg: '#D97706',
          dot: '#F59E0B',
        };
    }
  };

  const s = getStyle();

  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
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
        { backgroundColor: `${color}18` },
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
  const accent = meta?.accentColor ?? '#4C9AFF';
  const icon = meta?.icon ?? 'Compass';

  return (
    <View style={[styles.catBadge, { backgroundColor: `${accent}16` }]}>
      <View style={{ marginRight: 5 }}>
        <DynamicIcon name={icon} size={13} color={accent} />
      </View>
      <Text style={[styles.catText, { color: accent }]}>{tripType}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
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
});
