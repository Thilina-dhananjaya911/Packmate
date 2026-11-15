import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
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
import { getDestinationImage } from '../constants/travelImages';
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

  const renderHistoryCard = ({ item }: { item: TripWithProgress }) => {
    const destImg = getDestinationImage(item.destination_type).thumbnail;

    return (
      <AnimatedPressableCard
        onPress={() => navigation.navigate('TripDetails', { tripId: item.id })}
        style={[
          styles.card,
          {
            backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.78)' : theme.colors.card,
            borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
          },
          theme.shadows.sm,
        ]}
      >
        {/* Photo Banner with Badges */}
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
            <StatusBadge status="Completed" />
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
              <View style={styles.inlineRow}>
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

          <View style={styles.metaPills}>
            <View
              style={[
                styles.datePill,
                {
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.surfaceSubtle,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                  borderWidth: 1,
                },
              ]}
            >
              <Calendar size={12} color={theme.colors.secondaryText} />
              <Text style={[styles.dateText, { color: theme.colors.secondaryText }]}>
                {formatDateRange(item.departure_date, item.return_date)} ({item.trip_duration}d)
              </Text>
            </View>
          </View>

          {/* Final Completion Block */}
          <View
            style={[
              styles.completionBox,
              {
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.surfaceSubtle,
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                borderWidth: 1,
              },
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
                        ? theme.colors.accentLime
                        : theme.colors.secondaryBlue,
                  },
                ]}
              >
                {item.progress_percentage}% Final Score
              </Text>
            </View>
            <AnimatedProgressBar
              percentage={item.progress_percentage}
              height={6}
              trackColor={theme.isDark ? 'rgba(255, 255, 255, 0.10)' : theme.colors.border}
              fillColor={theme.colors.accentLime}
            />
          </View>

          {/* History Actions */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={() =>
                navigation.navigate('TripDetails', { tripId: item.id })
              }
              style={[
                styles.actionChip,
                {
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.surfaceSubtle,
                },
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
                {
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.surfaceSubtle,
                },
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
                {
                  backgroundColor: theme.colors.accentLime,
                },
                theme.shadows.limeGlow,
              ]}
            >
              <Copy size={13} color={theme.colors.limeText} />
              <Text
                style={[styles.reuseChipText, { color: theme.colors.limeText }]}
              >
                Reuse List
              </Text>
            </Pressable>
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
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.card,
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
              },
            ]}
          >
            <ArrowUpDown size={14} color={theme.colors.primaryText} />
            <Text style={[styles.sortText, { color: theme.colors.primaryText }]}>
              {sortNewest ? 'Newest' : 'Oldest'}
            </Text>
          </Pressable>
        </View>

        {/* 3-Metric Summary Banner */}
        <View
          style={[
            styles.summaryBanner,
            {
              backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.85)' : theme.colors.card,
              borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
            },
            theme.shadows.sm,
          ]}
        >
          <View style={styles.statCell}>
            <Text style={[styles.statNum, { color: theme.colors.accentLime }]}>
              {summaryMetrics.count}
            </Text>
            <Text style={[styles.statLbl, { color: theme.colors.secondaryText }]}>
              Completed Trips
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statCell}>
            <Text style={[styles.statNum, { color: '#FBBF24' }]}>
              {summaryMetrics.avgCompletion}%
            </Text>
            <Text style={[styles.statLbl, { color: theme.colors.secondaryText }]}>
              Avg. Completion
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statCell}>
            <Text style={[styles.statNum, { color: theme.colors.primaryText }]}>
              {summaryMetrics.totalPacked}
            </Text>
            <Text style={[styles.statLbl, { color: theme.colors.secondaryText }]}>
              Total Packed Items
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search previous trips or destinations..."
          />
          <View style={{ marginTop: 8 }}>
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
            <EmptyState
              variant="empty-history"
              title="No Completed Trips Yet"
              description="Once a trip's return date passes or you mark a trip as Completed, it will appear here so you can review and reuse its checklist anytime."
              actionLabel="View Active Trips"
              onAction={() => navigation.navigate('MyTrips')}
            />
          }
        />
      </View>
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
  title: {
    fontSize: 26,
    fontWeight: '900',
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
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 18,
    marginBottom: 10,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  statLbl: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  controls: {
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 4,
  },
  card: {
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
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  destText: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaPills: {
    marginTop: 10,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completionBox: {
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  completionLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  completionMeta: {
    fontSize: 12,
  },
  completionPct: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reuseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  reuseChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
