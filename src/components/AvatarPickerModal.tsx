import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { PROFILE_AVATARS } from '../constants';
import { useAppTheme } from '../context/ThemeContext';
import { DynamicIcon } from './DynamicIcon';
import { PrimaryButton } from './PrimaryButton';

interface AvatarPickerModalProps {
  visible: boolean;
  selectedAvatarId: string;
  onSelect: (avatarId: string) => void;
  onClose: () => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  visible,
  selectedAvatarId,
  onSelect,
  onClose,
}) => {
  const { theme } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.dialog,
            {
              backgroundColor: theme.isDark ? '#160F2E' : theme.colors.card,
              borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
            },
            theme.shadows.lg,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.colors.primaryText }]}>
                Choose Travel Avatar
              </Text>
              <Text
                style={[styles.subtitle, { color: theme.colors.secondaryText }]}
              >
                Select an avatar that matches your travel persona
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={[
                styles.closeBtn,
                {
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.background,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
                },
              ]}
            >
              <X size={18} color={theme.colors.secondaryText} />
            </Pressable>
          </View>

          {/* Avatar Grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.grid}
          >
            {PROFILE_AVATARS.map((item) => {
              const isSelected = item.id === selectedAvatarId;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  style={[
                    styles.avatarCard,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.infoSoft
                        : theme.isDark ? 'rgba(255, 255, 255, 0.04)' : theme.colors.background,
                      borderColor: isSelected
                        ? theme.colors.accentLime
                        : theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        backgroundColor: `${item.accentColor}20`,
                        borderColor: item.accentColor,
                      },
                    ]}
                  >
                    <DynamicIcon
                      name={item.iconName}
                      size={26}
                      color={item.accentColor}
                      strokeWidth={2.4}
                    />
                    {isSelected ? (
                      <View
                        style={[
                          styles.checkBadge,
                          { backgroundColor: theme.colors.accentLime },
                        ]}
                      >
                        <Check size={11} color={theme.colors.limeText} strokeWidth={3} />
                      </View>
                    ) : null}
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.avatarLabel,
                      {
                        color: isSelected
                          ? (theme.isDark ? theme.colors.accentLime : theme.colors.secondaryBlue)
                          : theme.colors.primaryText,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.footerRow}>
            <PrimaryButton
              label="Close"
              onPress={onClose}
              variant="outline"
              pill
              compact
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  avatarCard: {
    width: '47%',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  footerRow: {
    marginTop: 18,
  },
});
