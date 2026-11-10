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
  Award,
  Calendar,
  Copy,
  Eye,
  ListChecks,
  MapPin,
} from 'lucide-react-native';
import { TRIP_TYPES } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { AnimatedPressableCard } from '../components/AnimatedPressableCard';
import { AnimatedProgressBar } from '../components/AnimatedProgressBar';
import { StatusBadge, TripTypeBadge } from '../components/Badges';
import { EmptyState } from '../components/EmptyState';
import {
  FilterChipOption,
  FilterChips,
  SearchBar,
} from '../components/SearchAndFilter';
import {
  MainTabParamList,
  RootStackParamList,
  TripType,
  TripWithProgress,
} from '../types';
import { formatDateRange } from '../utils/dateUtils';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'History'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { historyTrips } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TripType | 'All'>('All');
  const [sortNewest, setSortNewest] = useState(true);

  const typeOptions: FilterChipOption<TripType | 'All'>[] = useMemo(
    () => [
      { label: 'All Trip Types', value: 'All', count: historyTrips.length },
      ...TRIP_TYPES.map((t) => ({ label: t.label, value: t.value })),
    ],
    [historyTrips.length]
  );

  const summaryMetrics = useMemo(() => {
    const count = historyTrips.length;
    const avgCompletion =
      count === 0
        ? 0
        : Math.round(
            historyTrips.reduce((acc, t) => acc + t.progress_percentage, 0) /
              count
          );
    const totalPacked = historyTrips.reduce((acc, t) => acc + t.packed_items, 0);
    return { count, avgCompletion, totalPacked };
  }, [historyTrips]);

  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return historyTrips
      .filter((t) => {
        if (typeFilter !== 'All' && t.trip_type !== typeFilter) return false;
        if (q.length > 0) {
          return (
            t.destination.toLowerCase().includes(q) ||
            t.trip_name.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const cmp = a.return_date.localeCompare(b.return_date);
        return sortNewest ? -cmp : cmp;
      });
  }, [historyTrips, searchQuery, typeFilter, sortNewest]);

  const renderHistoryCard = ({ item }: { item: TripWithProgress }) => (
    <AnimatedPressableCard
      onPress={() => navigation.navigate('TripDetails', { tripId: item.id })}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        theme.shadows.sm,
      ]}
    >
      <View style={styles.topRow}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text
            numberOfLines={1}
            style={[styles.tripName, { color: theme.colors.primaryText }]}
          >
            {item.trip_name}
          </Text>
          <View style={styles.inlineRow}>
            <MapPin size={13} color={theme.colors.accentMint} />
            <Text
              numberOfLines={1}
              style={[styles.destText, { color: theme.colors.secondaryText }]}
            >
              {item.destination}
            </Text>
          </View>
        </View>
        <StatusBadge status="Completed" />
      </View>

      <View style={styles.metaPills}>
        <TripTypeBadge tripType={item.trip_type} />
        <View
          style={[
            styles.datePill,
            { backgroundColor: theme.colors.surfaceSubtle },
          ]}
        >
          <Calendar size={12} color={theme.colors.secondaryText} />
          <Text style={[styles.dateText, { color: theme.colors.secondaryText }]}>
            {formatDateRange(item.departure_date, item.return_date)} (
            {item.trip_duration}d)
          </Text>
        </View>
      </View>

      {/* Final Completion Block */}
      <View
        style={[
          styles.completionBox,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.completionLabels}>
          <Text
            style={[
              styles.completionMeta,
              { color: theme.colors.secondaryText },
            ]}
          >
            Packed {item.packed_items} of {item.total_items} items
          </Text>
          <Text
            style={[
              styles.completionPct,
              {
                color:
                  item.progress_percentage >= 100
                    ? theme.colors.accentMint
                    : theme.colors.secondaryBlue,
              },
            ]}
          >
            {item.progress_percentage}% Final Score
          </Text>
        </View>
        <AnimatedProgressBar percentage={item.progress_percentage} height={7} />
      </View>

      {/* History Actions */}
      <View style={styles.actionsRow}>
        <Pressable
          onPress={() =>
            navigation.navigate('TripDetails', { tripId: item.id })
          }
          style={[
            styles.actionChip,
            { backgroundColor: theme.colors.surfaceSubtle },
          ]}
        >
          <Eye size={14} color={theme.colors.primaryText} />
          <Text
            style={[styles.actionChipText, { color: theme.colors.primaryText }]}
          >
            Details
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            navigation.navigate('PackingChecklist', { tripId: item.id })
          }
          style={[
            styles.actionChip,
            { backgroundColor: theme.colors.surfaceSubtle },
          ]}
        >
          <ListChecks size={14} color={theme.colors.primaryText} />
          <Text
            style={[styles.actionChipText, { color: theme.colors.primaryText }]}
          >
            View List
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            navigation.navigate('CreateTrip', { reuseFromTripId: item.id })
          }
          style={[
            styles.reuseChip,
            { backgroundColor: theme.colors.infoSoft },
          ]}
        >
          <Copy size={14} color={theme.colors.secondaryBlue} />
          <Text
            style={[styles.reuseChipText, { color: theme.colors.secondaryBlue }]}
          >
            Reuse List
          </Text>
        </Pressable>
      </View>
    </AnimatedPressableCard>
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.primaryText }]}>
            Trip History
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondaryText }]}>
            Review past journeys & reuse proven packing lists
          </Text>
        </View>

        <Pressable
          onPress={() => setSortNewest((s) => !s)}
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
            {sortNewest ? 'Newest' : 'Oldest'}
          </Text>
        </Pressable>
      </View>

      {/* Summary Banner */}
      {historyTrips.length > 0 ? (
        <View
          style={[
            styles.summaryStrip,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
            theme.shadows.xs,
          ]}
        >
          <View style={styles.summaryItem}>
            <Award size={18} color={theme.colors.accentMint} />
            <Text style={[styles.sumValue, { color: theme.colors.primaryText }]}>
              {summaryMetrics.count}
            </Text>
            <Text style={[styles.sumLabel, { color: theme.colors.secondaryText }]}>
              Completed
            </Text>
          </View>
          <View
            style={[styles.vLine, { backgroundColor: theme.colors.border }]}
          />
          <View style={styles.summaryItem}>
            <Text style={[styles.sumValue, { color: theme.colors.secondaryBlue }]}>
              {summaryMetrics.avgCompletion}%
            </Text>
            <Text style={[styles.sumLabel, { color: theme.colors.secondaryText }]}>
              Avg Packed
            </Text>
          </View>
          <View
            style={[styles.vLine, { backgroundColor: theme.colors.border }]}
          />
          <View style={styles.summaryItem}>
            <Text style={[styles.sumValue, { color: theme.colors.primaryText }]}>
              {summaryMetrics.totalPacked}
            </Text>
            <Text style={[styles.sumLabel, { color: theme.colors.secondaryText }]}>
              Items Packed
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.controls}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search previous trips or destinations..."
        />
        <View style={{ marginTop: 10 }}>
          <FilterChips
            options={typeOptions}
            selectedValue={typeFilter}
            onSelect={setTypeFilter}
          />
        </View>
      </View>

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderHistoryCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          historyTrips.length === 0 ? (
            <EmptyState
              variant="empty-history"
              title="No Completed Trips Yet"
              description="Once a trip's return date passes or you mark a trip as Completed, it will appear here so you can review and reuse its checklist anytime."
              actionLabel="View Active Trips"
              onAction={() => navigation.navigate('MyTrips')}
            />
          ) : (
            <EmptyState
              variant="empty-search"
              title="No Historical Matches"
              description="No completed journeys match your search or trip type filter."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setTypeFilter('All');
              }}
            />
          )
        }
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
  title: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
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
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vLine: {
    width: 1,
    height: 28,
  },
  sumValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  sumLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  tripName: {
    fontSize: 17,
    fontWeight: '800',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  destText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  completionBox: {
    borderRadius: 14,
    padding: 12,
    marginTop: 13,
  },
  completionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  completionMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  completionPct: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 13,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 11,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reuseChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 11,
  },
  reuseChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
