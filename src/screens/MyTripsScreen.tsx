import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowUpDown,
  Calendar,
  CheckSquare,
  Edit3,
  MapPin,
  Plus,
  Trash2,
  Users,
} from 'lucide-react-native';
import { TRIP_TYPES } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { deleteTrip } from '../database/queries/tripQueries';
import { AnimatedPressableCard } from '../components/AnimatedPressableCard';
import { AnimatedProgressBar } from '../components/AnimatedProgressBar';
import { StatusBadge, TripTypeBadge } from '../components/Badges';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';
import { FilterChipOption, FilterChips, SearchBar } from '../components/SearchAndFilter';
import {
  MainTabParamList,
  RootStackParamList,
  TripStatus,
  TripType,
  TripWithProgress,
} from '../types';
import { formatDateRange } from '../utils/dateUtils';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'MyTrips'>,
  NativeStackScreenProps<RootStackParamList>
>;

type SortOrder = 'asc' | 'desc';

export const MyTripsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { trips, notifyDataChanged } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<TripType | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [tripToDelete, setTripToDelete] = useState<TripWithProgress | null>(null);
  const [deleting, setDeleting] = useState(false);

  const statusOptions: FilterChipOption<TripStatus | 'All'>[] = useMemo(
    () => [
      { label: 'All Status', value: 'All', count: trips.length },
      {
        label: 'Upcoming',
        value: 'Upcoming',
        count: trips.filter((t) => t.status === 'Upcoming').length,
      },
      {
        label: 'Ongoing',
        value: 'Ongoing',
        count: trips.filter((t) => t.status === 'Ongoing').length,
      },
      {
        label: 'Completed',
        value: 'Completed',
        count: trips.filter((t) => t.status === 'Completed').length,
      },
    ],
    [trips]
  );

  const typeOptions: FilterChipOption<TripType | 'All'>[] = useMemo(
    () => [
      { label: 'All Types', value: 'All' },
      ...TRIP_TYPES.map((t) => ({ label: t.label, value: t.value })),
    ],
    []
  );

  const filteredTrips = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return trips
      .filter((t) => {
        if (statusFilter !== 'All' && t.status !== statusFilter) return false;
        if (typeFilter !== 'All' && t.trip_type !== typeFilter) return false;
        if (q.length > 0) {
          const matchesName = t.trip_name.toLowerCase().includes(q);
          const matchesDest = t.destination.toLowerCase().includes(q);
          return matchesName || matchesDest;
        }
        return true;
      })
      .sort((a, b) => {
        const cmp = a.departure_date.localeCompare(b.departure_date);
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [trips, searchQuery, statusFilter, typeFilter, sortOrder]);

  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;
    setDeleting(true);
    try {
      await deleteTrip(tripToDelete.id);
      await notifyDataChanged();
      setTripToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const renderTripCard = ({ item }: { item: TripWithProgress }) => {
    const meta = TRIP_TYPES.find((t) => t.value === item.trip_type);
    const accent = meta?.accentColor ?? theme.colors.secondaryBlue;

    return (
      <AnimatedPressableCard
        onPress={() => navigation.navigate('TripDetails', { tripId: item.id })}
        style={[
          styles.tripCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
          theme.shadows.sm,
        ]}
      >
        {/* Top Accent Bar */}
        <View style={[styles.accentStrip, { backgroundColor: accent }]} />

        <View style={styles.cardBody}>
          <View style={styles.topRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text
                numberOfLines={1}
                style={[styles.tripName, { color: theme.colors.primaryText }]}
              >
                {item.trip_name}
              </Text>
              <View style={styles.metaInline}>
                <MapPin size={13} color={theme.colors.secondaryBlue} />
                <Text
                  numberOfLines={1}
                  style={[styles.destText, { color: theme.colors.secondaryText }]}
                >
                  {item.destination}
                </Text>
              </View>
            </View>
            <StatusBadge status={item.status} />
          </View>

          <View style={styles.infoPillsRow}>
            <TripTypeBadge tripType={item.trip_type} />
            <View
              style={[
                styles.miniInfoPill,
                { backgroundColor: theme.colors.surfaceSubtle },
              ]}
            >
              <Calendar size={12} color={theme.colors.secondaryText} />
              <Text
                style={[styles.miniInfoText, { color: theme.colors.secondaryText }]}
              >
                {formatDateRange(item.departure_date, item.return_date)} (
                {item.trip_duration}d)
              </Text>
            </View>
            <View
              style={[
                styles.miniInfoPill,
                { backgroundColor: theme.colors.surfaceSubtle },
              ]}
            >
              <Users size={12} color={theme.colors.secondaryText} />
              <Text
                style={[styles.miniInfoText, { color: theme.colors.secondaryText }]}
              >
                {item.traveller_count}
              </Text>
            </View>
          </View>

          {/* Progress Block */}
          <View style={styles.progressWrap}>
            <View style={styles.progressLabels}>
              <Text
                style={[styles.progressSub, { color: theme.colors.secondaryText }]}
              >
                {item.packed_items} of {item.total_items} items packed
              </Text>
              <Text
                style={[
                  styles.progressPercent,
                  {
                    color:
                      item.progress_percentage >= 100
                        ? theme.colors.accentMint
                        : theme.colors.primaryText,
                  },
                ]}
              >
                {item.progress_percentage}%
              </Text>
            </View>
            <AnimatedProgressBar percentage={item.progress_percentage} height={7} />
          </View>

          {/* Card Footer Actions */}
          <View
            style={[
              styles.actionsRow,
              { borderTopColor: theme.colors.border },
            ]}
          >
            <Pressable
              onPress={() =>
                navigation.navigate('PackingChecklist', { tripId: item.id })
              }
              style={[
                styles.checklistBtn,
                { backgroundColor: theme.colors.infoSoft },
              ]}
            >
              <CheckSquare size={15} color={theme.colors.secondaryBlue} />
              <Text
                style={[
                  styles.checklistBtnText,
                  { color: theme.colors.secondaryBlue },
                ]}
              >
                Packing List
              </Text>
            </Pressable>

            <View style={styles.iconActions}>
              <Pressable
                onPress={() =>
                  navigation.navigate('CreateTrip', { editTripId: item.id })
                }
                hitSlop={8}
                style={[
                  styles.smallIconBtn,
                  { backgroundColor: theme.colors.surfaceSubtle },
                ]}
              >
                <Edit3 size={15} color={theme.colors.primaryText} />
              </Pressable>

              <Pressable
                onPress={() => setTripToDelete(item)}
                hitSlop={8}
                style={[
                  styles.smallIconBtn,
                  { backgroundColor: theme.colors.dangerSoft },
                ]}
              >
                <Trash2 size={15} color={theme.colors.danger} />
              </Pressable>
            </View>
          </View>
        </View>
      </AnimatedPressableCard>
    );
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>
            My Trips
          </Text>
          <Text style={[styles.headerSub, { color: theme.colors.secondaryText }]}>
            {trips.length} {trips.length === 1 ? 'journey' : 'journeys'} stored
            offline
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={() =>
              setSortOrder((s) => (s === 'asc' ? 'desc' : 'asc'))
            }
            style={[
              styles.sortBtn,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <ArrowUpDown size={15} color={theme.colors.primaryText} />
            <Text style={[styles.sortText, { color: theme.colors.primaryText }]}>
              {sortOrder === 'asc' ? 'Soonest' : 'Latest'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('CreateTrip')}
            style={[
              styles.addFab,
              { backgroundColor: theme.colors.secondaryBlue },
              theme.shadows.blueGlow,
            ]}
          >
            <Plus size={21} color="#FFFFFF" strokeWidth={2.6} />
          </Pressable>
        </View>
      </View>

      {/* Search & Filters */}
      <View style={styles.controlsWrap}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search trips by name or destination..."
        />
        <View style={{ marginTop: 10 }}>
          <FilterChips
            options={statusOptions}
            selectedValue={statusFilter}
            onSelect={setStatusFilter}
          />
        </View>
        <View style={{ marginTop: 4 }}>
          <FilterChips
            options={typeOptions}
            selectedValue={typeFilter}
            onSelect={setTypeFilter}
          />
        </View>
      </View>

      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTripCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          trips.length === 0 ? (
            <EmptyState
              variant="empty-trips"
              title="Your Trip List Is Empty"
              description="Start planning your upcoming vacation, business trip, or mountain trek to unlock tailored packing checklists."
              actionLabel="Create New Trip"
              onAction={() => navigation.navigate('CreateTrip')}
            />
          ) : (
            <EmptyState
              variant="empty-search"
              title="No Matching Trips"
              description="No trips match your current search or filter criteria. Try clearing filters."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setTypeFilter('All');
              }}
            />
          )
        }
      />

      <ConfirmModal
        visible={Boolean(tripToDelete)}
        tone="danger"
        title="Delete Trip?"
        message={`Are you sure you want to permanently delete "${tripToDelete?.trip_name}" and all ${tripToDelete?.total_items ?? 0} packing items from SQLite?`}
        confirmLabel="Delete Trip"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTripToDelete(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addFab: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsWrap: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  tripCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  accentStrip: {
    height: 5,
    width: '100%',
  },
  cardBody: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  metaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  destText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  miniInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  miniInfoText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressWrap: {
    marginTop: 14,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  checklistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 11,
  },
  checklistBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallIconBtn: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
