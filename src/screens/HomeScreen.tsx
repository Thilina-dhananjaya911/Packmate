import React from 'react';
import {
  Pressable,
  ScrollView,
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
  ArrowRight,
  Calendar,
  CheckCircle2,
  Compass,
  FolderCheck,
  Luggage,
  MapPin,
  Plus,
  Settings,
  Sparkles,
} from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { AnimatedPressableCard } from '../components/AnimatedPressableCard';
import { AnimatedProgressBar } from '../components/AnimatedProgressBar';
import { StatusBadge, TripTypeBadge } from '../components/Badges';
import { BrandMark } from '../components/BrandMark';
import { CircularProgressRing } from '../components/CircularProgressRing';
import { DynamicIcon } from '../components/DynamicIcon';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { MainTabParamList, RootStackParamList } from '../types';
import {
  formatDateRange,
  formatFullHeaderDate,
  getDaysUntilDeparture,
  getTimeGreeting,
} from '../utils/dateUtils';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const {
    dashboardStats,
    upcomingHeroTrip,
    recentTrips,
    templates,
  } = useAppContext();

  const greeting = getTimeGreeting();
  const todayLabel = formatFullHeaderDate();

  const renderHeroSection = () => {
    if (dashboardStats.totalTrips === 0) {
      return (
        <EmptyState
          variant="empty-trips"
          title="No Trips Planned Yet"
          description="Create your first trip and let PACKMATE automatically build a tailored packing checklist for your destination and travel dates."
          actionLabel="Create Your First Trip"
          onAction={() => navigation.navigate('CreateTrip')}
          secondaryActionLabel="Explore 8 Packing Templates"
          onSecondaryAction={() => navigation.navigate('Templates')}
        />
      );
    }

    if (!upcomingHeroTrip) {
      return (
        <LinearGradient
          colors={theme.colors.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, theme.shadows.md]}
        >
          <View style={styles.heroCompletedRow}>
            <View style={{ flex: 1, paddingRight: 14 }}>
              <View style={styles.heroPill}>
                <Sparkles size={12} color="#36C9A5" />
                <Text style={styles.heroPillText}>ALL TRIPS COMPLETED</Text>
              </View>
              <Text style={styles.heroTitle}>Ready for your next escape?</Text>
              <Text style={styles.heroMetaText}>
                You have completed {dashboardStats.completedTrips}{' '}
                {dashboardStats.completedTrips === 1 ? 'journey' : 'journeys'}. Start
                a new trip or reuse a proven list from History.
              </Text>
            </View>
          </View>
          <View style={styles.heroActionRow}>
            <PrimaryButton
              label="Create New Trip"
              onPress={() => navigation.navigate('CreateTrip')}
              variant="mint"
              compact
              icon={<Plus size={16} color="#FFF" />}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              label="View History"
              onPress={() => navigation.navigate('History')}
              variant="secondary"
              compact
              style={{ flex: 1 }}
            />
          </View>
        </LinearGradient>
      );
    }

    const daysAway = getDaysUntilDeparture(upcomingHeroTrip.departure_date);
    const countdownLabel =
      upcomingHeroTrip.status === 'Ongoing'
        ? 'Currently Travelling'
        : daysAway === 0
        ? 'Departing Today'
        : daysAway === 1
        ? 'Departs Tomorrow'
        : `In ${daysAway} Days`;

    return (
      <AnimatedPressableCard
        onPress={() =>
          navigation.navigate('TripDetails', { tripId: upcomingHeroTrip.id })
        }
      >
        <LinearGradient
          colors={theme.colors.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, theme.shadows.lg]}
        >
          <View style={styles.heroDecorCircle} />

          <View style={styles.heroTopRow}>
            <View style={styles.heroPill}>
              <View style={styles.heroPulseDot} />
              <Text style={styles.heroPillText}>
                {upcomingHeroTrip.status === 'Ongoing'
                  ? 'ONGOING TRIP'
                  : 'UPCOMING TRIP'}{' '}
                • {countdownLabel.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.heroDurationBadge}>
              {upcomingHeroTrip.trip_duration}{' '}
              {upcomingHeroTrip.trip_duration === 1 ? 'Day' : 'Days'}
            </Text>
          </View>

          <View style={styles.heroMainRow}>
            <View style={{ flex: 1, paddingRight: 14 }}>
              <Text numberOfLines={1} style={styles.heroTitle}>
                {upcomingHeroTrip.trip_name}
              </Text>
              <View style={styles.heroLocRow}>
                <MapPin size={14} color="#4C9AFF" />
                <Text numberOfLines={1} style={styles.heroDestination}>
                  {upcomingHeroTrip.destination}
                </Text>
              </View>
              <View style={styles.heroLocRow}>
                <Calendar size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.heroDateText}>
                  {formatDateRange(
                    upcomingHeroTrip.departure_date,
                    upcomingHeroTrip.return_date
                  )}
                </Text>
              </View>
            </View>

            <CircularProgressRing
              percentage={upcomingHeroTrip.progress_percentage}
              size={84}
              strokeWidth={8}
              subtitle="Packed"
              lightText
            />
          </View>

          {/* Progress Bar Block */}
          <View style={styles.heroProgressSection}>
            <View style={styles.heroProgressLabels}>
              <Text style={styles.heroProgressTitle}>Packing Progress</Text>
              <Text style={styles.heroProgressCount}>
                {upcomingHeroTrip.packed_items} / {upcomingHeroTrip.total_items} Items •{' '}
                {upcomingHeroTrip.progress_percentage}% Completed
              </Text>
            </View>
            <AnimatedProgressBar
              percentage={upcomingHeroTrip.progress_percentage}
              height={8}
              trackColor="rgba(255, 255, 255, 0.16)"
            />
          </View>

          <View style={styles.heroActionRow}>
            <Pressable
              onPress={() =>
                navigation.navigate('PackingChecklist', {
                  tripId: upcomingHeroTrip.id,
                })
              }
              style={styles.heroPrimaryBtn}
            >
              <CheckCircle2 size={16} color="#172B4D" strokeWidth={2.4} />
              <Text style={styles.heroPrimaryBtnText}>Open Checklist</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                navigation.navigate('TripDetails', {
                  tripId: upcomingHeroTrip.id,
                })
              }
              style={styles.heroSecondaryBtn}
            >
              <Text style={styles.heroSecondaryBtnText}>Trip Overview</Text>
              <ArrowRight size={15} color="#FFFFFF" />
            </Pressable>
          </View>
        </LinearGradient>
      </AnimatedPressableCard>
    );
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Brand & Greeting Header */}
        <View style={styles.headerRow}>
          <View style={styles.greetingLeft}>
            <Text style={[styles.dateText, { color: theme.colors.secondaryText }]}>
              {todayLabel}
            </Text>
            <Text style={[styles.greetingTitle, { color: theme.colors.primaryText }]}>
              {greeting}
            </Text>
            <Text
              style={[styles.greetingSubtitle, { color: theme.colors.secondaryText }]}
            >
              Ready for your next adventure?
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              style={[
                styles.iconButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
                theme.shadows.xs,
              ]}
            >
              <Settings size={20} color={theme.colors.primaryText} strokeWidth={2.1} />
            </Pressable>
            <BrandMark size={42} variant="navy" />
          </View>
        </View>

        {/* Create New Trip Action Banner */}
        <AnimatedPressableCard
          onPress={() => navigation.navigate('CreateTrip')}
          style={[
            styles.createBanner,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
            theme.shadows.sm,
          ]}
        >
          <View
            style={[
              styles.createIconWrap,
              { backgroundColor: theme.colors.secondaryBlue },
            ]}
          >
            <Plus size={22} color="#FFFFFF" strokeWidth={2.6} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.createTitle, { color: theme.colors.primaryText }]}>
              Create New Trip
            </Text>
            <Text style={[styles.createSub, { color: theme.colors.secondaryText }]}>
              Auto-generate smart offline packing suggestions
            </Text>
          </View>
          <ArrowRight size={18} color={theme.colors.secondaryBlue} />
        </AnimatedPressableCard>

        {/* Upcoming Trip Hero or Empty State */}
        <View style={styles.sectionBlock}>{renderHeroSection()}</View>

        {/* Dynamic SQLite Statistics Grid */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
            Travel & Packing Snapshot
          </Text>
          <View style={styles.statsRow}>
            <AnimatedPressableCard
              onPress={() => navigation.navigate('MyTrips')}
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
                theme.shadows.xs,
              ]}
            >
              <View
                style={[
                  styles.statIconBox,
                  { backgroundColor: theme.colors.infoSoft },
                ]}
              >
                <Compass size={18} color={theme.colors.secondaryBlue} />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.primaryText }]}>
                {dashboardStats.totalTrips}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
                Total Trips
              </Text>
            </AnimatedPressableCard>

            <AnimatedPressableCard
              onPress={() => navigation.navigate('History')}
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
                theme.shadows.xs,
              ]}
            >
              <View
                style={[
                  styles.statIconBox,
                  { backgroundColor: theme.colors.successSoft },
                ]}
              >
                <FolderCheck size={18} color={theme.colors.accentMint} />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.primaryText }]}>
                {dashboardStats.completedTrips}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
                Completed
              </Text>
            </AnimatedPressableCard>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
                theme.shadows.xs,
              ]}
            >
              <View
                style={[
                  styles.statIconBox,
                  { backgroundColor: theme.colors.warningSoft },
                ]}
              >
                <Luggage size={18} color="#D97706" />
              </View>
              <Text style={[styles.statNumber, { color: theme.colors.primaryText }]}>
                {dashboardStats.totalPackedItems}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.secondaryText }]}>
                Items Packed
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Destination Templates Strip */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
              Smart Packing Templates
            </Text>
            <Pressable onPress={() => navigation.navigate('Templates')}>
              <Text
                style={[styles.seeAllText, { color: theme.colors.secondaryBlue }]}
              >
                See All ({templates.length})
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templateStrip}
          >
            {templates.slice(0, 5).map((tpl) => (
              <AnimatedPressableCard
                key={tpl.id}
                onPress={() =>
                  navigation.navigate('TemplateDetails', { templateId: tpl.id })
                }
                style={[
                  styles.miniTplCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                  theme.shadows.xs,
                ]}
              >
                <View
                  style={[
                    styles.miniTplIcon,
                    { backgroundColor: `${tpl.accent_color}18` },
                  ]}
                >
                  <DynamicIcon
                    name={tpl.icon_name}
                    size={20}
                    color={tpl.accent_color}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[styles.miniTplName, { color: theme.colors.primaryText }]}
                >
                  {tpl.template_name}
                </Text>
                <Text
                  style={[styles.miniTplCount, { color: theme.colors.secondaryText }]}
                >
                  {tpl.item_count} curated items
                </Text>
              </AnimatedPressableCard>
            ))}
          </ScrollView>
        </View>

        {/* Recent Trip Activity */}
        {recentTrips.length > 0 ? (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                Recent Trip Activity
              </Text>
              <Pressable onPress={() => navigation.navigate('MyTrips')}>
                <Text
                  style={[styles.seeAllText, { color: theme.colors.secondaryBlue }]}
                >
                  Manage Trips
                </Text>
              </Pressable>
            </View>

            {recentTrips.map((trip) => (
              <AnimatedPressableCard
                key={trip.id}
                onPress={() =>
                  navigation.navigate('PackingChecklist', { tripId: trip.id })
                }
                style={[
                  styles.activityCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                  theme.shadows.xs,
                ]}
              >
                <View style={styles.activityTop}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.activityName,
                        { color: theme.colors.primaryText },
                      ]}
                    >
                      {trip.trip_name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.activitySub,
                        { color: theme.colors.secondaryText },
                      ]}
                    >
                      {trip.destination} •{' '}
                      {formatDateRange(trip.departure_date, trip.return_date)}
                    </Text>
                  </View>
                  <StatusBadge status={trip.status} />
                </View>

                <View style={styles.activityBottom}>
                  <TripTypeBadge tripType={trip.trip_type} />
                  <Text
                    style={[
                      styles.activityProgressLabel,
                      { color: theme.colors.primaryText },
                    ]}
                  >
                    {trip.packed_items}/{trip.total_items} packed (
                    {trip.progress_percentage}%)
                  </Text>
                </View>

                <View style={{ marginTop: 10 }}>
                  <AnimatedProgressBar percentage={trip.progress_percentage} height={6} />
                </View>
              </AnimatedPressableCard>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  greetingLeft: {
    flex: 1,
    paddingRight: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    gap: 13,
  },
  createIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  createSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionBlock: {
    marginTop: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  heroCard: {
    borderRadius: 26,
    padding: 22,
    overflow: 'hidden',
  },
  heroDecorCircle: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(76, 154, 255, 0.14)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  heroPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#36C9A5',
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  heroDurationBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#36C9A5',
    backgroundColor: 'rgba(54, 201, 165, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCompletedRow: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroMetaText: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.78)',
    marginTop: 6,
  },
  heroLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 7,
  },
  heroDestination: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  heroDateText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  heroProgressSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroProgressTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  heroProgressCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#36C9A5',
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroPrimaryBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 14,
  },
  heroPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#172B4D',
  },
  heroSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 12,
    borderRadius: 14,
  },
  heroSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  templateStrip: {
    gap: 12,
    paddingRight: 8,
  },
  miniTplCard: {
    width: 148,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  miniTplIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  miniTplName: {
    fontSize: 14,
    fontWeight: '700',
  },
  miniTplCount: {
    fontSize: 12,
    marginTop: 3,
  },
  activityCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    marginBottom: 10,
  },
  activityTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  activityName: {
    fontSize: 15,
    fontWeight: '800',
  },
  activitySub: {
    fontSize: 12,
    marginTop: 3,
  },
  activityBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  activityProgressLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
