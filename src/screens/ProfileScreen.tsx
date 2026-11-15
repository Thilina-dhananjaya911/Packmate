import React, { useState } from 'react';
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
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Compass,
  Edit3,
  Globe,
  Info,
  Luggage,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react-native';
import { APP_INFO, LUGGAGE_TYPES, PROFILE_AVATARS, TRAVEL_STYLES } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import { AnimatedPressableCard } from '../components/AnimatedPressableCard';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { AvatarView } from '../components/AvatarView';
import { BrandMark } from '../components/BrandMark';
import { ConfirmModal } from '../components/ConfirmModal';
import { DynamicIcon } from '../components/DynamicIcon';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { MainTabParamList, RootStackParamList } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const {
    userProfile,
    profileStats,
    updateProfile,
    resetProfile,
  } = useAppContext();

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const selectedTravelStyleMeta = TRAVEL_STYLES.find(
    (s) => s.value === userProfile?.travelStyle
  ) ?? TRAVEL_STYLES[4];

  const selectedLuggageMeta = LUGGAGE_TYPES.find(
    (l) => l.value === userProfile?.luggageType
  ) ?? LUGGAGE_TYPES[0];

  const handleAvatarSelect = async (avatarId: string) => {
    try {
      await updateProfile({ avatar: avatarId });
    } catch (err) {
      console.error('[ProfileScreen] Failed to update avatar:', err);
    }
  };

  const handleConfirmReset = async () => {
    setResetting(true);
    try {
      await resetProfile();
      setShowResetConfirm(false);
      navigation.navigate('ProfileSetup');
    } catch (err) {
      console.error('[ProfileScreen] Failed to reset profile:', err);
    } finally {
      setResetting(false);
    }
  };

  if (!userProfile) {
    return (
      <SafeAreaView
        edges={['top']}
        style={[styles.safe, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <EmptyState
            variant="empty-search"
            title="No Local Profile Found"
            description="Create your personalized travel profile to store your home country, packing preferences, and default luggage weight limits completely offline."
            actionLabel="Create Profile"
            onAction={() => navigation.navigate('ProfileSetup')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header Row */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.screenHeading, { color: theme.colors.primaryText }]}>
              Traveler Profile
            </Text>
            <Text style={[styles.screenSubheading, { color: theme.colors.secondaryText }]}>
              Personalized offline travel workspace
            </Text>
          </View>
          <BrandMark size={36} variant="light" />
        </View>

        {/* Profile Hero Header Card */}
        <LinearGradient
          colors={theme.isDark ? ['#1A1035', '#2A1852', '#140D2E'] : theme.colors.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, theme.shadows.lg]}
        >
          <View style={styles.heroDecorCircle} />

          <View style={styles.heroTopRow}>
            <AvatarView
              avatarId={userProfile.avatar}
              name={userProfile.fullName}
              size={86}
              showEditBadge
              onPress={() => setShowAvatarPicker(true)}
            />

            <View style={styles.heroIdentity}>
              <View style={styles.heroPill}>
                <Sparkles size={11} color={theme.colors.accentLime} />
                <Text style={[styles.heroPillText, { color: theme.colors.accentLime }]}>
                  {userProfile.travelStyle.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.heroName} numberOfLines={1}>
                {userProfile.fullName}
              </Text>

              <View style={styles.heroMetaRow}>
                <MapPin size={13} color="#D4FF00" />
                <Text style={styles.heroCountry} numberOfLines={1}>
                  {userProfile.country}
                </Text>
              </View>

              {userProfile.email ? (
                <View style={styles.heroMetaRow}>
                  <Mail size={12} color="rgba(255, 255, 255, 0.70)" />
                  <Text style={styles.heroEmail} numberOfLines={1}>
                    {userProfile.email}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.heroActionRow}>
            <Pressable
              onPress={() => navigation.navigate('EditProfile')}
              style={({ pressed }) => [
                styles.heroEditBtn,
                {
                  backgroundColor: theme.colors.accentLime,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <Edit3 size={15} color={theme.colors.limeText} strokeWidth={2.4} />
              <Text style={[styles.heroEditBtnText, { color: theme.colors.limeText }]}>
                Edit Profile
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowAvatarPicker(true)}
              style={({ pressed }) => [
                styles.heroAvatarBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <User size={15} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.heroAvatarBtnText}>Change Avatar</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Profile Statistics Strip */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
            Travel & Packing Records
          </Text>
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.isDark ? '#160F2E' : theme.colors.card,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.statIconCircle,
                  { backgroundColor: theme.colors.infoSoft },
                ]}
              >
                <Compass size={16} color={theme.colors.secondaryBlue} strokeWidth={2.4} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.primaryText }]}>
                {profileStats.totalTrips}
              </Text>
              <Text style={[styles.statTitle, { color: theme.colors.secondaryText }]}>
                Total Trips
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.isDark ? '#160F2E' : theme.colors.card,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.statIconCircle,
                  { backgroundColor: theme.colors.successSoft },
                ]}
              >
                <CheckCircle2 size={16} color={theme.colors.accentLime} strokeWidth={2.4} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.primaryText }]}>
                {profileStats.completedTrips}
              </Text>
              <Text style={[styles.statTitle, { color: theme.colors.secondaryText }]}>
                Completed
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.isDark ? '#160F2E' : theme.colors.card,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.statIconCircle,
                  { backgroundColor: theme.colors.warningSoft },
                ]}
              >
                <Luggage size={16} color="#F59E0B" strokeWidth={2.4} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.primaryText }]}>
                {profileStats.totalPackedItems}
              </Text>
              <Text style={[styles.statTitle, { color: theme.colors.secondaryText }]}>
                Packed Items
              </Text>
            </View>
          </View>
        </View>

        {/* Travel Preferences Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.isDark ? '#160F2E' : theme.colors.card,
              borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : theme.colors.border,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWrap}>
              <Briefcase size={18} color={theme.colors.accentLime} />
              <Text style={[styles.cardTitle, { color: theme.colors.primaryText }]}>
                Travel Preferences
              </Text>
            </View>
            <Pressable onPress={() => navigation.navigate('EditProfile')}>
              <Text style={[styles.editLink, { color: theme.colors.accentLime }]}>
                Edit
              </Text>
            </Pressable>
          </View>

          <View style={styles.prefGrid}>
            <View
              style={[
                styles.prefItem,
                {
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.04)' : theme.colors.background,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.prefIconWrap,
                  { backgroundColor: `${selectedTravelStyleMeta.accentColor}25` },
                ]}
              >
                <DynamicIcon
                  name={selectedTravelStyleMeta.icon}
                  size={20}
                  color={selectedTravelStyleMeta.accentColor}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefItemTitle, { color: theme.colors.primaryText }]}>
                  {selectedTravelStyleMeta.label}
                </Text>
                <Text style={[styles.prefItemSub, { color: theme.colors.secondaryText }]}>
                  {selectedTravelStyleMeta.shortDesc}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.prefItem,
                {
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.04)' : theme.colors.background,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.prefIconWrap,
                  { backgroundColor: theme.colors.infoSoft },
                ]}
              >
                <Luggage size={20} color={theme.colors.secondaryBlue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefItemTitle, { color: theme.colors.primaryText }]}>
                  {selectedLuggageMeta.label}
                </Text>
                <Text style={[styles.prefItemSub, { color: theme.colors.secondaryText }]}>
                  {selectedLuggageMeta.shortDesc}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.prefItem,
                {
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.04)' : theme.colors.background,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.prefIconWrap,
                  { backgroundColor: theme.colors.warningSoft },
                ]}
              >
                <Scale size={20} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefItemTitle, { color: theme.colors.primaryText }]}>
                  Luggage Weight Limit
                </Text>
                <Text style={[styles.prefItemSub, { color: theme.colors.secondaryText }]}>
                  {userProfile.weightLimit} kg default airline luggage target
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information Details */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.isDark ? '#160F2E' : theme.colors.card,
              borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : theme.colors.border,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWrap}>
              <User size={18} color={theme.colors.accentLime} />
              <Text style={[styles.cardTitle, { color: theme.colors.primaryText }]}>
                Contact Details
              </Text>
            </View>
            <Pressable onPress={() => navigation.navigate('EditProfile')}>
              <Text style={[styles.editLink, { color: theme.colors.accentLime }]}>
                Edit
              </Text>
            </Pressable>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>
                Full Name
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.primaryText }]}>
                {userProfile.fullName}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : theme.colors.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>
                Home Country
              </Text>
              <View style={styles.valueWithIcon}>
                <Globe size={13} color={theme.colors.accentLime} />
                <Text style={[styles.infoValue, { color: theme.colors.primaryText }]}>
                  {userProfile.country}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : theme.colors.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>
                Email Address
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.primaryText }]}>
                {userProfile.email || 'Not provided'}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : theme.colors.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.secondaryText }]}>
                Phone Number
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.primaryText }]}>
                {userProfile.phone || 'Not provided'}
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Actions: About & Reset Profile */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.isDark ? '#160F2E' : theme.colors.card,
              borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : theme.colors.border,
            },
          ]}
        >
          <View style={styles.actionList}>
            <Pressable
              onPress={() => setShowAboutModal(true)}
              style={styles.actionItem}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: theme.colors.infoSoft },
                ]}
              >
                <ShieldCheck size={18} color={theme.colors.secondaryBlue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionText, { color: theme.colors.primaryText }]}>
                  Local Storage & Privacy
                </Text>
                <Text style={[styles.actionSub, { color: theme.colors.secondaryText }]}>
                  100% offline SQLite storage • Zero external trackers
                </Text>
              </View>
              <ChevronRight size={18} color={theme.colors.secondaryText} />
            </Pressable>

            <Pressable
              onPress={() => setShowResetConfirm(true)}
              style={[styles.actionItem, { borderBottomWidth: 0 }]}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: theme.colors.dangerSoft },
                ]}
              >
                <RotateCcw size={18} color={theme.colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionText, { color: theme.colors.danger }]}>
                  Reset User Profile
                </Text>
                <Text style={[styles.actionSub, { color: theme.colors.secondaryText }]}>
                  Clears local profile info only. Preserves all trips & packing lists.
                </Text>
              </View>
              <ChevronRight size={18} color={theme.colors.secondaryText} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        visible={showAvatarPicker}
        selectedAvatarId={userProfile.avatar}
        onSelect={handleAvatarSelect}
        onClose={() => setShowAvatarPicker(false)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        visible={showResetConfirm}
        title="Reset Local Profile?"
        message="This will reset your traveler profile and packing preferences. Your existing trips, packing checklists, and history will remain completely untouched."
        confirmLabel="Reset Profile"
        cancelLabel="Keep Profile"
        isDestructive
        loading={resetting}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* About Privacy Modal */}
      <ConfirmModal
        visible={showAboutModal}
        title="PACKMATE Architecture"
        message={`${APP_INFO.FULL_TITLE}\nVersion: ${APP_INFO.VERSION}\n\n100% Offline Architecture: All trips, profile details, and smart packing items are stored locally in SQLite without cloud dependencies.`}
        confirmLabel="Understood"
        tone="info"
        onConfirm={() => setShowAboutModal(false)}
      />
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
    paddingBottom: 36,
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  screenHeading: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  screenSubheading: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  heroCard: {
    borderRadius: 26,
    padding: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  heroDecorCircle: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(212, 255, 0, 0.08)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  heroIdentity: {
    flex: 1,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 6,
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  heroCountry: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  heroEmail: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  heroEditBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: 9999,
  },
  heroEditBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  heroAvatarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 11,
    borderRadius: 9999,
  },
  heroAvatarBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionBlock: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  editLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoList: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  valueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    height: 1,
  },
  prefGrid: {
    gap: 10,
  },
  prefItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  prefIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefItemTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  prefItemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  actionList: {
    marginTop: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: 12,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
