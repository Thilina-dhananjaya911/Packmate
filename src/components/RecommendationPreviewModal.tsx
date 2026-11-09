import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check, Minus, Plus, Sparkles, X } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { RecommendedItem } from '../types';
import { CategoryBadge } from './Badges';
import { PrimaryButton } from './PrimaryButton';

interface RecommendationPreviewModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  items: RecommendedItem[];
  loading?: boolean;
  onToggleItem: (key: string) => void;
  onChangeQuantity: (key: string, delta: number) => void;
  onToggleAllOptional: (selectOptional: boolean) => void;
  onConfirm: () => void;
  onSkip: () => void;
}

export const RecommendationPreviewModal: React.FC<
  RecommendationPreviewModalProps
> = ({
  visible,
  title = 'Smart Packing Suggestions',
  subtitle,
  items,
  loading = false,
  onToggleItem,
  onChangeQuantity,
  onToggleAllOptional,
  onConfirm,
  onSkip,
}) => {
  const { theme } = useAppTheme();

  const { essentialItems, optionalItems, selectedCount } = useMemo(() => {
    const essential = items.filter((i) => i.is_essential);
    const optional = items.filter((i) => !i.is_essential);
    const selected = items.filter((i) => i.selected).length;
    return {
      essentialItems: essential,
      optionalItems: optional,
      selectedCount: selected,
    };
  }, [items]);

  const anyOptionalSelected = optionalItems.some((i) => i.selected);

  const renderItemRow = (item: RecommendedItem) => (
    <View
      key={item.key}
      style={[
        styles.itemCard,
        {
          backgroundColor: item.selected
            ? theme.colors.card
            : theme.colors.surfaceSubtle,
          borderColor: item.selected
            ? theme.colors.border
            : 'transparent',
          opacity: item.selected ? 1 : 0.65,
        },
      ]}
    >
      <Pressable
        onPress={() => onToggleItem(item.key)}
        style={styles.leftCheckArea}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: item.selected
                ? theme.colors.accentMint
                : 'transparent',
              borderColor: item.selected
                ? theme.colors.accentMint
                : theme.colors.mutedText,
            },
          ]}
        >
          {item.selected ? <Check size={13} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={2}
            style={[styles.itemName, { color: theme.colors.primaryText }]}
          >
            {item.item_name}
          </Text>
          <View style={styles.metaRow}>
            <CategoryBadge
              name={item.category_name}
              color={item.category_color}
              compact
            />
            <Text
              numberOfLines={1}
              style={[styles.reasonText, { color: theme.colors.mutedText }]}
            >
              {item.reason}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Quantity Stepper */}
      <View
        style={[
          styles.stepper,
          {
            backgroundColor: theme.colors.surfaceSubtle,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => onChangeQuantity(item.key, -1)}
          hitSlop={6}
          style={styles.stepBtn}
        >
          <Minus size={13} color={theme.colors.primaryText} />
        </Pressable>
        <Text style={[styles.qtyValue, { color: theme.colors.primaryText }]}>
          {item.quantity}
        </Text>
        <Pressable
          onPress={() => onChangeQuantity(item.key, 1)}
          hitSlop={6}
          style={styles.stepBtn}
        >
          <Plus size={13} color={theme.colors.primaryText} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onSkip}>
      <View style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.header,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.sparkleBadge,
                  { backgroundColor: theme.colors.infoSoft },
                ]}
              >
                <Sparkles size={18} color={theme.colors.secondaryBlue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: theme.colors.primaryText }]}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text
                    style={[styles.subtitle, { color: theme.colors.secondaryText }]}
                  >
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            </View>
            <Pressable
              onPress={onSkip}
              style={[
                styles.closeCircle,
                { backgroundColor: theme.colors.surfaceSubtle },
              ]}
            >
              <X size={18} color={theme.colors.secondaryText} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionHeader, { color: theme.colors.primaryText }]}>
              Essential Recommendations ({essentialItems.length})
            </Text>
            {essentialItems.map(renderItemRow)}

            {optionalItems.length > 0 ? (
              <View style={{ marginTop: 16 }}>
                <View style={styles.optionalHeaderRow}>
                  <Text
                    style={[
                      styles.sectionHeader,
                      { color: theme.colors.primaryText, marginBottom: 0 },
                    ]}
                  >
                    Optional Comfort & Extras ({optionalItems.length})
                  </Text>
                  <Pressable
                    onPress={() => onToggleAllOptional(!anyOptionalSelected)}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: theme.colors.secondaryBlue,
                      }}
                    >
                      {anyOptionalSelected ? 'Deselect Optional' : 'Select All'}
                    </Text>
                  </Pressable>
                </View>
                {optionalItems.map(renderItemRow)}
              </View>
            ) : null}
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                backgroundColor: theme.colors.card,
                borderTopColor: theme.colors.border,
              },
            ]}
          >
            <PrimaryButton
              label="Skip for Empty List"
              onPress={onSkip}
              variant="outline"
              style={{ flex: 1 }}
            />
            <PrimaryButton
              label={`Add ${selectedCount} Items`}
              onPress={onConfirm}
              variant="secondary"
              loading={loading}
              disabled={selectedCount === 0}
              style={{ flex: 1.4 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '86%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  sparkleBadge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 30,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  optionalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  leftCheckArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 8,
  },
  reasonText: {
    fontSize: 11,
    flexShrink: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stepBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});
