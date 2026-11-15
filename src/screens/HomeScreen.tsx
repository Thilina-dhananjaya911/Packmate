import React, { useEffect, useState } from 'react';
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
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Compass,
  FolderCheck,
  Heart,
  Luggage,
  MapPin,
  Plus,
  Settings,
  Sparkles,
  Star,
  User,
} from 'lucide-react-native';
import { useAppContext } from '../context/AppContext';
import { RADIUS, useAppTheme } from '../context/ThemeContext';
import { getSetting } from '../database/queries/settingsQueries';
import { AnimatedPressableCard } from '../components/AnimatedPressableCard';
import { AnimatedProgressBar } from '../components/AnimatedProgressBar';
import { GlassPillBadge, StatusBadge, TripTypeBadge } from '../components/Badges';
import { BrandMark, HologramOrb } from '../components/BrandMark';
import { CircularProgressRing } from '../components/CircularProgressRing';
import { DynamicIcon } from '../components/DynamicIcon';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { DESTINATION_IMAGES, getDestinationImage, getTemplateImage } from '../constants/travelImages';
import { MainTabParamList, RootStackParamList, TripType } from '../types';
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

type FilterCategory = 'All' | 'Beach' | 'Mountain' | 'Camping' | 'City';

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const {
    dashboardStats,
    upcomingHeroTrip,
    recentTrips,
    templates,
    dataVersion,
    userProfile,
  } = useAppContext();

  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('All');
  const travelerName = userProfile?.fullName || 'Alex Traveler';

  const greeting = getTimeGreeting();
  const todayLabel = formatFullHeaderDate();

  // Filter templates based on category pills from reference image
  const filteredTemplates = templates.filter((tpl) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Beach') return tpl.destination_type === 'Beach';
    if (selectedFilter === 'Mountain') return tpl.destination_type === 'Mountain';
    if (selectedFilter === 'Camping') return tpl.destination_type === 'Nature';
    if (selectedFilter === 'City') return tpl.destination_type === 'City';
    return true;
  });

  const renderHeroSection = () => {
    if (dashboardStats.totalTrips === 0) {
      // Inspired by Reference Image Middle Screen featured card
      const fallbackImg = DESTINATION_IMAGES.Beach.uri;
      return (
        <AnimatedPressableCard
          onPress={() => navigation.navigate('CreateTrip')}
          style={[styles.heroCardContainer, theme.shadows.lg]}
        >
          <View style={styles.heroImageWrapper}>
            <Image
              source={{ uri: fallbackImg }}
              style={styles.heroBackgroundImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(15, 10, 30, 0.25)', 'rgba(15, 10, 30, 0.88)']}
              style={StyleSheet.absoluteFill}
            />

            {/* Top Overlay Badges (Reference Image Style) */}
            <View style={styles.heroTopBadges}>
              <View style={styles.glassPill}>
                <Text style={styles.glassPillText}>All</Text>
              </View>
              <View style={styles.glassPill}>
                <Text style={styles.glassPillText}>3–7 Days</Text>
              </View>
              <View style={[styles.glassPill, styles.limePill]}>
                <Text style={styles.limePillText}>Smart Planner</Text>
              </View>
              <View style={styles.heartBtn}>
                <Sparkles size={14} color="#FFFFFF" />
              </View>
            </View>

            {/* Frosted Bottom Banner inside Card */}
            <View style={styles.heroGlassBanner}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.heroDestTitle} numberOfLines={1}>
                  Welcome to PACKMATE
                </Text>
                <View style={styles.heroMetaRow}>
                  <MapPin size={12} color="#D4FF00" />
                  <Text style={styles.heroMetaText} numberOfLines={1}>
                    Auto-generate smart offline packing lists
                  </Text>
                </View>
                <View style={styles.heroReviewsRow}>
                  <Star size={11} color="#FBBF24" fill="#FBBF24" />
                  <Text style={styles.heroReviewsText}>
                    100% Offline • 8 Destination Templates
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.heroArrowCircle,
                  { backgroundColor: theme.colors.accentLime },
                  theme.shadows.limeGlow,
                ]}
              >
                <ArrowRight size={18} color={theme.colors.limeText} strokeWidth={2.8} />
              </View>
            </View>
          </View>
        </AnimatedPressableCard>
      );
    }

    if (!upcomingHeroTrip) {
      return (
        <LinearGradient
          colors={theme.colors.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, styles.heroCardCompleted, theme.shadows.md]}
        >
          <View style={styles.heroCompletedRow}>
            <View style={{ flex: 1, paddingRight: 14 }}>
              <View style={styles.heroPill}>
                <Sparkles size={12} color="#D4FF00" />
                <Text style={styles.heroPillText}>ALL TRIPS COMPLETED</Text>
              </View>
              <Text style={styles.heroCompletedTitle}>
                You are all caught up!
              </Text>
              <Text style={styles.heroCompletedSub}>
                Ready for the next journey? Create a trip to unlock tailored packing suggestions.
              </Text>
              <PrimaryButton
                label="Plan Next Journey"
                onPress={() => navigation.navigate('CreateTrip')}
                variant="lime"
                compact
                style={{ alignSelf: 'flex-start', marginTop: 14 }}
              />
            </View>
            <CircularProgressRing
              percentage={100}
              size={82}
              strokeWidth={7}
              strokeColor={theme.colors.accentLime}
              textColor="#FFFFFF"
              sublabel="Done"
            />
          </View>
        </LinearGradient>
      );
    }

    // Active Upcoming Trip Hero Card with Destination Photography
    const tripImage = getDestinationImage(upcomingHeroTrip.destination_type).uri;
    const daysUntil = getDaysUntilDeparture(upcomingHeroTrip.departure_date);

    return (
      <AnimatedPressableCard
        onPress={() =>
          navigation.navigate('TripDetails', { tripId: upcomingHeroTrip.id })
        }
        style={[styles.heroCardContainer, theme.shadows.lg]}
      >
        <View style={styles.heroImageWrapper}>
          <Image
            source={{ uri: tripImage }}
            style={styles.heroBackgroundImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(15, 10, 30, 0.28)', 'rgba(15, 10, 30, 0.90)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Top Overlay Badges */}
          <View style={styles.heroTopBadges}>
            <View style={styles.glassPill}>
              <Text style={styles.glassPillText}>
                {daysUntil === 0
                  ? 'Departing Today'
                  : daysUntil > 0
                  ? `In ${daysUntil} Days`
                  : 'Ongoing'}
              </Text>
            </View>
            <View style={styles.glassPill}>
              <Text style={styles.glassPillText}>
                {upcomingHeroTrip.trip_duration} Days
              </Text>
            </View>
            <View style={[styles.glassPill, styles.limePill]}>
              <Text style={styles.limePillText}>
                {upcomingHeroTrip.trip_type}
              </Text>
            </View>
            <View style={styles.heartBtn}>
              <Heart size={14} color="#FFFFFF" fill="rgba(255, 255, 255, 0.2)" />
            </View>
          </View>

          {/* Frosted Bottom Banner inside Card */}
          <View style={styles.heroGlassBanner}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.heroDestTitle} numberOfLines={1}>
                {upcomingHeroTrip.trip_name}
              </Text>
              <View style={styles.heroMetaRow}>
                <MapPin size={12} color="#D4FF00" />
                <Text style={styles.heroMetaText} numberOfLines={1}>
                  {upcomingHeroTrip.destination} • {formatDateRange(upcomingHeroTrip.departure_date, upcomingHeroTrip.return_date)}
                </Text>
              </View>
              <View style={styles.heroReviewsRow}>
                <Star size={11} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.heroReviewsText}>
                  {upcomingHeroTrip.packed_items} / {upcomingHeroTrip.total_items} Packed ({upcomingHeroTrip.progress_percentage}%)
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() =>
                navigation.navigate('PackingChecklist', {
                  tripId: upcomingHeroTrip.id,
                })
              }
              style={[
                styles.heroArrowCircle,
                { backgroundColor: theme.colors.accentLime },
                theme.shadows.limeGlow,
              ]}
            >
              <ArrowRight size={18} color={theme.colors.limeText} strokeWidth={2.8} />
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.containerConstrained}>
          {/* Top Header Row matching Reference Screen 2 */}
          <View style={styles.headerRow}>
            <View style={styles.headerProfileRow}>
              {/* Profile Avatar */}
              <Pressable
                onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
                style={[
                  styles.avatarCircle,
                  { borderColor: theme.colors.accentLime },
                  theme.shadows.xs,
                ]}
              >
                <Text style={styles.avatarInitials}>
                  {travelerName
                    ? travelerName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'AT'}
                </Text>
              </Pressable>

              <View style={styles.greetingTextBlock}>
                <Text style={[styles.greetingCaption, { color: theme.colors.secondaryText }]}>
                  {greeting}
                </Text>
                <Text style={[styles.travelerNameText, { color: theme.colors.primaryText }]}>
                  {travelerName || 'Alex Traveler'}
                </Text>
              </View>
            </View>

            {/* Right Action Icons */}
            <View style={styles.headerRightActions}>
              <Pressable
                onPress={() => navigation.navigate('Settings')}
                style={[
                  styles.iconButtonFrosted,
                  {
                    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.card,
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
                  },
                ]}
              >
                <Settings size={18} color={theme.colors.primaryText} strokeWidth={2.2} />
              </Pressable>
              <BrandMark size={38} variant="navy" />
            </View>
          </View>

          {/* Prominent Header Title (Inspired by 'Seamless Travel Experience') */}
          <View style={styles.titleSection}>
            <Text style={[styles.mainHeroTitle, { color: theme.colors.primaryText }]}>
              Smart Travel
            </Text>
            <Text style={[styles.mainHeroTitleItalic, { color: theme.colors.secondaryBlue }]}>
              Experience
            </Text>
          </View>

          {/* Category Filter Pills (Reference Screen 2) */}
          <View style={styles.filterPillRow}>
            {(['All', 'Beach', 'Mountain', 'Camping', 'City'] as FilterCategory[]).map((cat) => {
              const active = selectedFilter === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedFilter(cat)}
                  style={[
                    styles.catPill,
                    {
                      backgroundColor: active
                        ? theme.colors.accentLime
                        : theme.isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : theme.colors.card,
                      borderColor: active
                        ? 'transparent'
                        : theme.isDark
                        ? 'rgba(255, 255, 255, 0.12)'
                        : theme.colors.border,
                    },
                    active ? theme.shadows.limeGlow : null,
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ]}
                >
                  <Text
                    style={[
                      styles.catPillLabel,
                      {
                        color: active
                          ? theme.colors.limeText
                          : theme.colors.secondaryText,
                        fontWeight: active ? '800' : '600',
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
              Popular Destination
            </Text>
            <Pressable onPress={() => navigation.navigate('Templates')}>
              <Text style={[styles.seeAllText, { color: theme.colors.secondaryText }]}>
                View All
              </Text>
            </Pressable>
          </View>

          {/* Featured Hero Card */}
          <View style={styles.heroSectionWrap}>{renderHeroSection()}</View>

          {/* Quick Action Shortcut Cards */}
          <View style={styles.quickActionsGrid}>
            <AnimatedPressableCard
              onPress={() => navigation.navigate('CreateTrip')}
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.76)' : theme.colors.card,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
                },
                theme.shadows.sm,
              ]}
            >
              <View
                style={[
                  styles.quickActionIconWrap,
                  { backgroundColor: theme.colors.accentLime },
                  theme.shadows.limeGlow,
                ]}
              >
                <Plus size={20} color={theme.colors.limeText} strokeWidth={3} />
              </View>
              <Text style={[styles.quickActionTitle, { color: theme.colors.primaryText }]}>
                Create New Trip
              </Text>
              <Text style={[styles.quickActionSubtitle, { color: theme.colors.secondaryText }]}>
                Auto-generate checklist
              </Text>
            </AnimatedPressableCard>

            <AnimatedPressableCard
              onPress={() => {
                if (upcomingHeroTrip) {
                  navigation.navigate('PackingChecklist', {
                    tripId: upcomingHeroTrip.id,
                  });
                } else {
                  navigation.navigate('Templates');
                }
              }}
              style={[
                styles.quickActionCard,
                {
                  backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.76)' : theme.colors.card,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
                },
                theme.shadows.sm,
              ]}
            >
              <View
                style={[
                  styles.quickActionIconWrap,
                  { backgroundColor: 'rgba(168, 85, 247, 0.20)' },
                ]}
              >
                <HologramOrb size={24} />
              </View>
              <Text style={[styles.quickActionTitle, { color: theme.colors.primaryText }]}>
                Don't Forget Mode
              </Text>
              <Text style={[styles.quickActionSubtitle, { color: theme.colors.secondaryText }]}>
                Essential trip checklist
              </Text>
            </AnimatedPressableCard>
          </View>

          {/* Travel & Packing Snapshot */}
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
                    backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.76)' : theme.colors.card,
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
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
                    backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.76)' : theme.colors.card,
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
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
                    backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.76)' : theme.colors.card,
                    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
                  },
                  theme.shadows.xs,
                ]}
              >
                <View
                  style={[
                    styles.statIconBox,
                    { backgroundColor: theme.colors.limeSoft },
                  ]}
                >
                  <Luggage size={18} color={theme.colors.accentLime} />
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

          {/* Smart Packing Templates Strip */}
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
              {filteredTemplates.slice(0, 6).map((tpl) => {
                const img = getTemplateImage(tpl.trip_type).thumbnail;
                return (
                  <AnimatedPressableCard
                    key={tpl.id}
                    onPress={() =>
                      navigation.navigate('TemplateDetails', { templateId: tpl.id })
                    }
                    style={[
                      styles.templatePhotoCard,
                      {
                        backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.85)' : theme.colors.card,
                        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
                      },
                      theme.shadows.sm,
                    ]}
                  >
                    <Image
                      source={{ uri: img }}
                      style={styles.templateThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.templateCardContent}>
                      <View style={styles.templateIconSmall}>
                        <DynamicIcon
                          name={tpl.icon_name}
                          size={15}
                          color={theme.colors.accentLime}
                        />
                      </View>
                      <Text
                        numberOfLines={1}
                        style={[styles.templateCardTitle, { color: theme.colors.primaryText }]}
                      >
                        {tpl.template_name}
                      </Text>
                      <Text
                        style={[styles.templateCardSub, { color: theme.colors.secondaryText }]}
                      >
                        {tpl.item_count} curated items
                      </Text>
                    </View>
                  </AnimatedPressableCard>
                );
              })}
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
                      backgroundColor: theme.isDark ? 'rgba(28, 19, 54, 0.76)' : theme.colors.card,
                      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : theme.colors.border,
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
                          styles.activityDest,
                          { color: theme.colors.secondaryText },
                        ]}
                      >
                        {trip.destination}
                      </Text>
                    </View>
                    <StatusBadge status={trip.status} />
                  </View>

                  <View style={styles.activityMetaRow}>
                    <View style={styles.activityMetaItem}>
                      <Calendar size={13} color={theme.colors.secondaryText} />
                      <Text
                        style={[
                          styles.activityMetaText,
                          { color: theme.colors.secondaryText },
                        ]}
                      >
                        {formatDateRange(trip.departure_date, trip.return_date)}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.activityProgressText,
                        { color: theme.colors.primaryText },
                      ]}
                    >
                      {trip.packed_items}/{trip.total_items} packed (
                      {trip.progress_percentage}%)
                    </Text>
                  </View>

                  <AnimatedProgressBar
                    percentage={trip.progress_percentage}
                    height={5}
                    trackColor={theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.surfaceSubtle}
                    fillColor={theme.colors.accentLime}
                  />
                </AnimatedPressableCard>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  containerConstrained: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E143E',
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#D4FF00',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  greetingTextBlock: {
    justifyContent: 'center',
  },
  greetingCaption: {
    fontSize: 12,
    fontWeight: '500',
  },
  travelerNameText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButtonFrosted: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginTop: 14,
    marginBottom: 16,
  },
  mainHeroTitle: {
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  mainHeroTitleItalic: {
    fontSize: 32,
    fontStyle: 'italic',
    fontWeight: '300',
    lineHeight: 38,
    letterSpacing: -0.4,
  },
  filterPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  catPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
  },
  catPillLabel: {
    fontSize: 13,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  heroSectionWrap: {
    marginBottom: 20,
  },
  heroCardContainer: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  heroImageWrapper: {
    height: 240,
    width: '100%',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 16,
  },
  heroBackgroundImage: {
    ...StyleSheet.absoluteFill,
  },
  heroTopBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  glassPill: {
    backgroundColor: 'rgba(20, 14, 40, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  glassPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  limePill: {
    backgroundColor: '#D4FF00',
    borderColor: 'transparent',
  },
  limePillText: {
    color: '#0A0618',
    fontSize: 11,
    fontWeight: '800',
  },
  heartBtn: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 14, 40, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGlassBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(22, 15, 46, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  heroDestTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  heroMetaText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  heroReviewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  heroReviewsText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  heroArrowCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 26,
    padding: 20,
  },
  heroCardCompleted: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  heroCompletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 255, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroPillText: {
    color: '#D4FF00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroCompletedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroCompletedSub: {
    fontSize: 13,
    color: '#CBD5E1',
    marginTop: 4,
    lineHeight: 18,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  quickActionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  quickActionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionBlock: {
    marginBottom: 24,
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
    alignItems: 'center',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  templateStrip: {
    gap: 12,
    paddingRight: 16,
  },
  templatePhotoCard: {
    width: 170,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  templateThumbnail: {
    width: '100%',
    height: 95,
  },
  templateCardContent: {
    padding: 12,
  },
  templateIconSmall: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 255, 0, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  templateCardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  templateCardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  activityCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  activityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '800',
  },
  activityDest: {
    fontSize: 12,
    marginTop: 2,
  },
  activityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activityMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  activityMetaText: {
    fontSize: 12,
  },
  activityProgressText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
