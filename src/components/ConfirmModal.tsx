import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { PrimaryButton } from './PrimaryButton';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'success' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const { theme } = useAppTheme();

  const getIconConfig = () => {
    switch (tone) {
      case 'success':
        return {
          bg: theme.colors.successSoft,
          icon: <CheckCircle2 size={28} color={theme.colors.accentMint} strokeWidth={2.2} />,
          btnVariant: 'mint' as const,
        };
      case 'info':
        return {
          bg: theme.colors.infoSoft,
          icon: <Info size={28} color={theme.colors.secondaryBlue} strokeWidth={2.2} />,
          btnVariant: 'secondary' as const,
        };
      case 'danger':
      default:
        return {
          bg: theme.colors.dangerSoft,
          icon: <AlertTriangle size={28} color={theme.colors.danger} strokeWidth={2.2} />,
          btnVariant: 'danger' as const,
        };
    }
  };

  const cfg = getIconConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel ?? onConfirm}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
        onPress={onCancel}
      >
        <Pressable
          style={[
            styles.dialog,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
            theme.shadows.lg,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
            {cfg.icon}
          </View>
          <Text style={[styles.title, { color: theme.colors.primaryText }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: theme.colors.secondaryText }]}>
            {message}
          </Text>
          <View style={styles.actionsRow}>
            {onCancel ? (
              <PrimaryButton
                label={cancelLabel}
                onPress={onCancel}
                variant="outline"
                style={styles.flexBtn}
              />
            ) : null}
            <PrimaryButton
              label={confirmLabel}
              onPress={onConfirm}
              variant={cfg.btnVariant}
              loading={loading}
              style={styles.flexBtn}
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
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  flexBtn: {
    flex: 1,
  },
});
