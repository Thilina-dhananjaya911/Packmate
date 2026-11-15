import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { TripEssentialItem } from '../types';
import { CategoryBadge } from './Badges';
import { PrimaryButton } from './PrimaryButton';

interface CriticalVerifyModalProps {
  visible: boolean;
  item: TripEssentialItem | null;
  onVerify: () => void;
  onUnverify?: () => void;
  onClose: () => void;
  loading?: boolean;
}

export const CriticalVerifyModal: React.FC<CriticalVerifyModalProps> = ({
  visible,
  item,
  onVerify,
  onUnverify,
  onClose,
  loading = false,
}) => {
  const { theme } = useAppTheme();

  if (!item) return null;

  const isAlreadyVerified = item.is_verified === 1;

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
              backgroundColor: theme.colors.card,
              borderColor: isAlreadyVerified
                ? theme.colors.accentMint
                : theme.colors.border,
            },
            theme.shadows.lg,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Top Close button */}
          <Pressable
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
          >
            <X size={16} color={theme.colors.secondaryText} />
          </Pressable>

          {/* Status Icon */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isAlreadyVerified
                  ? theme.colors.successSoft
                  : theme.colors.dangerSoft,
              },
            ]}
          >
            {isAlreadyVerified ? (
              <ShieldCheck size={32} color={theme.colors.accentMint} strokeWidth={2.4} />
            ) : (
              <ShieldAlert size={32} color={theme.colors.danger} strokeWidth={2.4} />
            )}
          </View>

          {/* Critical Badge */}
          <View
            style={[
              styles.badgeWrap,
              {
                backgroundColor: isAlreadyVerified
                  ? theme.colors.successSoft
                  : theme.colors.dangerSoft,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: isAlreadyVerified
                    ? theme.colors.accentMint
                    : theme.colors.danger,
                },
              ]}
            >
              {isAlreadyVerified ? 'PHYSICALLY VERIFIED' : 'CRITICAL TRAVEL BELONGING'}
            </Text>
          </View>

          {/* Item Name */}
          <Text style={[styles.itemName, { color: theme.colors.primaryText }]}>
            {item.item_name}
          </Text>

          {/* Category */}
          <View style={{ marginTop: 6, marginBottom: 14 }}>
            <CategoryBadge
              name={item.category_name}
              color={item.category_color}
              iconName={item.category_icon}
              compact
            />
          </View>

          {/* Physical Check Affirmation Box */}
          <View
            style={[
              styles.affirmationBox,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.affirmationQuote,
                { color: theme.colors.primaryText },
              ]}
            >
              "I have physically checked and packed this item."
            </Text>
            <Text
              style={[
                styles.affirmationExplainer,
                { color: theme.colors.secondaryText },
              ]}
            >
              {isAlreadyVerified
                ? 'This critical item has been confirmed in your possession. You can revoke verification if you misplaced or removed it.'
                : 'Passports, identity cards, wallets, keys, and medicines cannot be replaced easily at the airport or station. Please physically confirm its location before checking.'}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionButtons}>
            {!isAlreadyVerified ? (
              <>
                <PrimaryButton
                  label="I Confirm & Verify"
                  onPress={onVerify}
                  variant="mint"
                  loading={loading}
                  icon={<Check size={18} color="#FFFFFF" strokeWidth={3} />}
                />
                <PrimaryButton
                  label="Cancel (Not Verified Yet)"
                  onPress={onClose}
                  variant="outline"
                  compact
                />
              </>
            ) : (
              <>
                <PrimaryButton
                  label="Item is Safe & Packed"
                  onPress={onClose}
                  variant="secondary"
                  icon={<ShieldCheck size={18} color="#FFFFFF" strokeWidth={2.4} />}
                />
                {onUnverify ? (
                  <PrimaryButton
                    label="Remove Verified Status"
                    onPress={onUnverify}
                    variant="danger"
                    compact
                  />
                ) : null}
              </>
            )}
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
    maxWidth: 390,
    borderRadius: 26,
    borderWidth: 1.5,
    padding: 22,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  badgeWrap: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  affirmationBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 18,
  },
  affirmationQuote: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  affirmationExplainer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  actionButtons: {
    width: '100%',
    gap: 10,
  },
});
