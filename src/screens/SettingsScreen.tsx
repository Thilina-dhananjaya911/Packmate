import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Database,
  Info,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react-native';
import { APP_INFO } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppTheme } from '../context/ThemeContext';
import {
  clearUserApplicationData,
  getDatabaseInfo,
  loadSampleDemoJourneys,
} from '../database/queries/settingsQueries';
import { BrandMark } from '../components/BrandMark';
import { ConfirmModal } from '../components/ConfirmModal';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { DatabaseInfo, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, mode, setThemeMode } = useAppTheme();
  const { dataVersion, notifyDataChanged, resetOnboarding } = useAppContext();

  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [loadingDemos, setLoadingDemos] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    title: string;
    message: string;
  } | null>(null);

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
  },
  brandCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
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
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
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
