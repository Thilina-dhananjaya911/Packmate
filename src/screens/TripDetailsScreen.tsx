import React, { useMemo, useState } from 'react';
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
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Copy,
  Edit3,
  FileText,
  Globe,
  MapPin,
  RotateCcw,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react-native';
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

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title="Trip Overview"
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
                { backgroundColor: theme.colors.surfaceSubtle },
              ]}
            >
              <Edit3 size={17} color={theme.colors.primaryText} />
            </Pressable>
            <Pressable
              onPress={() => setShowDeleteConfirm(true)}
              style={[
                styles.topIconBtn,
                { backgroundColor: theme.colors.dangerSoft },
              ]}
            >
              <Trash2 size={17} color={theme.colors.danger} />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Prominent Hero Progress Visualization Card */}
        <LinearGradient
          colors={theme.colors.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, theme.shadows.md]}
        >
          <View style={styles.heroTop}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <StatusBadge status={trip.status} />
              <Text style={styles.heroTripName}>{trip.trip_name}</Text>
              <View style={styles.heroMetaRow}>
                <MapPin size={14} color="#36C9A5" />
                <Text style={styles.heroDestText}>{trip.destination}</Text>
              </View>
            </View>

            <CircularProgressRing
              percentage={progress.percentage}
              size={112}
              strokeWidth={10}
              subtitle="Completed"
              lightText
            />
          </View>

          <View style={styles.heroStatsBanner}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatNum}>{progress.packedItems}</Text>
              <Text style={styles.heroStatLbl}>Packed Items</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatNum}>{progress.remainingItems}</Text>
              <Text style={styles.heroStatLbl}>Remaining</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatNum}>{progress.totalItems}</Text>
              <Text style={styles.heroStatLbl}>Total Items</Text>
            </View>
          </View>

          <Text style={styles.heroSummaryLine}>
            Packing Progress: {progress.percentage}% • {progress.packedItems} of{' '}
            {progress.totalItems} items packed.
          </Text>
        </LinearGradient>

        {/* Primary CTA to Packing Checklist */}
        <PrimaryButton
          label="Open Interactive Packing Checklist"
          onPress={() =>
            navigation.navigate('PackingChecklist', { tripId: trip.id })
          }
          variant="secondary"
          icon={<CheckSquare size={18} color="#FFFFFF" />}
        />

        {/* Trip Metadata Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
            theme.shadows.xs,
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.colors.primaryText }]}>
            Journey Details
          </Text>

          <View style={styles.detailGrid}>
            <View
              style={[
                styles.detailCell,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Calendar size={16} color={theme.colors.secondaryBlue} />
              <Text
                style={[styles.cellLabel, { color: theme.colors.secondaryText }]}
              >
                Travel Dates
              </Text>
              <Text
                style={[styles.cellValue, { color: theme.colors.primaryText }]}
              >
                {formatDateRange(trip.departure_date, trip.return_date)}
              </Text>
            </View>

            <View
              style={[
                styles.detailCell,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Clock size={16} color={theme.colors.accentMint} />
              <Text
                style={[styles.cellLabel, { color: theme.colors.secondaryText }]}
              >
                Duration
              </Text>
              <Text
                style={[styles.cellValue, { color: theme.colors.primaryText }]}
              >
                {trip.trip_duration}{' '}
                {trip.trip_duration === 1 ? 'Day' : 'Days'}
              </Text>
            </View>

            <View
              style={[
                styles.detailCell,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Users size={16} color="#8B5CF6" />
              <Text
                style={[styles.cellLabel, { color: theme.colors.secondaryText }]}
              >
                Travellers
              </Text>
              <Text
                style={[styles.cellValue, { color: theme.colors.primaryText }]}
              >
                {trip.traveller_count}{' '}
                {trip.traveller_count === 1 ? 'Person' : 'People'}
              </Text>
            </View>

            <View
              style={[
                styles.detailCell,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Globe size={16} color="#F59E0B" />
              <Text
                style={[styles.cellLabel, { color: theme.colors.secondaryText }]}
              >
                Environment
              </Text>
              <Text
                style={[styles.cellValue, { color: theme.colors.primaryText }]}
              >
                {trip.destination_type}
              </Text>
            </View>
          </View>

          <View style={styles.typeRow}>
            <Text style={[styles.cellLabel, { color: theme.colors.secondaryText }]}>
              Trip Style:
            </Text>
            <TripTypeBadge tripType={trip.trip_type} />
          </View>

          {trip.notes ? (
            <View
              style={[
                styles.notesBox,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <FileText size={14} color={theme.colors.secondaryText} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: theme.colors.secondaryText,
                  }}
                >
                  Trip Notes
                </Text>
              </View>
              <Text
                style={[styles.notesBody, { color: theme.colors.primaryText }]}
              >
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
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
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
              <Sparkles size={13} color={theme.colors.secondaryBlue} />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: theme.colors.secondaryBlue,
                }}
              >
                Apply Template
              </Text>
            </Pressable>
          </View>

          {categoryBreakdown.length === 0 ? (
            <Text style={{ fontSize: 13, color: theme.colors.secondaryText }}>
              No items in this trip yet. Open the checklist or apply a packing
              template to track category progress.
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
                    <Text
                      style={[
                        styles.catNameText,
                        { color: theme.colors.primaryText },
                      ]}
                    >
                      {cat.category_name}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.catStatsText,
                      { color: theme.colors.secondaryText },
                    ]}
                  >
                    {cat.packed}/{cat.total} ({cat.percentage}%)
                  </Text>
                </View>
                <AnimatedProgressBar
                  percentage={cat.percentage}
                  height={6}
                  fillColor={
                    cat.percentage >= 100
                      ? theme.colors.accentMint
                      : cat.color_hex
                  }
                />
              </View>
            ))
          )}
        </View>

        {/* Secondary Management Actions */}
        <View style={styles.secondaryActions}>
          <PrimaryButton
            label={
              trip.status === 'Completed'
                ? 'Reopen Trip as Active'
                : 'Mark Trip as Completed'
            }
            onPress={handleToggleCompleted}
            variant={trip.status === 'Completed' ? 'outline' : 'mint'}
            icon={
              trip.status === 'Completed' ? (
                <RotateCcw size={16} color={theme.colors.primaryText} />
              ) : (
                <CheckCircle2 size={16} color="#FFFFFF" />
              )
            }
          />

          <PrimaryButton
            label="Reuse Checklist for a New Trip"
            onPress={() =>
              navigation.navigate('CreateTrip', { reuseFromTripId: trip.id })
            }
            variant="outline"
            icon={<Copy size={16} color={theme.colors.primaryText} />}
          />

          <PrimaryButton
            label="Edit Trip Information"
            onPress={() =>
              navigation.navigate('CreateTrip', { editTripId: trip.id })
            }
            variant="outline"
            icon={<Edit3 size={16} color={theme.colors.primaryText} />}
          />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showDeleteConfirm}
        tone="danger"
        title="Delete Trip?"
        message={`Delete "${trip.trip_name}" and all ${progress.totalItems} packing items permanently?`}
        confirmLabel="Delete Trip"
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
  topIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  heroCard: {
    borderRadius: 26,
    padding: 22,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTripName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
    letterSpacing: -0.4,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  heroDestText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  heroStatsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 18,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  heroStatNum: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroStatLbl: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 2,
  },
  heroSummaryLine: {
    fontSize: 12,
    fontWeight: '600',
    color: '#36C9A5',
    marginTop: 12,
    textAlign: 'center',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailCell: {
    width: '48%',
    borderRadius: 15,
    padding: 13,
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
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  notesBox: {
    marginTop: 14,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  notesBody: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  catHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  applyTplLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 14,
  },
  catRow: {
    marginBottom: 13,
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
    fontWeight: '700',
  },
  secondaryActions: {
    gap: 10,
  },
});
