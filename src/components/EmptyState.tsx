import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { GeometricIllustration, IllustrationVariant } from './GeometricIllustration';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
  variant?: IllustrationVariant;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'empty-trips',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        theme.shadows.sm,
      ]}
    >
      <GeometricIllustration variant={variant} size={88} />
      <Text style={[styles.title, { color: theme.colors.primaryText }]}>{title}</Text>
      <Text style={[styles.desc, { color: theme.colors.secondaryText }]}>
        {description}
      </Text>
      {actionLabel && onAction ? (
        <View style={styles.actionsWrap}>
          <PrimaryButton
            label={actionLabel}
            onPress={onAction}
            variant="secondary"
            style={styles.primaryBtn}
          />
          {secondaryActionLabel && onSecondaryAction ? (
            <PrimaryButton
              label={secondaryActionLabel}
              onPress={onSecondaryAction}
              variant="outline"
              compact
              style={styles.secondaryBtn}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
    marginVertical: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 14,
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },
  actionsWrap: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    marginTop: 4,
  },
});
