import React, { useCallback, useEffect, useState } from 'react';
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
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  MapPin,
  Plane,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import {
  getDepartureReadinessSummary,
  getTripEssentialItems,
  toggleEssentialItemChecked,
  verifyCriticalItem,
} from '../database/queries/essentialQueries';
import {
  getTripByIdWithProgress,
  updateTripStatus,
} from '../database/queries/tripQueries';
import { CategoryBadge } from '../components/Badges';
import { CircularProgressRing } from '../components/CircularProgressRing';
import { CriticalVerifyModal } from '../components/CriticalVerifyModal';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  DepartureReadinessSummary,
  RootStackParamList,
  TripEssentialItem,
  TripWithProgress,
} from '../types';
import { formatDateRange } from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'FinalDepartureCheck'>;

export const FinalDepartureCheckScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { theme } = useAppTheme();
  const { notifyDataChanged, dataVersion } = useAppContext();
  const { tripId } = route.params;

  const [trip, setTrip] = useState<TripWithProgress | null>(null);
  const [items, setItems] = useState<TripEssentialItem[]>([]);
  const [readiness, setReadiness] = useState<DepartureReadinessSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyModalItem, setVerifyModalItem] = useState<TripEssentialItem | null>(null);
  const [updatingTrip, setUpdatingTrip] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [tripData, itemsData, summaryData] = await Promise.all([
        getTripByIdWithProgress(tripId),
        getTripEssentialItems(tripId),
        getDepartureReadinessSummary(tripId),
      ]);
      setTrip(tripData);
      setItems(itemsData);
      setReadiness(summaryData);
    } catch (err) {
      console.error('[FinalDepartureCheck] Load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadData();
  }, [loadData, dataVersion]);

  // Split items
  const unverifiedCritical = items.filter(
    (i) => i.is_critical === 1 && i.is_verified === 0
  );
  const missingNonCritical = items.filter(
    (i) => i.is_critical === 0 && i.is_checked === 0
  );
  const verifiedAndChecked = items.filter(
    (i) => (i.is_critical === 1 && i.is_verified === 1) || (i.is_critical === 0 && i.is_checked === 1)
  );

  const isReady = readiness?.isFullyReady ?? false;

  const handleVerifyInline = (item: TripEssentialItem) => {
    setVerifyModalItem(item);
  };

  const handleConfirmVerification = async () => {
    if (!verifyModalItem) return;
    await verifyCriticalItem(verifyModalItem.id);
    setVerifyModalItem(null);
    await loadData();
    await notifyDataChanged();
  };

  const handleQuickCheck = async (item: TripEssentialItem) => {
    await toggleEssentialItemChecked(item.id, true);
    await loadData();
    await notifyDataChanged();
  };

  const handleMarkDeparted = async () => {
    if (!trip) return;
    setUpdatingTrip(true);
    try {
      await updateTripStatus(trip.id, 'Ongoing');
      await notifyDataChanged();
      navigation.navigate('MainTabs', { screen: 'Home' });
    } finally {
      setUpdatingTrip(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title="Final Departure Check"
        subtitle={trip ? `${trip.trip_name} • ${trip.destination}` : 'Ready to Go?'}
        onBack={() => navigation.goBack()}
        rightElement={
          <Pressable
            onPress={loadData}
            style={[styles.refreshBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
          >
            <RefreshCw size={16} color={theme.colors.secondaryText} />
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Readiness Status Hero */}
        <LinearGradient
          colors={
            isReady
              ? ['#0F5132', '#198754', '#20C997']
              : ['#172B4D', '#1F3B66', '#2A4E85']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.statusHero, theme.shadows.md]}
        >
          <View style={styles.heroTop}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View
                style={[
                  styles.pill,
                  {
                    backgroundColor: isReady
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(239,68,68,0.2)',
                  },
                ]}
              >
                {isReady ? (
                  <ShieldCheck size={14} color="#FFFFFF" strokeWidth={2.6} />
                ) : (
                  <ShieldAlert size={14} color="#F87171" strokeWidth={2.6} />
                )}
                <Text
                  style={[
                    styles.pillText,
                    { color: isReady ? '#FFFFFF' : '#FEF2F2' },
                  ]}
                >
                  {isReady
                    ? '100% VERIFIED & READY'
                    : 'INSPECTION REQUIRED'}
                </Text>
              </View>

              <Text style={styles.heroTitle}>
                {isReady
                  ? 'You Are 100% Departure Ready!'
                  : 'Hold On! Critical Items Unverified'}
              </Text>

              <Text style={styles.heroSub}>
                {isReady
                  ? 'All essential documents, funds, keys, electronics, and safety belongings have been verified.'
                  : 'Do NOT leave home before physically verifying critical travel belongings below.'}
              </Text>
            </View>

            <CircularProgressRing
              percentage={readiness?.readinessPercentage ?? 0}
              size={96}
              strokeWidth={9}
              subtitle="Score"
              lightText
            />
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>
                {readiness?.checkedItems ?? 0}/{readiness?.totalItems ?? 0}
              </Text>
              <Text style={styles.metricLbl}>Checked</Text>
            </View>
            <View style={styles.metricLine} />
            <View style={styles.metricItem}>
              <Text
                style={[
                  styles.metricVal,
                  { color: unverifiedCritical.length === 0 ? '#36C9A5' : '#F87171' },
                ]}
              >
                {readiness?.verifiedCriticalItems ?? 0}/{readiness?.totalCriticalItems ?? 0}
              </Text>
              <Text style={styles.metricLbl}>Critical Verified</Text>
            </View>
            <View style={styles.metricLine} />
            <View style={styles.metricItem}>
              <Text
                style={[
                  styles.metricVal,
                  { color: (readiness?.missingItems ?? 0) === 0 ? '#36C9A5' : '#FBBF24' },
                ]}
              >
                {readiness?.missingItems ?? 0}
              </Text>
              <Text style={styles.metricLbl}>Missing</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 1. Unverified Critical Items (TOP PRIORITY) */}
        {unverifiedCritical.length > 0 ? (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeadingRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShieldAlert size={18} color={theme.colors.danger} />
                <Text style={[styles.sectionTitle, { color: theme.colors.danger }]}>
                  Unverified Critical Belongings ({unverifiedCritical.length})
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: theme.colors.dangerSoft,
                  borderColor: theme.colors.danger,
                },
              ]}
            >
              <Text style={[styles.warningText, { color: theme.colors.danger }]}>
                Passports, tickets, wallets, keys, and medicines cannot easily be
                recovered if left behind. Tap "Verify" below to affirm you have
                physically packed each item.
              </Text>
            </View>

            <View style={styles.itemsList}>
              {unverifiedCritical.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.danger,
                    },
                    theme.shadows.xs,
                  ]}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.itemName, { color: theme.colors.primaryText }]}>
                      {item.item_name}
                    </Text>
                    <View style={styles.itemMeta}>
                      <CategoryBadge
                        name={item.category_name}
                        color={item.category_color}
                        iconName={item.category_icon}
                        compact
                      />
                      <Text style={[styles.unverifiedTag, { color: theme.colors.danger }]}>
                        • Physical check pending
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleVerifyInline(item)}
                    style={[
                      styles.verifyBtn,
                      {
                        backgroundColor: theme.colors.danger,
                      },
                    ]}
                  >
                    <ShieldCheck size={14} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.verifyBtnText}>Verify Now</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* 2. Missing Non-Critical Items */}
        {missingNonCritical.length > 0 ? (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeadingRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={18} color={theme.colors.warning} />
                <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                  Unchecked Travel Essentials ({missingNonCritical.length})
                </Text>
              </View>
            </View>

            <View style={styles.itemsList}>
              {missingNonCritical.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                    theme.shadows.xs,
                  ]}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.itemName, { color: theme.colors.primaryText }]}>
                      {item.item_name}
                    </Text>
                    <View style={styles.itemMeta}>
                      <CategoryBadge
                        name={item.category_name}
                        color={item.category_color}
                        iconName={item.category_icon}
                        compact
                      />
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleQuickCheck(item)}
                    style={[
                      styles.checkBtn,
                      {
                        backgroundColor: theme.colors.infoSoft,
                        borderColor: theme.colors.secondaryBlue,
                      },
                    ]}
                  >
                    <Check size={13} color={theme.colors.secondaryBlue} strokeWidth={2.8} />
                    <Text style={[styles.checkBtnText, { color: theme.colors.secondaryBlue }]}>
                      Check
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* 3. Verified Belongings List */}
        {verifiedAndChecked.length > 0 ? (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeadingRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={18} color={theme.colors.accentMint} />
                <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                  Successfully Verified Belongings ({verifiedAndChecked.length})
                </Text>
              </View>
            </View>

            <View style={styles.itemsList}>
              {verifiedAndChecked.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemCardDone,
                    {
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.doneIcon}>
                    {item.is_critical === 1 ? (
                      <ShieldCheck size={16} color={theme.colors.accentMint} strokeWidth={2.6} />
                    ) : (
                      <Check size={15} color={theme.colors.accentMint} strokeWidth={3} />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemNameDone, { color: theme.colors.secondaryText }]}>
                      {item.item_name}
                    </Text>
                    <Text style={[styles.itemSubDone, { color: theme.colors.mutedText }]}>
                      {item.is_critical === 1 ? 'Physically verified & packed' : 'Checked'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Final Actions */}
        <View style={styles.finalActionsWrap}>
          {isReady ? (
            <>
              <PrimaryButton
                label="Depart Now – Mark Trip as Ongoing"
                onPress={handleMarkDeparted}
                variant="mint"
                loading={updatingTrip}
                icon={<Plane size={18} color="#FFFFFF" strokeWidth={2.4} />}
              />
              <PrimaryButton
                label="Return to Dashboard"
                onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                variant="outline"
              />
            </>
          ) : (
            <>
              <PrimaryButton
                label="Review in Essential Checklist"
                onPress={() =>
                  navigation.navigate('EssentialChecklist', { tripId })
                }
                variant="secondary"
              />
              <PrimaryButton
                label="Back to Don't Forget Dashboard"
                onPress={() => navigation.goBack()}
                variant="outline"
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Critical Verification Modal */}
      <CriticalVerifyModal
        visible={Boolean(verifyModalItem)}
        item={verifyModalItem}
        onVerify={handleConfirmVerification}
        onClose={() => setVerifyModalItem(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  statusHero: {
    borderRadius: 24,
    padding: 20,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 10,
    marginTop: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLine: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricLbl: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  sectionWrap: {
    gap: 8,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  warningBox: {
    borderRadius: 14,
    borderWidth: 1.2,
    padding: 12,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  itemsList: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1.3,
    padding: 13,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  unverifiedTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 11,
  },
  verifyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1.2,
  },
  checkBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  itemCardDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  doneIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNameDone: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemSubDone: {
    fontSize: 11,
    marginTop: 1,
  },
  finalActionsWrap: {
    gap: 10,
    marginTop: 8,
  },
});
