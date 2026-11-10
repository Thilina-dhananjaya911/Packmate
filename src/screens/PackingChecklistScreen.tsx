import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  Minus,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import {
  addPackingItem,
  deletePackingItem,
  togglePackingItemPacked,
  updatePackingItemQuantity,
} from '../database/queries/itemQueries';
import { useTripDetailsData } from '../hooks/usePackmate';
import { AnimatedProgressBar } from '../components/AnimatedProgressBar';
import { ConfirmModal } from '../components/ConfirmModal';
import { DynamicIcon } from '../components/DynamicIcon';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  FilterChipOption,
  FilterChips,
  SearchBar,
} from '../components/SearchAndFilter';
import {
  CategoryName,
  PackingItem,
  RootStackParamList,
} from '../types';
import { formatDateRange } from '../utils/dateUtils';
import { calculateProgressFromItems } from '../utils/progressUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'PackingChecklist'>;
type PackedFilter = 'All' | 'Unpacked' | 'Packed';

interface ChecklistItemRowProps {
  item: PackingItem;
  onToggle: (item: PackingItem) => void;
  onAdjustQty: (item: PackingItem, delta: number) => void;
  onOpenDetails: (item: PackingItem) => void;
  onRequestDelete: (item: PackingItem) => void;
}

const ChecklistItemRow: React.FC<ChecklistItemRowProps> = ({
  item,
  onToggle,
  onAdjustQty,
  onOpenDetails,
  onRequestDelete,
}) => {
  const { theme } = useAppTheme();
  const checkScale = useSharedValue(1);
  const packed = item.is_packed === 1;

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handlePressCheck = () => {
    checkScale.value = withSequence(
      withSpring(1.25, { damping: 10, stiffness: 360 }),
      withSpring(1, { damping: 14, stiffness: 280 })
    );
    onToggle(item);
  };

  return (
    <View
      style={[
        styles.itemRow,
        {
          backgroundColor: packed
            ? theme.colors.surfaceSubtle
            : theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Pressable onPress={handlePressCheck} hitSlop={8} style={styles.checkHit}>
        <Animated.View
          style={[
            styles.checkbox,
            {
              backgroundColor: packed ? theme.colors.accentMint : 'transparent',
              borderColor: packed
                ? theme.colors.accentMint
                : theme.colors.secondaryBlue,
            },
            checkAnimStyle,
          ]}
        >
          {packed ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
        </Animated.View>
      </Pressable>

      <Pressable
        onPress={() => onOpenDetails(item)}
        style={styles.itemContent}
      >
        <Text
          numberOfLines={2}
          style={[
            styles.itemName,
            {
              color: packed
                ? theme.colors.mutedText
                : theme.colors.primaryText,
              textDecorationLine: packed ? 'line-through' : 'none',
            },
          ]}
        >
          {item.item_name}
        </Text>
        <View style={styles.itemSubRow}>
          <Text
            style={[
              styles.itemSubTag,
              { color: item.category_color || theme.colors.secondaryBlue },
            ]}
          >
            {item.category_name}
          </Text>
          {item.is_essential === 1 ? (
            <Text style={[styles.dotMeta, { color: theme.colors.secondaryText }]}>
              • Essential
            </Text>
          ) : null}
          {item.is_custom === 1 ? (
            <Text style={[styles.dotMeta, { color: theme.colors.accentMint }]}>
              • Custom
            </Text>
          ) : null}
          {item.notes ? (
            <Text
              numberOfLines={1}
              style={[styles.dotMeta, { color: theme.colors.mutedText }]}
            >
              • {item.notes}
            </Text>
          ) : null}
        </View>
      </Pressable>

      {/* Quantity Stepper */}
      <View
        style={[
          styles.qtyStepper,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => onAdjustQty(item, -1)}
          disabled={item.quantity <= 1}
          hitSlop={6}
          style={[styles.qtyBtn, item.quantity <= 1 && { opacity: 0.35 }]}
        >
          <Minus size={12} color={theme.colors.primaryText} />
        </Pressable>
        <Text style={[styles.qtyText, { color: theme.colors.primaryText }]}>
          {item.quantity}
        </Text>
        <Pressable
          onPress={() => onAdjustQty(item, 1)}
          hitSlop={6}
          style={styles.qtyBtn}
        >
          <Plus size={12} color={theme.colors.primaryText} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => onRequestDelete(item)}
        hitSlop={8}
        style={styles.deleteIconBtn}
      >
        <Trash2 size={15} color={theme.colors.mutedText} />
      </Pressable>
    </View>
  );
};

export const PackingChecklistScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { theme } = useAppTheme();
  const { categories, notifyDataChanged } = useAppContext();
  const { tripId, openAddModal } = route.params;

  const { trip, items, reload } = useTripDetailsData(tripId);

  const [searchQuery, setSearchQuery] = useState('');
  const [packedFilter, setPackedFilter] = useState<PackedFilter>('All');
  const [categoryFilter, setCategoryFilter] = useState<CategoryName | 'All'>(
    'All'
  );
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<number, boolean>
  >({});

  // Custom Item Modal state
  const [showAddModal, setShowAddModal] = useState(Boolean(openAddModal));
  const [newItemName, setNewItemName] = useState('');
  const [newItemCatId, setNewItemCatId] = useState<number>(1);
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemEssential, setNewItemEssential] = useState(true);
  const [newItemNotes, setNewItemNotes] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState(false);

  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = useState<PackingItem | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.id === newItemCatId)) {
      setNewItemCatId(categories[0].id);
    }
  }, [categories, newItemCatId]);

  const progress = useMemo(() => calculateProgressFromItems(items), [items]);

  const packedOptions: FilterChipOption<PackedFilter>[] = useMemo(
    () => [
      { label: 'All Items', value: 'All', count: progress.totalItems },
      { label: 'Remaining', value: 'Unpacked', count: progress.remainingItems },
      { label: 'Packed', value: 'Packed', count: progress.packedItems },
    ],
    [progress]
  );

  const categoryChipOptions: FilterChipOption<CategoryName | 'All'>[] = useMemo(
    () => [
      { label: 'All Categories', value: 'All' },
      ...categories.map((c) => ({
        label: c.name,
        value: c.name,
      })),
    ],
    [categories]
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((i) => {
      if (packedFilter === 'Packed' && i.is_packed !== 1) return false;
      if (packedFilter === 'Unpacked' && i.is_packed === 1) return false;
      if (categoryFilter !== 'All' && i.category_name !== categoryFilter) {
        return false;
      }
      if (q.length > 0) {
        return (
          i.item_name.toLowerCase().includes(q) ||
          i.notes.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, packedFilter, categoryFilter, searchQuery]);

  const groupedCategories = useMemo(() => {
    return categories
      .map((cat) => {
        const catItems = filteredItems.filter((i) => i.category_id === cat.id);
        const packedInCat = catItems.filter((i) => i.is_packed === 1).length;
        return {
          category: cat,
          items: catItems,
          packedCount: packedInCat,
        };
      })
      .filter((g) => g.items.length > 0);
  }, [categories, filteredItems]);

  const handleToggleItem = async (item: PackingItem) => {
    await togglePackingItemPacked(item.id);
    await reload();
    await notifyDataChanged();
  };

  const handleAdjustQuantity = async (item: PackingItem, delta: number) => {
    const nextQty = item.quantity + delta;
    if (nextQty < 1 || nextQty > 99) return;
    await updatePackingItemQuantity(item.id, nextQty);
    await reload();
    await notifyDataChanged();
  };

  const handleAddCustomItem = async () => {
    if (!newItemName.trim()) {
      setAddError('Please enter an item name.');
      return;
    }
    setAddingItem(true);
    try {
      await addPackingItem({
        trip_id: tripId,
        item_name: newItemName.trim(),
        category_id: newItemCatId,
        quantity: newItemQty,
        is_packed: 0,
        is_essential: newItemEssential ? 1 : 0,
        notes: newItemNotes.trim(),
        is_custom: 1,
      });
      await reload();
      await notifyDataChanged();
      setNewItemName('');
      setNewItemQty(1);
      setNewItemNotes('');
      setAddError(null);
      setShowAddModal(false);
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : 'Unable to add packing item.'
      );
    } finally {
      setAddingItem(false);
    }
  };

  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return;
    await deletePackingItem(itemToDelete.id);
    setItemToDelete(null);
    await reload();
    await notifyDataChanged();
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title={trip?.trip_name ?? 'Packing Checklist'}
        subtitle={
          trip
            ? `${trip.destination} • ${formatDateRange(
                trip.departure_date,
                trip.return_date
              )}`
            : 'Checklist'
        }
        onBack={() => navigation.goBack()}
        rightElement={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() =>
                navigation.navigate('MainTabs', {
                  screen: 'Templates',
                  params: { targetTripId: tripId },
                })
              }
              style={[
                styles.headerActionBtn,
                {
                  backgroundColor: theme.colors.infoSoft,
                },
              ]}
            >
              <Sparkles size={17} color={theme.colors.secondaryBlue} />
            </Pressable>
            <Pressable
              onPress={() =>
                navigation.navigate('TripDetails', { tripId })
              }
              style={[
                styles.headerActionBtn,
                {
                  backgroundColor: theme.colors.surfaceSubtle,
                },
              ]}
            >
              <SlidersHorizontal size={17} color={theme.colors.primaryText} />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Packing Progress Summary Card */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
            theme.shadows.sm,
          ]}
        >
          <View style={styles.summaryTopRow}>
            <View>
              <Text
                style={[styles.summaryOverline, { color: theme.colors.secondaryText }]}
              >
                PACKING COMPLETION
              </Text>
              <Text
                style={[
                  styles.summaryBigPercent,
                  {
                    color:
                      progress.percentage >= 100
                        ? theme.colors.accentMint
                        : theme.colors.primaryText,
                  },
                ]}
              >
                {progress.percentage}%
              </Text>
            </View>

            <View style={styles.countersRow}>
              <View
                style={[
                  styles.counterPill,
                  { backgroundColor: theme.colors.surfaceSubtle },
                ]}
              >
                <Text
                  style={[styles.counterNum, { color: theme.colors.primaryText }]}
                >
                  {progress.totalItems}
                </Text>
                <Text
                  style={[styles.counterLabel, { color: theme.colors.secondaryText }]}
                >
                  Total
                </Text>
              </View>

              <View
                style={[
                  styles.counterPill,
                  { backgroundColor: theme.colors.successSoft },
                ]}
              >
                <Text
                  style={[styles.counterNum, { color: theme.colors.accentMint }]}
                >
                  {progress.packedItems}
                </Text>
                <Text
                  style={[styles.counterLabel, { color: theme.colors.accentMint }]}
                >
                  Packed
                </Text>
              </View>

              <View
                style={[
                  styles.counterPill,
                  { backgroundColor: theme.colors.infoSoft },
                ]}
              >
                <Text
                  style={[styles.counterNum, { color: theme.colors.secondaryBlue }]}
                >
                  {progress.remainingItems}
                </Text>
                <Text
                  style={[
                    styles.counterLabel,
                    { color: theme.colors.secondaryBlue },
                  ]}
                >
                  Left
                </Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 14 }}>
            <AnimatedProgressBar percentage={progress.percentage} height={10} />
          </View>
        </View>

        {/* Search & Filters */}
        <View style={styles.filterBlock}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search items in this checklist..."
          />
          <View style={{ marginTop: 10 }}>
            <FilterChips
              options={packedOptions}
              selectedValue={packedFilter}
              onSelect={setPackedFilter}
            />
          </View>
          <View style={{ marginTop: 4 }}>
            <FilterChips
              options={categoryChipOptions}
              selectedValue={categoryFilter}
              onSelect={setCategoryFilter}
            />
          </View>
        </View>

        {/* Category Accordions */}
        {items.length === 0 ? (
          <EmptyState
            variant="empty-items"
            title="Packing List Is Empty"
            description="Add custom items manually or apply one of PACKMATE's 8 intelligent offline templates to populate your checklist."
            actionLabel="Add Custom Item"
            onAction={() => setShowAddModal(true)}
            secondaryActionLabel="Browse Templates"
            onSecondaryAction={() =>
              navigation.navigate('MainTabs', {
                screen: 'Templates',
                params: { targetTripId: tripId },
              })
            }
          />
        ) : groupedCategories.length === 0 ? (
          <EmptyState
            variant="empty-search"
            title="No Items Match Filter"
            description="Adjust your search term or clear category/status filters to view your items."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setPackedFilter('All');
              setCategoryFilter('All');
            }}
          />
        ) : (
          groupedCategories.map(({ category, items: catItems, packedCount }) => {
            const isCollapsed = Boolean(collapsedCategories[category.id]);
            const allCatPacked =
              catItems.length > 0 && packedCount === catItems.length;

            return (
              <View key={category.id} style={styles.catSection}>
                <Pressable
                  onPress={() =>
                    setCollapsedCategories((prev) => ({
                      ...prev,
                      [category.id]: !prev[category.id],
                    }))
                  }
                  style={[
                    styles.catHeaderCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.catHeaderLeft}>
                    <View
                      style={[
                        styles.catIconBox,
                        { backgroundColor: `${category.color_hex}18` },
                      ]}
                    >
                      <DynamicIcon
                        name={category.icon_name}
                        size={17}
                        color={category.color_hex}
                      />
                    </View>
                    <Text
                      style={[
                        styles.catHeaderTitle,
                        { color: theme.colors.primaryText },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </View>

                  <View style={styles.catHeaderRight}>
                    <View
                      style={[
                        styles.catCounterBadge,
                        {
                          backgroundColor: allCatPacked
                            ? theme.colors.successSoft
                            : theme.colors.surfaceSubtle,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '800',
                          color: allCatPacked
                            ? theme.colors.accentMint
                            : theme.colors.secondaryText,
                        }}
                      >
                        {packedCount}/{catItems.length}
                      </Text>
                    </View>
                    {isCollapsed ? (
                      <ChevronRight size={18} color={theme.colors.secondaryText} />
                    ) : (
                      <ChevronDown size={18} color={theme.colors.secondaryText} />
                    )}
                  </View>
                </Pressable>

                {!isCollapsed ? (
                  <View style={styles.catItemsContainer}>
                    {catItems.map((item) => (
                      <ChecklistItemRow
                        key={item.id}
                        item={item}
                        onToggle={handleToggleItem}
                        onAdjustQty={handleAdjustQuantity}
                        onOpenDetails={(it) =>
                          navigation.navigate('ItemDetails', {
                            itemId: it.id,
                            tripId,
                          })
                        }
                        onRequestDelete={setItemToDelete}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Add Custom Item Bar */}
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
          label="Add Custom Packing Item"
          onPress={() => {
            setAddError(null);
            setShowAddModal(true);
          }}
          variant="secondary"
          icon={<Plus size={18} color="#FFFFFF" strokeWidth={2.6} />}
        />
      </View>

      {/* Add Custom Item Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={[styles.modalBackdrop, { backgroundColor: theme.colors.overlay }]}
            onPress={() => setShowAddModal(false)}
          >
            <Pressable
              style={[
                styles.modalSheet,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                  <Layers size={20} color={theme.colors.secondaryBlue} />
                  <Text
                    style={[styles.modalTitle, { color: theme.colors.primaryText }]}
                  >
                    Add Custom Item
                  </Text>
                </View>
                <Pressable
                  onPress={() => setShowAddModal(false)}
                  style={[
                    styles.closeCircle,
                    { backgroundColor: theme.colors.surfaceSubtle },
                  ]}
                >
                  <X size={18} color={theme.colors.secondaryText} />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text
                  style={[styles.inputLabel, { color: theme.colors.primaryText }]}
                >
                  Item Name *
                </Text>
                <TextInput
                  value={newItemName}
                  onChangeText={(t) => {
                    setNewItemName(t);
                    if (addError) setAddError(null);
                  }}
                  placeholder="e.g. Portable Espresso Maker, Snorkel Mask"
                  placeholderTextColor={theme.colors.mutedText}
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: addError
                        ? theme.colors.danger
                        : theme.colors.border,
                      color: theme.colors.primaryText,
                    },
                  ]}
                />
                {addError ? (
                  <Text style={[styles.errText, { color: theme.colors.danger }]}>
                    {addError}
                  </Text>
                ) : null}

                <Text
                  style={[
                    styles.inputLabel,
                    { color: theme.colors.primaryText, marginTop: 14 },
                  ]}
                >
                  Category *
                </Text>
                <View style={styles.catGrid}>
                  {categories.map((cat) => {
                    const selected = cat.id === newItemCatId;
                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() => setNewItemCatId(cat.id)}
                        style={[
                          styles.catChoice,
                          {
                            backgroundColor: selected
                              ? `${cat.color_hex}18`
                              : theme.colors.background,
                            borderColor: selected
                              ? cat.color_hex
                              : theme.colors.border,
                          },
                        ]}
                      >
                        <DynamicIcon
                          name={cat.icon_name}
                          size={14}
                          color={cat.color_hex}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: selected
                              ? cat.color_hex
                              : theme.colors.primaryText,
                          }}
                        >
                          {cat.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.qtyAndEssentialRow}>
                  <View>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: theme.colors.primaryText, marginBottom: 6 },
                      ]}
                    >
                      Quantity
                    </Text>
                    <View
                      style={[
                        styles.modalStepper,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Pressable
                        onPress={() => setNewItemQty((q) => Math.max(1, q - 1))}
                        style={styles.modalStepBtn}
                      >
                        <Minus size={16} color={theme.colors.primaryText} />
                      </Pressable>
                      <Text
                        style={{
                          minWidth: 32,
                          textAlign: 'center',
                          fontSize: 16,
                          fontWeight: '800',
                          color: theme.colors.primaryText,
                        }}
                      >
                        {newItemQty}
                      </Text>
                      <Pressable
                        onPress={() => setNewItemQty((q) => Math.min(99, q + 1))}
                        style={styles.modalStepBtn}
                      >
                        <Plus size={16} color={theme.colors.primaryText} />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.essentialSwitchWrap}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: theme.colors.primaryText, marginBottom: 4 },
                      ]}
                    >
                      Essential Item
                    </Text>
                    <Switch
                      value={newItemEssential}
                      onValueChange={setNewItemEssential}
                      trackColor={{
                        false: theme.colors.border,
                        true: theme.colors.secondaryBlue,
                      }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>

                <Text
                  style={[
                    styles.inputLabel,
                    { color: theme.colors.primaryText, marginTop: 14 },
                  ]}
                >
                  Optional Notes
                </Text>
                <TextInput
                  value={newItemNotes}
                  onChangeText={setNewItemNotes}
                  placeholder="e.g. Pack in cabin bag front pocket"
                  placeholderTextColor={theme.colors.mutedText}
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      color: theme.colors.primaryText,
                    },
                  ]}
                />

                <View style={styles.modalActions}>
                  <PrimaryButton
                    label="Cancel"
                    onPress={() => setShowAddModal(false)}
                    variant="outline"
                    style={{ flex: 1 }}
                  />
                  <PrimaryButton
                    label="Save Item"
                    onPress={handleAddCustomItem}
                    variant="secondary"
                    loading={addingItem}
                    style={{ flex: 1.3 }}
                  />
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmModal
        visible={Boolean(itemToDelete)}
        tone="danger"
        title="Delete Packing Item?"
        message={`Remove "${itemToDelete?.item_name}" from this trip's checklist?`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  summaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryOverline: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  summaryBigPercent: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: 2,
  },
  countersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  counterPill: {
    minWidth: 58,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  counterNum: {
    fontSize: 16,
    fontWeight: '800',
  },
  counterLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  filterBlock: {
    marginBottom: 14,
  },
  catSection: {
    marginBottom: 14,
  },
  catHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  catHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  catHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catCounterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  catItemsContainer: {
    marginTop: 8,
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  checkHit: {
    paddingRight: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemSubRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  itemSubTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  dotMeta: {
    fontSize: 11,
    fontWeight: '600',
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 3,
    height: 32,
  },
  qtyBtn: {
    width: 22,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
  },
  deleteIconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderTopWidth: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
  },
  errText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  qtyAndEssentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 13,
    height: 42,
    paddingHorizontal: 6,
  },
  modalStepBtn: {
    width: 30,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  essentialSwitchWrap: {
    alignItems: 'flex-end',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    marginBottom: 8,
  },
});
