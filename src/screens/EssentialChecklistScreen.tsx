import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  Layers,
  MapPin,
  Plus,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import {
  addTripEssentialItem,
  deleteTripEssentialItem,
  getAllEssentialCategories,
  getDepartureReadinessSummary,
  getTripEssentialItems,
  resetAllEssentialItemsForTrip,
  toggleEssentialItemChecked,
  unverifyCriticalItem,
  updateTripEssentialItem,
  verifyCriticalItem,
} from '../database/queries/essentialQueries';
import { getTripByIdWithProgress } from '../database/queries/tripQueries';
import { AddCustomEssentialModal } from '../components/AddCustomEssentialModal';
import { CategoryBadge } from '../components/Badges';
import { ConfirmModal } from '../components/ConfirmModal';
import { CriticalVerifyModal } from '../components/CriticalVerifyModal';
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
  DepartureReadinessSummary,
  EssentialCategory,
  EssentialCategoryName,
  EssentialPriority,
  EssentialScope,
  RootStackParamList,
  TripEssentialItem,
  TripWithProgress,
} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'EssentialChecklist'>;
type StatusFilter = 'all' | 'missing' | 'critical' | 'verified';

export const EssentialChecklistScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { theme } = useAppTheme();
  const { notifyDataChanged, dataVersion } = useAppContext();
  const { tripId, initialCategory, initialFilter, openAddModal } = route.params;

  const [trip, setTrip] = useState<TripWithProgress | null>(null);
  const [items, setItems] = useState<TripEssentialItem[]>([]);
  const [categories, setCategories] = useState<EssentialCategory[]>([]);
  const [readiness, setReadiness] = useState<DepartureReadinessSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialFilter ?? 'all');
  const [categoryFilter, setCategoryFilter] = useState<EssentialCategoryName | 'All'>(
    initialCategory ?? 'All'
  );

  // Modals
  const [verifyModalItem, setVerifyModalItem] = useState<TripEssentialItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(Boolean(openAddModal));
  const [editingItem, setEditingItem] = useState<TripEssentialItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<TripEssentialItem | null>(null);
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);

  const reloadData = useCallback(async () => {
    try {
      const [tripData, itemsData, catData, readinessData] = await Promise.all([
        getTripByIdWithProgress(tripId),
        getTripEssentialItems(tripId),
        getAllEssentialCategories(),
        getDepartureReadinessSummary(tripId),
      ]);
      setTrip(tripData);
      setItems(itemsData);
      setCategories(catData);
      setReadiness(readinessData);
    } catch (err) {
      console.error('[EssentialChecklist] Reload failed:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    reloadData();
  }, [reloadData, dataVersion]);

  // Status Filter Options
  const statusOptions: FilterChipOption<StatusFilter>[] = useMemo(() => {
    const total = items.length;
    const missing = items.filter((i) => i.is_checked === 0).length;
    const critical = items.filter((i) => i.is_critical === 1).length;
    const verified = items.filter((i) => i.is_verified === 1).length;

    return [
      { label: 'All Items', value: 'all', count: total },
      { label: 'Missing / Unchecked', value: 'missing', count: missing },
      { label: 'Critical Only', value: 'critical', count: critical },
      { label: 'Verified', value: 'verified', count: verified },
    ];
  }, [items]);

  // Category Filter Options
  const categoryOptions: FilterChipOption<EssentialCategoryName | 'All'>[] = useMemo(() => {
    return [
      { label: 'All Categories', value: 'All' },
      ...categories.map((c) => ({ label: c.name, value: c.name })),
    ];
  }, [categories]);

  // Filtered list
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      if (statusFilter === 'missing' && item.is_checked !== 0) return false;
      if (statusFilter === 'critical' && item.is_critical !== 1) return false;
      if (statusFilter === 'verified' && item.is_verified !== 1) return false;

      if (categoryFilter !== 'All' && item.category_name !== categoryFilter) {
        return false;
      }

      if (q.length > 0) {
        const matchesName = item.item_name.toLowerCase().includes(q);
        const matchesNotes = item.notes.toLowerCase().includes(q);
        const matchesCat = item.category_name.toLowerCase().includes(q);
        return matchesName || matchesNotes || matchesCat;
      }

      return true;
    });
  }, [items, statusFilter, categoryFilter, searchQuery]);

  // Separate into General Essentials and Trip-Specific Essentials
  const generalItems = useMemo(
    () => filteredItems.filter((i) => i.scope !== 'trip_specific'),
    [filteredItems]
  );
  const tripSpecificItems = useMemo(
    () => filteredItems.filter((i) => i.scope === 'trip_specific'),
    [filteredItems]
  );

  // Item interaction handlers
  const handleToggleCheck = async (item: TripEssentialItem) => {
    // If critical and being checked for the first time, prompt for physical verification
    if (item.is_critical === 1 && item.is_checked === 0 && item.is_verified === 0) {
      setVerifyModalItem(item);
      return;
    }

    await toggleEssentialItemChecked(item.id);
    await reloadData();
    await notifyDataChanged();
  };

  const handleOpenVerifyModal = (item: TripEssentialItem) => {
    setVerifyModalItem(item);
  };

  const handleConfirmVerification = async () => {
    if (!verifyModalItem) return;
    await verifyCriticalItem(verifyModalItem.id);
    setVerifyModalItem(null);
    await reloadData();
    await notifyDataChanged();
  };

  const handleConfirmUnverification = async () => {
    if (!verifyModalItem) return;
    await unverifyCriticalItem(verifyModalItem.id);
    setVerifyModalItem(null);
    await reloadData();
    await notifyDataChanged();
  };

  const handleSaveCustomItem = async (payload: {
    item_name: string;
    category_id: number;
    notes: string;
    is_critical: number;
    priority: EssentialPriority;
    scope: EssentialScope;
  }) => {
    if (editingItem) {
      await updateTripEssentialItem(editingItem.id, payload);
    } else {
      await addTripEssentialItem({
        trip_id: tripId,
        ...payload,
        is_custom: 1,
      });
    }
    setEditingItem(null);
    await reloadData();
    await notifyDataChanged();
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirmItem) return;
    await deleteTripEssentialItem(deleteConfirmItem.id);
    setDeleteConfirmItem(null);
    await reloadData();
    await notifyDataChanged();
  };

  const handleResetChecklist = async () => {
    await resetAllEssentialItemsForTrip(tripId);
    setResetConfirmVisible(false);
    await reloadData();
    await notifyDataChanged();
  };

  const renderItemCard = (item: TripEssentialItem) => {
    const isChecked = item.is_checked === 1;
    const isVerified = item.is_verified === 1;
    const isCrit = item.is_critical === 1;

    return (
      <View
        key={item.id}
        style={[
          styles.itemCard,
          {
            backgroundColor: isVerified
              ? theme.colors.surfaceSubtle
              : isChecked
              ? theme.colors.surfaceSubtle
              : theme.colors.card,
            borderColor: isVerified
              ? theme.colors.accentMint
              : isCrit && !isChecked
              ? theme.colors.border
              : theme.colors.border,
          },
          theme.shadows.xs,
        ]}
      >
        <Pressable
          onPress={() => handleToggleCheck(item)}
          hitSlop={8}
          style={styles.checkHit}
        >
          <View
            style={[
              styles.checkboxCircle,
              {
                backgroundColor: isVerified
                  ? theme.colors.accentMint
                  : isChecked
                  ? theme.colors.secondaryBlue
                  : 'transparent',
                borderColor: isVerified
                  ? theme.colors.accentMint
                  : isChecked
                  ? theme.colors.secondaryBlue
                  : isCrit
                  ? theme.colors.danger
                  : theme.colors.mutedText,
              },
            ]}
          >
            {isVerified ? (
              <ShieldCheck size={14} color="#FFFFFF" strokeWidth={3} />
            ) : isChecked ? (
              <Check size={13} color="#FFFFFF" strokeWidth={3} />
            ) : null}
          </View>
        </Pressable>

        <View style={styles.itemMain}>
          <View style={styles.itemTitleRow}>
            <Text
              style={[
                styles.itemName,
                {
                  color: isChecked
                    ? theme.colors.secondaryText
                    : theme.colors.primaryText,
                  textDecorationLine: isChecked && !isCrit ? 'line-through' : 'none',
                },
              ]}
            >
              {item.item_name}
            </Text>
          </View>

          {/* Badges & Tags */}
          <View style={styles.badgeRow}>
            {isCrit ? (
              <View
                style={[
                  styles.priorityPill,
                  {
                    backgroundColor: isVerified
                      ? theme.colors.successSoft
                      : theme.colors.dangerSoft,
                  },
                ]}
              >
                {isVerified ? (
                  <ShieldCheck size={11} color={theme.colors.accentMint} />
                ) : (
                  <ShieldAlert size={11} color={theme.colors.danger} />
                )}
                <Text
                  style={[
                    styles.priorityPillText,
                    {
                      color: isVerified
                        ? theme.colors.accentMint
                        : theme.colors.danger,
                    },
                  ]}
                >
                  {isVerified ? 'VERIFIED' : 'CRITICAL'}
                </Text>
              </View>
            ) : item.priority === 'High' ? (
              <View
                style={[
                  styles.priorityPill,
                  { backgroundColor: theme.colors.warningSoft },
                ]}
              >
                <Text style={[styles.priorityPillText, { color: '#B45309' }]}>
                  HIGH
                </Text>
              </View>
            ) : null}

            <CategoryBadge
              name={item.category_name}
              color={item.category_color}
              iconName={item.category_icon}
              compact
            />

            {item.is_custom === 1 ? (
              <View
                style={[
                  styles.priorityPill,
                  { backgroundColor: theme.colors.infoSoft },
                ]}
              >
                <Text
                  style={[styles.priorityPillText, { color: theme.colors.secondaryBlue }]}
                >
                  CUSTOM
                </Text>
              </View>
            ) : null}
          </View>

          {item.notes ? (
            <Text
              numberOfLines={2}
              style={[styles.itemNotes, { color: theme.colors.secondaryText }]}
            >
              📝 {item.notes}
            </Text>
          ) : null}
        </View>

        {/* Right side verification & edit triggers */}
        <View style={styles.rightActions}>
          {isCrit ? (
            <Pressable
              onPress={() => handleOpenVerifyModal(item)}
              style={[
                styles.verifyActionBtn,
                {
                  backgroundColor: isVerified
                    ? theme.colors.successSoft
                    : theme.colors.dangerSoft,
                  borderColor: isVerified
                    ? theme.colors.accentMint
                    : theme.colors.danger,
                },
              ]}
            >
              {isVerified ? (
                <ShieldCheck size={14} color={theme.colors.accentMint} />
              ) : (
                <Shield size={14} color={theme.colors.danger} />
              )}
              <Text
                style={[
                  styles.verifyActionText,
                  {
                    color: isVerified
                      ? theme.colors.accentMint
                      : theme.colors.danger,
                  },
                ]}
              >
                {isVerified ? 'Verified' : 'Verify'}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => {
              setEditingItem(item);
              setShowAddModal(true);
            }}
            hitSlop={8}
            style={styles.iconBtn}
          >
            <Edit3 size={15} color={theme.colors.secondaryText} />
          </Pressable>

          {item.is_custom === 1 ? (
            <Pressable
              onPress={() => setDeleteConfirmItem(item)}
              hitSlop={8}
              style={styles.iconBtn}
            >
              <Trash2 size={15} color={theme.colors.danger} />
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title="Essential Checklist"
        subtitle={trip ? `${trip.trip_name} • ${trip.destination}` : 'Don’t Forget Mode'}
        onBack={() => navigation.goBack()}
        rightElement={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              onPress={() => setResetConfirmVisible(true)}
              style={[styles.headerBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
            >
              <RotateCcw size={16} color={theme.colors.secondaryText} />
            </Pressable>

            <Pressable
              onPress={() =>
                navigation.navigate('FinalDepartureCheck', { tripId })
              }
              style={[
                styles.headerReadinessPill,
                {
                  backgroundColor: readiness?.isFullyReady
                    ? theme.colors.successSoft
                    : theme.colors.infoSoft,
                },
              ]}
            >
              <ShieldCheck
                size={14}
                color={
                  readiness?.isFullyReady
                    ? theme.colors.accentMint
                    : theme.colors.secondaryBlue
                }
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '800',
                  color: readiness?.isFullyReady
                    ? theme.colors.accentMint
                    : theme.colors.secondaryBlue,
                }}
              >
                {readiness?.readinessPercentage ?? 0}%
              </Text>
            </Pressable>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search travel essentials (passport, keys, wallet)..."
        />

        {/* Status Filters */}
        <View style={{ marginTop: 8 }}>
          <FilterChips
            options={statusOptions}
            selectedValue={statusFilter}
            onSelect={setStatusFilter}
          />
        </View>

        {/* Category Filter Chips */}
        <View style={{ marginTop: 4 }}>
          <FilterChips
            options={categoryOptions}
            selectedValue={categoryFilter}
            onSelect={setCategoryFilter}
          />
        </View>

        {/* List Content */}
        {filteredItems.length === 0 ? (
          <EmptyState
            variant="empty-items"
            title="No Matching Belongings"
            description="Adjust your search or filter options, or add custom essential items for this trip."
            actionLabel="Add Custom Item"
            onAction={() => setShowAddModal(true)}
            secondaryActionLabel="Reset Filters"
            onSecondaryAction={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCategoryFilter('All');
            }}
          />
        ) : (
          <>
            {/* 1. General Travel Essentials */}
            {generalItems.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                    General Travel Essentials ({generalItems.length})
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.colors.secondaryText }]}>
                    Universal travel documents, payments, keys, and health items
                  </Text>
                </View>
                {generalItems.map(renderItemCard)}
              </View>
            ) : null}

            {/* 2. Trip-Specific Essentials */}
            {tripSpecificItems.length > 0 ? (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Compass size={16} color={theme.colors.secondaryBlue} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                      Trip-Specific Essentials ({tripSpecificItems.length})
                    </Text>
                  </View>
                  <Text style={[styles.sectionSubtitle, { color: theme.colors.secondaryText }]}>
                    Tailored specifically for {trip?.trip_type} and {trip?.destination_type} climate
                  </Text>
                </View>
                {tripSpecificItems.map(renderItemCard)}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions */}
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
          label="Add Belonging"
          onPress={() => {
            setEditingItem(null);
            setShowAddModal(true);
          }}
          variant="outline"
          icon={<Plus size={16} color={theme.colors.primaryText} />}
          style={{ flex: 1 }}
        />

        <PrimaryButton
          label="I'm Ready to Go"
          onPress={() =>
            navigation.navigate('FinalDepartureCheck', { tripId })
          }
          variant={readiness?.isFullyReady ? 'mint' : 'secondary'}
          icon={<ShieldCheck size={17} color="#FFFFFF" strokeWidth={2.4} />}
          style={{ flex: 1.4 }}
        />
      </View>

      {/* Physical Critical Item Verification Modal */}
      <CriticalVerifyModal
        visible={Boolean(verifyModalItem)}
        item={verifyModalItem}
        onVerify={handleConfirmVerification}
        onUnverify={handleConfirmUnverification}
        onClose={() => setVerifyModalItem(null)}
      />

      {/* Add / Edit Custom Essential Modal */}
      <AddCustomEssentialModal
        visible={showAddModal}
        categories={categories}
        editItem={editingItem}
        onSave={handleSaveCustomItem}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
      />

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        visible={Boolean(deleteConfirmItem)}
        tone="danger"
        title="Delete Essential Item?"
        message={`Permanently remove "${deleteConfirmItem?.item_name}" from this trip's Don't Forget list?`}
        confirmLabel="Delete Item"
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteConfirmItem(null)}
      />

      {/* Reset Checklist Confirmation Modal */}
      <ConfirmModal
        visible={resetConfirmVisible}
        tone="danger"
        title="Reset All Checklist Items?"
        message="This will reset all checked and verified states back to unchecked for this journey."
        confirmLabel="Reset All"
        onConfirm={handleResetChecklist}
        onCancel={() => setResetConfirmVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerReadinessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  sectionWrap: {
    marginTop: 6,
    gap: 8,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.2,
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  checkHit: {
    paddingRight: 11,
  },
  checkboxCircle: {
    width: 26,
    height: 26,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemMain: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemNotes: {
    fontSize: 11,
    marginTop: 4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.2,
  },
  verifyActionText: {
    fontSize: 11,
    fontWeight: '800',
  },
  iconBtn: {
    padding: 5,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderTopWidth: 1,
  },
});
