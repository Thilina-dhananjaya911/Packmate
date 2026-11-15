import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightElement,
}) => {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.leftRow}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={10}
              style={[
                styles.backBtn,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
                theme.shadows.xs,
              ]}
            >
              <ArrowLeft size={19} color={theme.colors.primaryText} strokeWidth={2.4} />
            </Pressable>
          ) : null}
          <View style={styles.titleWrap}>
            <Text
              numberOfLines={1}
              style={[styles.title, { color: theme.colors.primaryText }]}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                numberOfLines={1}
                style={[styles.subtitle, { color: theme.colors.secondaryText }]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    width: '100%',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 13,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
