import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, LucideIcon } from 'lucide-react-native';
import { PROFILE_AVATARS } from '../constants';
import { useAppTheme } from '../context/ThemeContext';
import { DynamicIcon } from './DynamicIcon';

interface AvatarViewProps {
  avatarId?: string;
  name?: string;
  size?: number;
  showEditBadge?: boolean;
  onPress?: () => void;
}

export const AvatarView: React.FC<AvatarViewProps> = ({
  avatarId = 'avatar-explorer',
  name,
  size = 56,
  showEditBadge = false,
  onPress,
}) => {
  const { theme } = useAppTheme();

  const meta = PROFILE_AVATARS.find((a) => a.id === avatarId) ?? PROFILE_AVATARS[0];
  const accentColor = meta?.accentColor ?? theme.colors.secondaryBlue;
  const iconName = meta?.iconName ?? 'Compass';

  const iconSize = Math.round(size * 0.48);
  const badgeSize = Math.max(22, Math.round(size * 0.32));
  const badgeIconSize = Math.round(badgeSize * 0.52);

  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((p) => p[0]?.toUpperCase())
        .slice(0, 2)
        .join('')
    : '';

  const content = (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <LinearGradient
        colors={[
          theme.isDark ? '#1E3A68' : '#EFF6FF',
          theme.isDark ? '#142544' : '#DBEAFE',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: accentColor,
            borderWidth: size >= 70 ? 3 : 2,
          },
          theme.shadows.sm,
        ]}
      >
        <DynamicIcon
          name={iconName}
          size={iconSize}
          color={accentColor}
          strokeWidth={2.4}
        />
      </LinearGradient>

      {showEditBadge ? (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: theme.colors.secondaryBlue,
              borderColor: theme.colors.card,
            },
          ]}
        >
          <Camera size={badgeIconSize} color="#FFFFFF" strokeWidth={2.6} />
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel="Change avatar"
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});
