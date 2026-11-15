import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Compass,
  FileCheck,
  HeartPulse,
  Info,
  Key,
  MapPin,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
} from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import {
  generateAndSyncTripEssentials,
  getDepartureReadinessSummary,
  getForgetPreventionAlerts,
  getTripEssentialCategorySummaries,
} from '../database/queries/essentialQueries';
import { getTripByIdWithProgress } from '../database/queries/tripQueries';
import { AnimatedPressableCard } from '../components/AnimatedPressableCard';
import { AnimatedProgressBar } from '../components/AnimatedProgressBar';
import { CategoryBadge, StatusBadge } from '../components/Badges';
import { CircularProgressRing } from '../components/CircularProgressRing';
import { DynamicIcon } from '../components/DynamicIcon';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  DepartureReadinessSummary,
  EssentialCategorySummary,
  ForgetPreventionAlert,
  RootStackParamList,
  TripWithProgress,
} from '../types';
import { formatDateRange, getDaysUntilDeparture } from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'DontForgetDashboard'>;

export const DontForgetDashboardScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { theme } = useAppTheme();
  const { trips, upcomingHeroTrip, dataVersion } = useAppContext();

  // Active trips available for selection (Upcoming + Ongoing)
  const selectableTrips = useMemo(
    () => trips.filter((t) => t.status !== 'Completed'),
    [trips]
  );

  const initialTripId =
    route.params?.tripId ??
    (upcomingHeroTrip?.status !== 'Completed' ? upcomingHeroTrip?.id : null) ??
    (selectableTrips[0]?.id ?? null);

  const [selectedTripId, setSelectedTripId] = useState<number | null>(initialTripId);
  const [selectedTrip, setSelectedTrip] = useState<TripWithProgress | null>(null);
  const [readiness, setReadiness] = useState<DepartureReadinessSummary | null>(null);
  const [categories, setCategories] = useState<EssentialCategorySummary[]>([]);
  const [alerts, setAlerts] = useState<ForgetPreventionAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync / refresh data for currently selected trip
  const refreshDashboard = useCallback(async () => {
    if (!selectedTripId) {
      setSelectedTrip(null);
      setReadiness(null);
      setCategories([]);
      setAlerts([]);
      setLoading(false);
      return;
    }

    try {
      const trip = await getTripByIdWithProgress(selectedTripId);
      if (trip) {
        setSelectedTrip(trip);
        // Automatically ensure essential checklist items exist for this trip
        await generateAndSyncTripEssentials(trip);

        const [readinessData, catData, alertsData] = await Promise.all([
          getDepartureReadinessSummary(trip.id),
          getTripEssentialCategorySummaries(trip.id),
          getForgetPreventionAlerts(trip.id),
        ]);

        setReadiness(readinessData);
        setCategories(catData);
        setAlerts(alertsData);
      }
    } catch (err) {
      console.error('[DontForgetDashboard] Load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTripId]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard, dataVersion]);

  // Handle trip switch
  const handleSelectTrip = (id: number) => {
    setSelectedTripId(id);
    setLoading(true);
  };

  const daysAway = selectedTrip ? getDaysUntilDeparture(selectedTrip.departure_date) : 0;
  const departureBadge =
    selectedTrip?.status === 'Ongoing'
      ? 'Currently On Trip'
      : daysAway === 0
      ? 'Departing Today'
      : daysAway === 1
      ? 'Departs Tomorrow'
      : `Departs in ${daysAway} Days`;

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title="Don't Forget Mode"
        subtitle="Essential Travel Safety & Belongings Verification"
        onBack={() => navigation.goBack()}
        rightElement={
          selectedTrip ? (
            <Pressable
              onPress={() =>
                navigation.navigate('EssentialChecklist', {
                  tripId: selectedTrip.id,
                  openAddModal: true,
                })
              }
              style={[
                styles.topIconBtn,
                { backgroundColor: theme.colors.infoSoft },
              ]}
            >
              <Plus size={18} color={theme.colors.secondaryBlue} strokeWidth={2.4} />
            </Pressable>
          ) : null
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Trip Selector Bar */}
        {selectableTrips.length > 0 ? (
          <View style={styles.tripSelectorSection}>
            <Text style={[styles.selectorLabel, { color: theme.colors.secondaryText }]}>
              SELECT ACTIVE TRIP TO VERIFY:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tripChipsRow}
            >
              {selectableTrips.map((t) => {
                const active = t.id === selectedTripId;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => handleSelectTrip(t.id)}
                    style={[
                      styles.tripChip,
                      {
                        backgroundColor: active
                          ? theme.colors.primaryNavy
                          : theme.colors.card,
                        borderColor: active
                          ? theme.colors.primaryNavy
                          : theme.colors.border,
                      },
                      theme.shadows.xs,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tripChipText,
                        { color: active ? '#FFFFFF' : theme.colors.primaryText },
                      ]}
                    >
                      {t.trip_name}
                    </Text>
                    <Text
                      style={[
                        styles.tripChipSub,
                        {
                          color: active
                            ? 'rgba(255,255,255,0.75)'
                            : theme.colors.secondaryText,
                        },
                      ]}
                    >
                      {t.destination}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* If no trips exist in the app */}
        {!selectedTrip ? (
          <EmptyState
            variant="empty-trips"
            title="No Active Trips"
            description="Create an upcoming trip first to unlock the Don't Forget departure readiness checklist."
            actionLabel="Create New Trip"
            onAction={() => navigation.navigate('CreateTrip')}
          />
        ) : (
          <>
            {/* Departure Readiness Hero Card */}
            <LinearGradient
              colors={
                readiness?.isFullyReady
                  ? ['#0F5132', '#198754', '#20C997']
                  : theme.colors.heroGradient
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.readinessHero, theme.shadows.md]}
            >
              <View style={styles.heroTop}>
                <View style={{ flex: 1, paddingRight: 14 }}>
                  <View style={styles.pillBadge}>
                    <ShieldAlert size={13} color="#36C9A5" />
                    <Text style={styles.pillBadgeText}>
                      DEPARTURE READINESS • {departureBadge.toUpperCase()}
                    </Text>
                  </View>

                  <Text numberOfLines={1} style={styles.heroTripTitle}>
                    {selectedTrip.trip_name}
                  </Text>
                  <View style={styles.heroDestRow}>
                    <MapPin size={13} color="#4C9AFF" />
                    <Text numberOfLines={1} style={styles.heroDestText}>
                      {selectedTrip.destination}
                    </Text>
                  </View>
                </View>

                <CircularProgressRing
                  percentage={readiness?.readinessPercentage ?? 0}
                  size={104}
                  strokeWidth={9}
                  subtitle="Readiness"
                  lightText
                />
              </View>

              {/* Dynamic Readiness Metrics Grid */}
              <View style={styles.metricsStrip}>
                <View style={styles.metricCell}>
                  <Text style={styles.metricBigNum}>
                    {readiness?.checkedItems ?? 0}/{readiness?.totalItems ?? 0}
                  </Text>
                  <Text style={styles.metricSmallLabel}>Checked Items</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricCell}>
                  <Text
                    style={[
                      styles.metricBigNum,
                      {
                        color:
                          (readiness?.unverifiedCriticalItems ?? 0) === 0
                            ? '#36C9A5'
                            : '#F87171',
                      },
                    ]}
                  >
                    {readiness?.verifiedCriticalItems ?? 0}/
                    {readiness?.totalCriticalItems ?? 0}
                  </Text>
                  <Text style={styles.metricSmallLabel}>Critical Verified</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricCell}>
                  <Text
                    style={[
                      styles.metricBigNum,
                      {
                        color:
                          (readiness?.missingItems ?? 0) > 0
                            ? '#FBBF24'
                            : '#36C9A5',
                      },
                    ]}
                  >
                    {readiness?.missingItems ?? 0}
                  </Text>
                  <Text style={styles.metricSmallLabel}>Missing Left</Text>
                </View>
              </View>

              {/* Status callout */}
              <View style={styles.heroFooterStatus}>
                {readiness?.isFullyReady ? (
                  <View style={styles.statusSuccessRow}>
                    <ShieldCheck size={16} color="#FFFFFF" />
                    <Text style={styles.statusSuccessText}>
                      100% Ready to Go! All critical belongings verified.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.statusPendingRow}>
                    <AlertTriangle size={15} color="#FBBF24" />
                    <Text style={styles.statusPendingText}>
                      {readiness?.unverifiedCriticalItems ?? 0} critical items
                      unverified • {readiness?.missingItems ?? 0} items remaining
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>

            {/* Smart Forget-Prevention Alerts */}
            {alerts.length > 0 ? (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Bell size={17} color={theme.colors.secondaryBlue} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                      Forget-Prevention Alerts ({alerts.length})
                    </Text>
                  </View>
                </View>

                <View style={styles.alertsContainer}>
                  {alerts.map((alert) => {
                    const isCrit = alert.severity === 'critical';
                    const isWarn = alert.severity === 'warning';

                    return (
                      <AnimatedPressableCard
                        key={alert.id}
                        onPress={() =>
                          navigation.navigate('EssentialChecklist', {
                            tripId: selectedTrip.id,
                            initialFilter: isCrit ? 'critical' : 'missing',
                          })
                        }
                        style={[
                          styles.alertCard,
                          {
                            backgroundColor: isCrit
                              ? theme.colors.dangerSoft
                              : isWarn
                              ? theme.colors.warningSoft
                              : theme.colors.successSoft,
                            borderColor: isCrit
                              ? theme.colors.danger
                              : isWarn
                              ? theme.colors.warning
                              : theme.colors.accentMint,
                          },
                        ]}
                      >
                        <View style={styles.alertIconWrap}>
                          {isCrit ? (
                            <ShieldAlert size={20} color={theme.colors.danger} />
                          ) : isWarn ? (
                            <AlertCircle size={20} color={theme.colors.warning} />
                          ) : (
                            <CheckCircle2 size={20} color={theme.colors.accentMint} />
                          )}
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.alertTitle,
                              {
                                color: isCrit
                                  ? theme.colors.danger
                                  : isWarn
                                  ? '#B45309'
                                  : theme.colors.accentMint,
                              },
                            ]}
                          >
                            {alert.title}
                          </Text>
                          <Text
                            style={[
                              styles.alertMsg,
                              { color: theme.colors.primaryText },
                            ]}
                          >
                            {alert.message}
                          </Text>
                        </View>

                        <ArrowRight
                          size={16}
                          color={
                            isCrit
                              ? theme.colors.danger
                              : theme.colors.secondaryText
                          }
                        />
                      </AnimatedPressableCard>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Essential Category Readiness Cards */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                  Essential Categories Overview
                </Text>
                <Pressable
                  onPress={() =>
                    navigation.navigate('EssentialChecklist', {
                      tripId: selectedTrip.id,
                    })
                  }
                >
                  <Text style={[styles.seeAllLink, { color: theme.colors.secondaryBlue }]}>
                    Full Checklist
                  </Text>
                </Pressable>
              </View>

              <View style={styles.catGrid}>
                {categories.map((cat) => {
                  const catPct =
                    cat.total > 0 ? Math.round((cat.checked / cat.total) * 100) : 0;
                  const allDone = cat.total > 0 && cat.missing === 0;

                  return (
                    <AnimatedPressableCard
                      key={cat.category_id}
                      onPress={() =>
                        navigation.navigate('EssentialChecklist', {
                          tripId: selectedTrip.id,
                          initialCategory: cat.category_name,
                        })
                      }
                      style={[
                        styles.catCard,
                        {
                          backgroundColor: theme.colors.card,
                          borderColor: allDone
                            ? theme.colors.accentMint
                            : theme.colors.border,
                        },
                        theme.shadows.xs,
                      ]}
                    >
                      <View style={styles.catTopRow}>
                        <View
                          style={[
                            styles.catIconCircle,
                            { backgroundColor: `${cat.color_hex}18` },
                          ]}
                        >
                          <DynamicIcon
                            name={cat.icon_name}
                            size={18}
                            color={cat.color_hex}
                          />
                        </View>

                        {allDone ? (
                          <View
                            style={[
                              styles.catCheckBadge,
                              { backgroundColor: theme.colors.successSoft },
                            ]}
                          >
                            <Check size={13} color={theme.colors.accentMint} strokeWidth={3} />
                          </View>
                        ) : (
                          <Text
                            style={[
                              styles.catPctText,
                              { color: theme.colors.secondaryText },
                            ]}
                          >
                            {catPct}%
                          </Text>
                        )}
                      </View>

                      <Text
                        numberOfLines={1}
                        style={[styles.catName, { color: theme.colors.primaryText }]}
                      >
                        {cat.category_name}
                      </Text>

                      <Text style={[styles.catStats, { color: theme.colors.secondaryText }]}>
                        {cat.checked}/{cat.total} checked • {cat.missing} left
                      </Text>

                      <View style={{ marginTop: 8 }}>
                        <AnimatedProgressBar
                          percentage={catPct}
                          height={5}
                          fillColor={
                            allDone ? theme.colors.accentMint : cat.color_hex
                          }
                        />
                      </View>
                    </AnimatedPressableCard>
                  );
                })}
              </View>
            </View>

            {/* Departure Action CTAs */}
            <View style={styles.actionBlock}>
              <PrimaryButton
                label="I'm Ready to Go – Final Departure Check"
                onPress={() =>
                  navigation.navigate('FinalDepartureCheck', {
                    tripId: selectedTrip.id,
                  })
                }
                variant={readiness?.isFullyReady ? 'mint' : 'primary'}
                icon={<ShieldCheck size={18} color="#FFFFFF" strokeWidth={2.4} />}
              />

              <PrimaryButton
                label="Open Interactive Essential Checklist"
                onPress={() =>
                  navigation.navigate('EssentialChecklist', {
                    tripId: selectedTrip.id,
                  })
                }
                variant="secondary"
                icon={<CheckSquare size={17} color="#FFFFFF" strokeWidth={2.2} />}
              />

              <PrimaryButton
                label="Add Custom Essential Belonging"
                onPress={() =>
                  navigation.navigate('EssentialChecklist', {
                    tripId: selectedTrip.id,
                    openAddModal: true,
                  })
                }
                variant="outline"
                icon={<Plus size={16} color={theme.colors.primaryText} />}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  tripSelectorSection: {
    marginBottom: 4,
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  tripChipsRow: {
    gap: 8,
    paddingBottom: 4,
  },
  tripChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1.2,
    marginRight: 6,
    minWidth: 130,
  },
  tripChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  tripChipSub: {
    fontSize: 11,
    marginTop: 2,
  },
  readinessHero: {
    borderRadius: 26,
    padding: 20,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  heroTripTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroDestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  heroDestText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 18,
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  metricBigNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricSmallLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.76)',
    marginTop: 2,
  },
  heroFooterStatus: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    justifyContent: 'center',
  },
  statusSuccessText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusPendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    justifyContent: 'center',
  },
  statusPendingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FEF3C7',
  },
  sectionBlock: {
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  alertsContainer: {
    gap: 8,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 13,
  },
  alertIconWrap: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  alertMsg: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catCard: {
    width: '48.3%',
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 13,
  },
  catTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catPctText: {
    fontSize: 12,
    fontWeight: '800',
  },
  catName: {
    fontSize: 13,
    fontWeight: '800',
  },
  catStats: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  actionBlock: {
    gap: 10,
    marginTop: 6,
  },
});
