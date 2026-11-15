import React, { useMemo, useState } from 'react';
import {
  Image,
  Platform,
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
  ArrowRight,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Clock,
  Edit3,
  FileText,
  Globe,
  MapPin,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react-native';
import { AnimatedPressableCard } from '../components/AnimatedPressableCard';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import {
  deleteTrip,
  updateTripStatus,
} from '../database/queries/tripQueries';
import { useTripDetailsData } from '../hooks/usePackmate';
import { AnimatedProgressBar } from '../components/AnimatedProgressBar';
import { StatusBadge, TripTypeBadge } from '../components/Badges';
import { CircularProgressRing } from '../components/CircularProgressRing';
import { ConfirmModal } from '../components/ConfirmModal';
import { DynamicIcon } from '../components/DynamicIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { getDestinationImage } from '../constants/travelImages';
import { RootStackParamList } from '../types';
import { deriveTripStatus, formatDateRange } from '../utils/dateUtils';
import {
  calculateProgressFromItems,
  computeCategoryProgress,
} from '../utils/progressUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'TripDetails'>;

export const TripDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useAppTheme();
  const { categories, notifyDataChanged } = useAppContext();
  const { tripId } = route.params;

  const { trip, items, reload } = useTripDetailsData(tripId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const progress = useMemo(() => calculateProgressFromItems(items), [items]);
  const categoryBreakdown = useMemo(
    () =>
      computeCategoryProgress(items, categories).filter((c) => c.total > 0),
    [items, categories]
  );

  const handleToggleCompleted = async () => {
    if (!trip) return;
    const nextStatus =
      trip.status === 'Completed'
        ? deriveTripStatus(trip.departure_date, trip.return_date)
        : 'Completed';
    const resolved =
      trip.status === 'Completed' && nextStatus === 'Completed'
        ? 'Upcoming'
        : nextStatus;

    await updateTripStatus(trip.id, resolved);
    await reload();
    await notifyDataChanged();
  };

  const handleDeleteTrip = async () => {
    setDeleting(true);
    try {
      await deleteTrip(tripId);
      await notifyDataChanged();
      setShowDeleteConfirm(false);
      navigation.goBack();
    } finally {
      setDeleting(false);
    }
  };

  if (!trip) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.colors.background }]}
      >
        <ScreenHeader title="Trip Overview" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const destImg = getDestinationImage(trip.destination_type).uri;

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.containerConstrained}>
        <ScreenHeader
          title="Trip Details"
          subtitle={trip.destination}
          onBack={() => navigation.goBack()}
          rightElement={
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() =>
                  navigation.navigate('CreateTrip', { editTripId: trip.id })
                }
                style={[
                  styles.topIconBtn,
                  {
                    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.surfaceSubtle,
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
                  },
                ]}
              >
                <Edit3 size={16} color={theme.colors.primaryText} />
              </Pressable>
              <Pressable
                onPress={() => setShowDeleteConfirm(true)}
                style={[
                  styles.topIconBtn,
                  { backgroundColor: theme.colors.dangerSoft },
                ]}
              >
                <Trash2 size={16} color={theme.colors.danger} />
              </Pressable>
            </View>
          }
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Photographic Banner with Overlay (Reference Screen 3) */}
          <View style={styles.heroPhotoWrapper}>
            <Image
              source={{ uri: destImg }}
              style={styles.heroPhotoImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(11, 7, 24, 0.20)', 'rgba(11, 7, 24, 0.92)']}
              style={StyleSheet.absoluteFill}
            />

            {/* Overlaid Badges */}
            <View style={styles.heroOverlayContent}>
              <View style={styles.heroBadgesTop}>
                <StatusBadge status={trip.status} />
                <TripTypeBadge tripType={trip.trip_type} />
              </View>

              <View style={styles.heroOverlayBottom}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.heroOverlayTitle} numberOfLines={1}>
                    {trip.trip_name}
                  </Text>
                  <View style={styles.heroLocationRow}>
                    <MapPin size={13} color="#D4FF00" />
                    <Text style={styles.heroLocationText} numberOfLines={1}>
                      {trip.destination}
                    </Text>
                  </View>
                </View>

                <CircularProgressRing
                  percentage={progress.percentage}
                  size={76}
                  strokeWidth={7}
                  strokeColor={theme.colors.accentLime}
                  textColor="#FFFFFF"
                  sublabel="Done"
                />
              </View>
            </View>
          </View>

          {/* 3-Metric Progress Strip */}
          <View
            style={[
              styles.metricsBar,
              {
                backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.85)' : theme.colors.card,
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
              },
              theme.shadows.xs,
            ]}
          >
            <View style={styles.metricItem}>
              <Text style={[styles.metricNum, { color: theme.colors.accentLime }]}>
                {progress.packedItems}
              </Text>
              <Text style={[styles.metricLbl, { color: theme.colors.secondaryText }]}>
                Packed
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricNum, { color: '#FBBF24' }]}>
                {progress.remainingItems}
              </Text>
              <Text style={[styles.metricLbl, { color: theme.colors.secondaryText }]}>
                Remaining
              </Text>
            </View>
            <View style={[styles.metricDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricNum, { color: theme.colors.primaryText }]}>
                {progress.totalItems}
              </Text>
              <Text style={[styles.metricLbl, { color: theme.colors.secondaryText }]}>
                Total Items
              </Text>
            </View>
          </View>

          {/* Don't Forget Mode CTA for this specific trip */}
          <AnimatedPressableCard
            onPress={() =>
              navigation.navigate('DontForgetDashboard', { tripId: trip.id })
            }
            style={[
              styles.dontForgetDetailCard,
              {
                backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.85)' : theme.colors.card,
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
                marginBottom: 16,
              },
              theme.shadows.xs,
            ]}
          >
            <View style={styles.dontForgetDetailRow}>
              <View
                style={[
                  styles.dontForgetDetailIcon,
                  { backgroundColor: theme.isDark ? 'rgba(212, 255, 0, 0.15)' : theme.colors.dangerSoft },
                ]}
              >
                <ShieldAlert size={22} color={theme.isDark ? theme.colors.accentLime : theme.colors.danger} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <View style={styles.dontForgetDetailPill}>
                  <Sparkles size={11} color={theme.colors.accentLime} />
                  <Text style={[styles.dontForgetDetailPillText, { color: theme.colors.accentLime }]}>
                    TRAVEL SAFETY CHECKLIST
                  </Text>
                </View>
                <Text
                  style={[
                    styles.dontForgetDetailTitle,
                    { color: theme.colors.primaryText },
                  ]}
                >
                  Don't Forget Mode
                </Text>
                <Text
                  style={[
                    styles.dontForgetDetailSub,
                    { color: theme.colors.secondaryText },
                  ]}
                >
                  Verify passports, tickets, keys, wallet & medications before departure
                </Text>
              </View>
              <ArrowRight size={17} color={theme.colors.accentLime} />
            </View>
          </AnimatedPressableCard>

          {/* Journey Metadata Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.76)' : theme.colors.card,
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
              },
              theme.shadows.xs,
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.primaryText }]}>
              Journey Information
            </Text>

            <View style={styles.detailGrid}>
              <View
                style={[
                  styles.detailCell,
                  { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.surfaceSubtle },
                ]}
              >
                <Calendar size={15} color={theme.colors.secondaryBlue} />
                <Text style={[styles.cellLabel, { color: theme.colors.secondaryText }]}>
                  Travel Dates
                </Text>
                <Text style={[styles.cellValue, { color: theme.colors.primaryText }]}>
                  {formatDateRange(trip.departure_date, trip.return_date)}
                </Text>
              </View>

              <View
                style={[
                  styles.detailCell,
                  { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.surfaceSubtle },
                ]}
              >
                <Clock size={15} color={theme.colors.accentLime} />
                <Text style={[styles.cellLabel, { color: theme.colors.secondaryText }]}>
                  Duration
                </Text>
                <Text style={[styles.cellValue, { color: theme.colors.primaryText }]}>
                  {trip.trip_duration} {trip.trip_duration === 1 ? 'Day' : 'Days'}
                </Text>
              </View>

              <View
                style={[
                  styles.detailCell,
                  { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.surfaceSubtle },
                ]}
              >
                <Users size={15} color="#A855F7" />
                <Text style={[styles.cellLabel, { color: theme.colors.secondaryText }]}>
                  Travellers
                </Text>
                <Text style={[styles.cellValue, { color: theme.colors.primaryText }]}>
                  {trip.traveller_count} {trip.traveller_count === 1 ? 'Person' : 'People'}
                </Text>
              </View>

              <View
                style={[
                  styles.detailCell,
                  { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.surfaceSubtle },
                ]}
              >
                <Globe size={15} color="#38BDF8" />
                <Text style={[styles.cellLabel, { color: theme.colors.secondaryText }]}>
                  Environment
                </Text>
                <Text style={[styles.cellValue, { color: theme.colors.primaryText }]}>
                  {trip.destination_type}
                </Text>
              </View>
            </View>

            {trip.notes ? (
              <View
                style={[
                  styles.notesBox,
                  {
                    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.surfaceSubtle,
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.border,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <FileText size={14} color={theme.colors.secondaryText} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.secondaryText }}>
                    Trip Notes
                  </Text>
                </View>
                <Text style={[styles.notesBody, { color: theme.colors.primaryText }]}>
                  {trip.notes}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Category Progress Breakdown */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.76)' : theme.colors.card,
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
              },
              theme.shadows.xs,
            ]}
          >
            <View style={styles.catHeaderRow}>
              <Text style={[styles.cardTitle, { color: theme.colors.primaryText }]}>
                Category Breakdown
              </Text>
              <Pressable
                onPress={() =>
                  navigation.navigate('MainTabs', {
                    screen: 'Templates',
                    params: { targetTripId: trip.id },
                  })
                }
                style={styles.applyTplLink}
              >
                <Sparkles size={13} color={theme.colors.accentLime} />
                <Text style={[styles.applyTplText, { color: theme.colors.accentLime }]}>
                  Apply Template
                </Text>
              </Pressable>
            </View>

            {categoryBreakdown.length === 0 ? (
              <Text style={{ fontSize: 13, color: theme.colors.secondaryText }}>
                No items in this trip yet. Open the checklist or apply a packing template to track category progress.
              </Text>
            ) : (
              categoryBreakdown.map((cat) => (
                <View key={cat.category_id} style={styles.catRow}>
                  <View style={styles.catLabelLine}>
                    <View style={styles.catNameGroup}>
                      <DynamicIcon
                        name={cat.icon_name}
                        size={15}
                        color={cat.color_hex}
                      />
                      <Text style={[styles.catNameText, { color: theme.colors.primaryText }]}>
                        {cat.category_name}
                      </Text>
                    </View>
                    <Text style={[styles.catStatsText, { color: theme.colors.secondaryText }]}>
                      {cat.packed} / {cat.total} ({cat.percentage}%)
                    </Text>
                  </View>
                  <AnimatedProgressBar
                    percentage={cat.percentage}
                    height={6}
                    fillColor={cat.percentage >= 100 ? theme.colors.accentMint : theme.colors.accentLime}
                  />
                </View>
              ))
            )}
          </View>

          {/* Completion Status Toggle Action */}
          <Pressable
            onPress={handleToggleCompleted}
            style={[
              styles.statusToggleCard,
              {
                backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.76)' : theme.colors.card,
                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
              },
            ]}
          >
            <View style={styles.statusToggleIconWrap}>
              {trip.status === 'Completed' ? (
                <RotateCcw size={18} color="#FBBF24" />
              ) : (
                <CheckCircle2 size={18} color={theme.colors.accentLime} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusToggleTitle, { color: theme.colors.primaryText }]}>
                {trip.status === 'Completed' ? 'Reopen Journey' : 'Mark as Completed'}
              </Text>
              <Text style={[styles.statusToggleSubtitle, { color: theme.colors.secondaryText }]}>
                {trip.status === 'Completed'
                  ? 'Move this trip back to active status'
                  : 'Archive this trip and record in trip history'}
              </Text>
            </View>
          </Pressable>
        </ScrollView>

        {/* Sticky Bottom Action Bar (Reference Screen 3) */}
        <View
          style={[
            styles.bottomStickyBar,
            {
              backgroundColor: theme.isDark ? 'rgba(18, 12, 38, 0.95)' : theme.colors.card,
              borderTopColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
            },
          ]}
        >
          <PrimaryButton
            label="Open Packing Checklist"
            onPress={() =>
              navigation.navigate('PackingChecklist', { tripId: trip.id })
            }
            variant="lime"
            rightIcon={<ChevronRight size={18} color={theme.colors.limeText} strokeWidth={2.8} />}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      <ConfirmModal
        visible={showDeleteConfirm}
        title="Delete Trip?"
        message={`Are you sure you want to remove "${trip.trip_name}"? All associated checklist items will be permanently erased.`}
        confirmLabel="Delete Trip"
        cancelLabel="Keep Trip"
        isDestructive
        loading={deleting}
        onConfirm={handleDeleteTrip}
        onCancel={() => setShowDeleteConfirm(false)}
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
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 85,
  },
  heroPhotoWrapper: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  heroPhotoImage: {
    ...StyleSheet.absoluteFill,
  },
  heroOverlayContent: {
    ...StyleSheet.absoluteFill,
    padding: 16,
    justifyContent: 'space-between',
  },
  heroBadgesTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroOverlayBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroOverlayTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  heroLocationText: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricNum: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  metricLbl: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailCell: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
  },
  cellLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  cellValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  notesBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  notesBody: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  catHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  applyTplLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applyTplText: {
    fontSize: 12,
    fontWeight: '700',
  },
  catRow: {
    marginBottom: 14,
  },
  catLabelLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  catNameText: {
    fontSize: 13,
    fontWeight: '700',
  },
  catStatsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginBottom: 10,
  },
  statusToggleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusToggleTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusToggleSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  dontForgetDetailCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 16,
  },
  dontForgetDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dontForgetDetailIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dontForgetDetailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  dontForgetDetailPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  dontForgetDetailTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  dontForgetDetailSub: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});
