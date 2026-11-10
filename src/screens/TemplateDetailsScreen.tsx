import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Check,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { addPackingItemsBatchDeduplicated } from '../database/queries/itemQueries';
import {
  getTemplateById,
  getTemplateItems,
} from '../database/queries/templateQueries';
import { calculateScaledQuantity } from '../services/recommendationEngine';
import { CategoryBadge } from '../components/Badges';
import { ConfirmModal } from '../components/ConfirmModal';
import { DynamicIcon } from '../components/DynamicIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  CategoryName,
  PackingTemplate,
  RootStackParamList,
  TemplateItem,
} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TemplateDetails'>;

interface CustomizableTplItem extends TemplateItem {
  selected: boolean;
  customQty: number;
}

export const TemplateDetailsScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { theme } = useAppTheme();
  const { trips, categories, notifyDataChanged } = useAppContext();
  const { templateId, targetTripId } = route.params;

  const activeTrips = useMemo(
    () => trips.filter((t) => t.status !== 'Completed'),
    [trips]
  );

  const [template, setTemplate] = useState<PackingTemplate | null>(null);
  const [rawItems, setRawItems] = useState<TemplateItem[]>([]);
  const [items, setItems] = useState<CustomizableTplItem[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(
    targetTripId ?? (activeTrips[0]?.id ?? null)
  );
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{
    tripId: number;
    tripName: string;
    added: number;
    skipped: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [tpl, tplItems] = await Promise.all([
        getTemplateById(templateId),
        getTemplateItems(templateId),
      ]);
      if (mounted) {
        setTemplate(tpl);
        setRawItems(tplItems);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [templateId]);

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) ?? null,
    [trips, selectedTripId]
  );

  // Recalculate suggested quantities whenever target trip changes
  useEffect(() => {
    const days = selectedTrip?.trip_duration ?? 5;
    const travellers = selectedTrip?.traveller_count ?? 1;

    setItems(
      rawItems.map((item) => ({
        ...item,
        selected: true,
        customQty: calculateScaledQuantity(
          item.default_quantity,
          item.scaling_rule,
          item.per_traveller === 1,
          days,
          travellers
        ),
      }))
    );
  }, [rawItems, selectedTrip?.id, selectedTrip?.trip_duration, selectedTrip?.traveller_count]);

  const groupedByCategory = useMemo(() => {
    const groups: Array<{
      categoryName: CategoryName;
      color: string;
      icon: string;
      items: CustomizableTplItem[];
    }> = [];

    for (const cat of categories) {
      const catItems = items.filter((i) => i.category_id === cat.id);
      if (catItems.length > 0) {
        groups.push({
          categoryName: cat.name,
          color: cat.color_hex,
          icon: cat.icon_name,
          items: catItems,
        });
      }
    }
    return groups;
  }, [categories, items]);

  const selectedItemsCount = items.filter((i) => i.selected).length;

  const handleToggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  const handleAdjustQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, customQty: Math.max(1, Math.min(99, i.customQty + delta)) }
          : i
      )
    );
  };

  const handleApplyToSelectedTrip = async () => {
    if (!selectedTrip) return;
    setApplying(true);
    try {
      const chosen = items.filter((i) => i.selected);
      const { addedCount, skippedCount } = await addPackingItemsBatchDeduplicated(
        selectedTrip.id,
        chosen.map((i) => ({
          item_name: i.item_name,
          category_id: i.category_id,
          quantity: i.customQty,
          is_packed: 0,
          is_essential: i.is_essential,
          notes: '',
          is_custom: 0,
        }))
      );
      await notifyDataChanged();
      setApplying(false);
      setApplyResult({
        tripId: selectedTrip.id,
        tripName: selectedTrip.trip_name,
        added: addedCount,
        skipped: skippedCount,
      });
    } catch (err) {
      setApplying(false);
      console.error('[PACKMATE TemplateDetails] Apply failed:', err);
    }
  };

  if (!template) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.colors.background }]}
      >
        <ScreenHeader title="Template" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title={template.template_name}
        subtitle={`${template.item_count} curated items • ${template.recommended_duration}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Overview Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
            theme.shadows.sm,
          ]}
        >
          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.heroIconWrap,
                { backgroundColor: `${template.accent_color}18` },
              ]}
            >
              <DynamicIcon
                name={template.icon_name}
                size={28}
                color={template.accent_color}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.heroTitle, { color: theme.colors.primaryText }]}>
                {template.template_name}
              </Text>
              <Text style={[styles.heroEnv, { color: template.accent_color }]}>
                {template.destination_type} • {template.trip_type}
              </Text>
            </View>
          </View>
          <Text style={[styles.heroDesc, { color: theme.colors.secondaryText }]}>
            {template.description}
          </Text>

          {/* Target Trip Picker for Applying */}
          <View
            style={[
              styles.targetSection,
              { borderTopColor: theme.colors.border },
            ]}
          >
            <View style={styles.targetHeader}>
              <Sparkles size={15} color={theme.colors.secondaryBlue} />
              <Text
                style={[styles.targetLabel, { color: theme.colors.primaryText }]}
              >
                {activeTrips.length > 0
                  ? 'Select Trip to Scale & Apply:'
                  : 'No active trips yet — create a trip from this template:'}
              </Text>
            </View>

            {activeTrips.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tripChipRow}
              >
                {activeTrips.map((t) => {
                  const active = t.id === selectedTripId;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => setSelectedTripId(t.id)}
                      style={[
                        styles.tripChip,
                        {
                          backgroundColor: active
                            ? theme.colors.primaryNavy
                            : theme.colors.surfaceSubtle,
                          borderColor: active
                            ? theme.colors.primaryNavy
                            : theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '700',
                          color: active ? '#FFFFFF' : theme.colors.primaryText,
                        }}
                      >
                        {t.trip_name} ({t.trip_duration}d • {t.traveller_count}p)
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}
          </View>
        </View>

        {/* Customize Items Grouped by Category */}
        <Text style={[styles.customizeHeading, { color: theme.colors.primaryText }]}>
          Customize Included Items ({selectedItemsCount} selected)
        </Text>

        {groupedByCategory.map((group) => (
          <View key={group.categoryName} style={styles.groupWrap}>
            <View style={styles.groupHeader}>
              <CategoryBadge
                name={group.categoryName}
                color={group.color}
                iconName={group.icon}
              />
              <Text style={[styles.groupCount, { color: theme.colors.mutedText }]}>
                {group.items.length} items
              </Text>
            </View>

            {group.items.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: item.selected
                      ? theme.colors.border
                      : 'transparent',
                    opacity: item.selected ? 1 : 0.58,
                  },
                ]}
              >
                <Pressable
                  onPress={() => handleToggleItem(item.id)}
                  style={styles.itemLeft}
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
                    {item.selected ? (
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    ) : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.itemName,
                        { color: theme.colors.primaryText },
                      ]}
                    >
                      {item.item_name}
                    </Text>
                    <Text
                      style={[
                        styles.essentialTag,
                        {
                          color:
                            item.is_essential === 1
                              ? theme.colors.secondaryBlue
                              : theme.colors.mutedText,
                        },
                      ]}
                    >
                      {item.is_essential === 1 ? 'Essential' : 'Optional'}
                      {item.per_traveller === 1
                        ? ' • Scales per traveller'
                        : ' • Shared group item'}
                    </Text>
                  </View>
                </Pressable>

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
                    onPress={() => handleAdjustQty(item.id, -1)}
                    style={styles.stepBtn}
                  >
                    <Minus size={13} color={theme.colors.primaryText} />
                  </Pressable>
                  <Text
                    style={[styles.qtyText, { color: theme.colors.primaryText }]}
                  >
                    {item.customQty}
                  </Text>
                  <Pressable
                    onPress={() => handleAdjustQty(item.id, 1)}
                    style={styles.stepBtn}
                  >
                    <Plus size={13} color={theme.colors.primaryText} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Sticky Actions */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <PrimaryButton
          label="New Trip w/ Template"
          onPress={() =>
            navigation.navigate('CreateTrip', {
              preselectedTemplateId: template.id,
            })
          }
          variant="outline"
          style={{ flex: 1 }}
        />
        {selectedTrip ? (
          <PrimaryButton
            label={`Apply (${selectedItemsCount})`}
            onPress={handleApplyToSelectedTrip}
            variant="secondary"
            loading={applying}
            disabled={selectedItemsCount === 0}
            style={{ flex: 1.25 }}
          />
        ) : null}
      </View>

      <ConfirmModal
        visible={Boolean(applyResult)}
        tone="success"
        title="Template Applied!"
        message={
          applyResult
            ? `Added ${applyResult.added} packing items to "${applyResult.tripName}"${
                applyResult.skipped > 0
                  ? ` (${applyResult.skipped} existing duplicate items were automatically skipped)`
                  : ''
              }.`
            : ''
        }
        confirmLabel="Open Checklist"
        cancelLabel="Stay Here"
        onConfirm={() => {
          const id = applyResult?.tripId;
          setApplyResult(null);
          if (id) {
            navigation.navigate('PackingChecklist', { tripId: id });
          }
        }}
        onCancel={() => setApplyResult(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroEnv: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  heroDesc: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  targetSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  targetLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  tripChipRow: {
    gap: 8,
  },
  tripChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  customizeHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  groupWrap: {
    marginBottom: 18,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  groupCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  itemLeft: {
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
  essentialTag: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
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
  qtyText: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});
