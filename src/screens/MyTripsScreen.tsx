import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  ShieldAlert,
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
import { getDestinationImage } from '../constants/travelImages';
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
    const destImg = getDestinationImage(item.destination_type).thumbnail;

    return (
      <AnimatedPressableCard
        onPress={() => navigation.navigate('TripDetails', { tripId: item.id })}
        style={[
          styles.tripCard,
          {
            backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.78)' : theme.colors.card,
            borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
          },
          theme.shadows.sm,
        ]}
      >
        {/* Photo Banner with Glass Badges */}
        <View style={styles.cardPhotoBanner}>
          <Image
            source={{ uri: destImg }}
            style={styles.cardPhotoImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(15, 10, 30, 0.20)', 'rgba(15, 10, 30, 0.85)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.photoOverlayTop}>
            <TripTypeBadge tripType={item.trip_type} />
            <StatusBadge status={item.status} />
          </View>
        </View>

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
                <MapPin size={13} color={theme.colors.accentLime} />
                <Text
                  numberOfLines={1}
                  style={[styles.destText, { color: theme.colors.secondaryText }]}
                >
                  {item.destination}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoPillsRow}>
            <View
              style={[
                styles.miniInfoPill,
                {
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.surfaceSubtle,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                  borderWidth: 1,
                },
              ]}
            >
              <Calendar size={12} color={theme.colors.secondaryText} />
              <Text
                style={[styles.miniInfoText, { color: theme.colors.secondaryText }]}
              >
                {formatDateRange(item.departure_date, item.return_date)} ({item.trip_duration}d)
              </Text>
            </View>
            <View
              style={[
                styles.miniInfoPill,
                {
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.surfaceSubtle,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                  borderWidth: 1,
                },
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
                        ? theme.colors.accentLime
                        : theme.colors.primaryText,
                  },
                ]}
              >
                {item.progress_percentage}%
              </Text>
            </View>
            <AnimatedProgressBar
              percentage={item.progress_percentage}
              height={6}
              trackColor={theme.isDark ? 'rgba(255, 255, 255, 0.10)' : theme.colors.surfaceSubtle}
              fillColor={theme.colors.accentLime}
            />
          </View>

          {/* Card Footer Actions */}
          <View
            style={[
              styles.actionsRow,
              { borderTopColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : theme.colors.border },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
              <Pressable
                onPress={() =>
                  navigation.navigate('PackingChecklist', { tripId: item.id })
                }
                style={[
                  styles.checklistBtn,
                  {
                    backgroundColor: theme.isDark ? 'rgba(212, 255, 0, 0.16)' : theme.colors.infoSoft,
                    borderColor: theme.isDark ? 'rgba(212, 255, 0, 0.30)' : 'transparent',
                    borderWidth: 1,
                  },
                ]}
              >
                <CheckSquare size={14} color={theme.isDark ? theme.colors.accentLime : theme.colors.secondaryBlue} />
                <Text
                  style={[
                    styles.checklistBtnText,
                    { color: theme.isDark ? theme.colors.accentLime : theme.colors.secondaryBlue },
                  ]}
                >
                  List
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  navigation.navigate('DontForgetDashboard', { tripId: item.id })
                }
                style={[
                  styles.checklistBtn,
                  {
                    backgroundColor: theme.isDark ? 'rgba(168, 85, 247, 0.18)' : theme.colors.dangerSoft,
                    borderColor: theme.isDark ? 'rgba(168, 85, 247, 0.35)' : 'transparent',
                    borderWidth: 1,
                  },
                ]}
              >
                <ShieldAlert size={14} color={theme.isDark ? '#C084FC' : theme.colors.danger} />
                <Text
                  style={[
                    styles.checklistBtnText,
                    { color: theme.isDark ? '#C084FC' : theme.colors.danger },
                  ]}
                >
                  Don't Forget
                </Text>
              </Pressable>
            </View>

            <View style={styles.iconActions}>
              <Pressable
                onPress={() =>
                  navigation.navigate('CreateTrip', { editTripId: item.id })
                }
                hitSlop={8}
                style={[
                  styles.smallIconBtn,
                  { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.surfaceSubtle },
                ]}
              >
                <Edit3 size={14} color={theme.colors.primaryText} />
              </Pressable>

              <Pressable
                onPress={() => setTripToDelete(item)}
                hitSlop={8}
                style={[
                  styles.smallIconBtn,
                  { backgroundColor: theme.colors.dangerSoft },
                ]}
              >
                <Trash2 size={14} color={theme.colors.danger} />
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
      <View style={styles.containerConstrained}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.primaryText }]}>
              My Trips
            </Text>
            <Text style={[styles.headerSub, { color: theme.colors.secondaryText }]}>
              {trips.length} {trips.length === 1 ? 'journey' : 'journeys'} stored offline
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
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.card,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
                },
              ]}
            >
              <ArrowUpDown size={14} color={theme.colors.primaryText} />
              <Text style={[styles.sortText, { color: theme.colors.primaryText }]}>
                {sortOrder === 'asc' ? 'Soonest' : 'Latest'}
              </Text>
            </Pressable>

            {/* Neon Lime + Button (from Reference Image) */}
            <Pressable
              onPress={() => navigation.navigate('CreateTrip')}
              style={[
                styles.addFab,
                { backgroundColor: theme.colors.accentLime },
                theme.shadows.limeGlow,
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              ]}
            >
              <Plus size={22} color={theme.colors.limeText} strokeWidth={3} />
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
          <View style={{ marginTop: 8 }}>
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
            <EmptyState
              variant="empty-trips"
              title="Your Trip List Is Empty"
              description="Start planning your upcoming vacation, business trip, or mountain trek to unlock tailored packing checklists."
              actionLabel="Create New Trip"
              onAction={() => navigation.navigate('CreateTrip')}
            />
          }
        />
      </View>

      <ConfirmModal
        visible={Boolean(tripToDelete)}
        title="Delete Trip?"
        message={`Are you sure you want to remove "${tripToDelete?.trip_name}"? All associated checklist items will be permanently erased.`}
        confirmLabel="Delete Trip"
        cancelLabel="Keep Trip"
        isDestructive
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
  containerConstrained: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
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
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addFab: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsWrap: {
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 4,
  },
  tripCard: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardPhotoBanner: {
    height: 100,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-start',
    padding: 12,
  },
  cardPhotoImage: {
    ...StyleSheet.absoluteFill,
  },
  photoOverlayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardBody: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  tripName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  metaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  destText: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  miniInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  miniInfoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressWrap: {
    marginTop: 14,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressSub: {
    fontSize: 12,
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
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  checklistBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
