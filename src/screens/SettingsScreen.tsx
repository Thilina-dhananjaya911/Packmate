import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Check,
  Database,
  Edit3,
  Info,
  MapPin,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  User,
  UserCheck,
  X,
} from 'lucide-react-native';
import { APP_INFO } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import {
  clearUserApplicationData,
  getDatabaseInfo,
  getSetting,
  loadSampleDemoJourneys,
  setSetting,
} from '../database/queries/settingsQueries';
import { AvatarView } from '../components/AvatarView';
import { BrandMark } from '../components/BrandMark';
import { ConfirmModal } from '../components/ConfirmModal';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { DatabaseInfo, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, mode, setThemeMode } = useAppTheme();
  const { dataVersion, notifyDataChanged, resetOnboarding, userProfile } = useAppContext();

  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [loadingDemos, setLoadingDemos] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Traveler Profile State
  const [travelerName, setTravelerName] = useState('Alex Traveler');
  const [travelerStyle, setTravelerStyle] = useState('Smart Efficient Packer');
  const [travelerHome, setTravelerHome] = useState('Colombo, Sri Lanka');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [draftName, setDraftName] = useState('Alex Traveler');
  const [draftStyle, setDraftStyle] = useState('Smart Efficient Packer');
  const [draftHome, setDraftHome] = useState('Colombo, Sri Lanka');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setTravelerName(userProfile.fullName);
      setTravelerStyle(userProfile.travelStyle);
      setTravelerHome(userProfile.country);
      setDraftName(userProfile.fullName);
      setDraftStyle(userProfile.travelStyle);
      setDraftHome(userProfile.country);
    }
  }, [userProfile]);

  useEffect(() => {
    (async () => {
      const name = await getSetting('traveler_name');
      const style = await getSetting('traveler_style');
      const home = await getSetting('traveler_home');
      if (name) {
        setTravelerName(name);
        setDraftName(name);
      }
      if (style) {
        setTravelerStyle(style);
        setDraftStyle(style);
      }
      if (home) {
        setTravelerHome(home);
        setDraftHome(home);
      }
    })();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const finalName = draftName.trim() || 'Alex Traveler';
      const finalStyle = draftStyle.trim() || 'Smart Efficient Packer';
      const finalHome = draftHome.trim() || 'Local Hub';
      await setSetting('traveler_name', finalName);
      await setSetting('traveler_style', finalStyle);
      await setSetting('traveler_home', finalHome);
      setTravelerName(finalName);
      setTravelerStyle(finalStyle);
      setTravelerHome(finalHome);
      setShowProfileModal(false);
      setFeedbackModal({
        title: 'Profile Updated',
        message: 'Your traveler profile and packing preferences have been saved locally.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const loadDbStats = useCallback(async () => {
    const stats = await getDatabaseInfo();
    setDbInfo(stats);
  }, []);

  useEffect(() => {
    loadDbStats();
  }, [loadDbStats, dataVersion]);

  const handleReplayOnboarding = async () => {
    await resetOnboarding();
    navigation.navigate('Onboarding', { isReplay: true });
  };

  const handleLoadDemoJourneys = async () => {
    setLoadingDemos(true);
    try {
      const inserted = await loadSampleDemoJourneys();
      await notifyDataChanged();
      await loadDbStats();
      setFeedbackModal({
        title: inserted > 0 ? 'Sample Journeys Loaded' : 'Already Loaded',
        message:
          inserted > 0
            ? `Inserted ${inserted} sample trips (Upcoming, Ongoing, and Completed History) with realistic packing checklists into SQLite.`
            : 'All sample demo journeys are already present in your local database.',
      });
    } finally {
      setLoadingDemos(false);
    }
  };

  const handleConfirmClearData = async () => {
    setClearing(true);
    try {
      await clearUserApplicationData();
      await notifyDataChanged();
      await loadDbStats();
      setShowClearConfirm(false);
      setFeedbackModal({
        title: 'Local Data Cleared',
        message:
          'All user-created trips and packing checklists have been removed. Your 8 core packing templates and 7 categories remain intact.',
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title="Settings & Workspace"
        subtitle="Preferences, local SQLite storage & app info"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Brand Identity Card */}
        <View
          style={[
            styles.brandCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
            theme.shadows.sm,
          ]}
        >
          <BrandMark size={64} variant="navy" />
          <Text style={[styles.appName, { color: theme.colors.primaryText }]}>
            {APP_INFO.FULL_TITLE}
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.secondaryBlue }]}>
            {APP_INFO.TAGLINE}
          </Text>
          <View style={styles.versionRow}>
            <View
              style={[
                styles.offlineBadge,
                { backgroundColor: theme.colors.successSoft },
              ]}
            >
              <ShieldCheck size={13} color={theme.colors.accentMint} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color: theme.colors.accentMint,
                }}
              >
                100% Offline • Version {APP_INFO.VERSION}
              </Text>
            </View>
          </View>
        </View>

        {/* Traveler Profile Card */}
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
          <View style={styles.cardHeaderRow}>
            <UserCheck size={18} color={theme.colors.secondaryBlue} />
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.primaryText, marginBottom: 0, flex: 1 },
              ]}
            >
              Traveler Profile
            </Text>
            <Pressable
              onPress={() => navigation.navigate('EditProfile')}
              style={[
                styles.editProfileBtn,
                { backgroundColor: theme.colors.limeSoft },
              ]}
            >
              <Edit3 size={13} color={theme.colors.accentLime} />
              <Text
                style={[
                  styles.editProfileBtnText,
                  { color: theme.colors.accentLime },
                ]}
              >
                Edit Profile
              </Text>
            </Pressable>
          </View>

          <View style={styles.profileContentRow}>
            <View
              style={[
                styles.profileAvatarBox,
                {
                  backgroundColor: theme.isDark ? '#1C1338' : theme.colors.card,
                  borderColor: theme.colors.accentLime,
                },
              ]}
            >
              <Text style={[styles.profileAvatarInitials, { color: theme.colors.accentLime }]}>
                {travelerName
                  .split(' ')
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'TR'}
              </Text>
              <View
                style={[
                  styles.profileStatusDot,
                  { backgroundColor: theme.colors.accentLime },
                ]}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text
                style={[styles.profileNameText, { color: theme.colors.primaryText }]}
              >
                {travelerName}
              </Text>
              <View
                style={[
                  styles.styleBadge,
                  {
                    backgroundColor: theme.colors.limeSoft,
                    borderColor: 'rgba(212, 255, 0, 0.35)',
                    borderWidth: 1,
                  },
                ]}
              >
                <Sparkles size={11} color={theme.colors.accentLime} />
                <Text
                  style={[
                    styles.styleBadgeText,
                    { color: theme.colors.accentLime },
                  ]}
                >
                  {travelerStyle}
                </Text>
              </View>
              <View style={styles.homeBaseRow}>
                <MapPin size={12} color={theme.colors.secondaryText} />
                <Text
                  style={[styles.homeBaseText, { color: theme.colors.secondaryText }]}
                >
                  Home: {travelerHome}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme Preference */}
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
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
            Theme Preference
          </Text>
          <View style={styles.themeToggleRow}>
            <Pressable
              onPress={() => setThemeMode('light')}
              style={[
                styles.themeOption,
                {
                  backgroundColor:
                    mode === 'light'
                      ? theme.colors.infoSoft
                      : theme.colors.background,
                  borderColor:
                    mode === 'light'
                      ? theme.colors.secondaryBlue
                      : theme.colors.border,
                },
              ]}
            >
              <Sun
                size={18}
                color={
                  mode === 'light'
                    ? theme.colors.secondaryBlue
                    : theme.colors.secondaryText
                }
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color:
                    mode === 'light'
                      ? theme.colors.secondaryBlue
                      : theme.colors.primaryText,
                }}
              >
                Light Mode
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setThemeMode('dark')}
              style={[
                styles.themeOption,
                {
                  backgroundColor:
                    mode === 'dark'
                      ? theme.colors.infoSoft
                      : theme.colors.background,
                  borderColor:
                    mode === 'dark'
                      ? theme.colors.secondaryBlue
                      : theme.colors.border,
                },
              ]}
            >
              <Moon
                size={18}
                color={
                  mode === 'dark'
                    ? theme.colors.secondaryBlue
                    : theme.colors.secondaryText
                }
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color:
                    mode === 'dark'
                      ? theme.colors.secondaryBlue
                      : theme.colors.primaryText,
                }}
              >
                Dark Navy
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Local SQLite Database Diagnostics */}
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
          <View style={styles.cardHeaderRow}>
            <Database size={18} color={theme.colors.secondaryBlue} />
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.primaryText, marginBottom: 0 },
              ]}
            >
              Local SQLite Storage ({dbInfo?.databaseName ?? 'packmate.db'})
            </Text>
          </View>

          <View style={styles.dbMetricsGrid}>
            <View
              style={[
                styles.metricBox,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text
                style={[styles.metricValue, { color: theme.colors.primaryText }]}
              >
                {dbInfo?.tripCount ?? 0}
              </Text>
              <Text
                style={[styles.metricLabel, { color: theme.colors.secondaryText }]}
              >
                User Trips
              </Text>
            </View>

            <View
              style={[
                styles.metricBox,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text
                style={[styles.metricValue, { color: theme.colors.accentMint }]}
              >
                {dbInfo?.completedTripCount ?? 0}
              </Text>
              <Text
                style={[styles.metricLabel, { color: theme.colors.secondaryText }]}
              >
                History Trips
              </Text>
            </View>

            <View
              style={[
                styles.metricBox,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text
                style={[styles.metricValue, { color: theme.colors.secondaryBlue }]}
              >
                {dbInfo?.packingItemCount ?? 0}
              </Text>
              <Text
                style={[styles.metricLabel, { color: theme.colors.secondaryText }]}
              >
                Checklist Items
              </Text>
            </View>

            <View
              style={[
                styles.metricBox,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text
                style={[styles.metricValue, { color: theme.colors.primaryText }]}
              >
                {dbInfo?.templateCount ?? 8} / {dbInfo?.templateItemCount ?? 158}
              </Text>
              <Text
                style={[styles.metricLabel, { color: theme.colors.secondaryText }]}
              >
                Templates / Seed Items
              </Text>
            </View>
          </View>

          <View style={styles.dataButtons}>
            <PrimaryButton
              label="Load Sample Demo Journeys"
              onPress={handleLoadDemoJourneys}
              variant="outline"
              loading={loadingDemos}
              icon={<Sparkles size={16} color={theme.colors.secondaryBlue} />}
            />

            <PrimaryButton
              label="Replay Onboarding Guide"
              onPress={handleReplayOnboarding}
              variant="outline"
              icon={<RotateCcw size={16} color={theme.colors.primaryText} />}
            />

            <PrimaryButton
              label="Clear Application Data"
              onPress={() => setShowClearConfirm(true)}
              variant="danger"
              icon={<Trash2 size={16} color={theme.colors.danger} />}
            />
          </View>
        </View>

        {/* About PACKMATE */}
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
          <View style={styles.cardHeaderRow}>
            <Info size={18} color={theme.colors.accentMint} />
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.primaryText, marginBottom: 0 },
              ]}
            >
              About {APP_INFO.NAME}
            </Text>
          </View>
          <Text style={[styles.aboutBody, { color: theme.colors.secondaryText }]}>
            {APP_INFO.VISION}
          </Text>
          <Text style={[styles.aboutBody, { color: theme.colors.secondaryText }]}>
            Engineered with React Native, Expo, TypeScript, and Expo SQLite. All
            trip records, packing checklists, progress calculations, and
            destination recommendations run 100% locally on your device without
            any internet connection or cloud dependency.
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile & Profile Setup Modal */}
      <Modal
        visible={showProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <Pressable
          style={[styles.modalBackdrop, { backgroundColor: theme.colors.overlay }]}
          onPress={() => setShowProfileModal(false)}
        >
          <Pressable
            style={[
              styles.profileModalSheet,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
              theme.shadows.lg,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.profileModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                <UserCheck size={20} color={theme.colors.secondaryBlue} />
                <Text
                  style={[styles.profileModalTitle, { color: theme.colors.primaryText }]}
                >
                  Edit Profile & Setup
                </Text>
              </View>
              <Pressable
                onPress={() => setShowProfileModal(false)}
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: theme.colors.surfaceSubtle },
                ]}
              >
                <X size={17} color={theme.colors.secondaryText} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: theme.colors.primaryText }]}>
              Traveler Name
            </Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="e.g. Alex Traveler"
              placeholderTextColor={theme.colors.mutedText}
              style={[
                styles.profileInput,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.primaryText,
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.primaryText }]}>
              Packing Style
            </Text>
            <View style={styles.stylePillsRow}>
              {[
                'Smart Efficient Packer',
                'Minimalist Voyager',
                'Prepared Explorer',
                'Family Vacationer',
              ].map((styleChoice) => {
                const selected = draftStyle === styleChoice;
                return (
                  <Pressable
                    key={styleChoice}
                    onPress={() => setDraftStyle(styleChoice)}
                    style={[
                      styles.styleChoiceChip,
                      {
                        backgroundColor: selected
                          ? theme.colors.accentLime
                          : theme.isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : theme.colors.surfaceSubtle,
                        borderColor: selected
                          ? 'transparent'
                          : theme.isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'transparent',
                      },
                      selected ? theme.shadows.limeGlow : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.styleChoiceText,
                        {
                          color: selected
                            ? theme.colors.limeText
                            : theme.colors.secondaryText,
                          fontWeight: selected ? '800' : '600',
                        },
                      ]}
                    >
                      {styleChoice}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, { color: theme.colors.primaryText }]}>
              Home Base / Region
            </Text>
            <TextInput
              value={draftHome}
              onChangeText={setDraftHome}
              placeholder="e.g. Colombo, Sri Lanka"
              placeholderTextColor={theme.colors.mutedText}
              style={[
                styles.profileInput,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.primaryText,
                },
              ]}
            />

            <View style={styles.modalActionRow}>
              <PrimaryButton
                label="Cancel"
                onPress={() => setShowProfileModal(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label="Save Profile"
                onPress={handleSaveProfile}
                variant="lime"
                loading={savingProfile}
                style={{ flex: 1.4 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmModal
        visible={showClearConfirm}
        tone="danger"
        title="Clear Application Data?"
        message="This will permanently delete all user-created trips and packing checklist items from SQLite. Built-in templates and categories will be preserved."
        confirmLabel="Clear Data"
        loading={clearing}
        onConfirm={handleConfirmClearData}
        onCancel={() => setShowClearConfirm(false)}
      />

      <ConfirmModal
        visible={Boolean(feedbackModal)}
        tone="success"
        title={feedbackModal?.title ?? ''}
        message={feedbackModal?.message ?? ''}
        confirmLabel="Great"
        onConfirm={() => setFeedbackModal(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
    gap: 16,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  brandCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  profileCardName: {
    fontSize: 16,
    fontWeight: '800',
  },
  profileCardMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  profileActionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  profileActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 14,
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  versionRow: {
    marginTop: 12,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  profileContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  profileAvatarBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  profileAvatarInitials: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  profileStatusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileNameText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  styleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  styleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  homeBaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  homeBaseText: {
    fontSize: 12,
    fontWeight: '500',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  profileModalSheet: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    maxWidth: 480,
    width: '100%',
  },
  profileModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileModalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },
  profileInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    marginBottom: 14,
  },
  stylePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  styleChoiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  styleChoiceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  themeToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.3,
  },
  dbMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricBox: {
    width: '48%',
    borderRadius: 15,
    padding: 13,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  dataButtons: {
    gap: 10,
  },
  aboutBody: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
});
