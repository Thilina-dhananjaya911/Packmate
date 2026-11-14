import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DashboardStats,
  ItemCategory,
  PackingTemplate,
  ProfileStats,
  SaveProfileInput,
  TripWithProgress,
  UserProfile,
} from '../types';
import { getDatabase } from '../database';
import {
  isOnboardingCompleted,
  setOnboardingCompleted,
} from '../database/queries/settingsQueries';
import {
  getAllTripsWithProgress,
  getCompletedHistoryTrips,
  getDashboardStats,
  getRecentTrips,
  getUpcomingHeroTrip,
} from '../database/queries/tripQueries';
import { getAllCategories } from '../database/queries/itemQueries';
import { getAllTemplates } from '../database/queries/templateQueries';
import {
  getProfileStats,
  getUserProfile,
  resetUserProfile,
  saveUserProfile,
  updateUserProfile,
} from '../database/queries/profileQueries';

interface AppContextValue {
  isDbReady: boolean;
  dbError: string | null;
  hasCompletedOnboarding: boolean;
  userProfile: UserProfile | null;
  hasUserProfile: boolean;
  profileStats: ProfileStats;
  dataVersion: number;
  categories: ItemCategory[];
  templates: PackingTemplate[];
  trips: TripWithProgress[];
  historyTrips: TripWithProgress[];
  upcomingHeroTrip: TripWithProgress | null;
  recentTrips: TripWithProgress[];
  dashboardStats: DashboardStats;
  refreshAll: () => Promise<void>;
  notifyDataChanged: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  saveProfile: (input: SaveProfileInput) => Promise<UserProfile>;
  updateProfile: (input: Partial<SaveProfileInput>) => Promise<UserProfile>;
  resetProfile: () => Promise<void>;
}

const DEFAULT_STATS: DashboardStats = {
  totalTrips: 0,
  upcomingTrips: 0,
  ongoingTrips: 0,
  completedTrips: 0,
  totalItemsAllTrips: 0,
  totalPackedItems: 0,
};

const DEFAULT_PROFILE_STATS: ProfileStats = {
  totalTrips: 0,
  completedTrips: 0,
  totalPackedItems: 0,
  completionRate: 0,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats>(DEFAULT_PROFILE_STATS);
  const [dataVersion, setDataVersion] = useState(0);

  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [templates, setTemplates] = useState<PackingTemplate[]>([]);
  const [trips, setTrips] = useState<TripWithProgress[]>([]);
  const [historyTrips, setHistoryTrips] = useState<TripWithProgress[]>([]);
  const [upcomingHeroTrip, setUpcomingHeroTrip] = useState<TripWithProgress | null>(null);
  const [recentTrips, setRecentTrips] = useState<TripWithProgress[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(DEFAULT_STATS);

  const loadCoreData = useCallback(async () => {
    const [
      cats,
      tpls,
      allTrips,
      completed,
      hero,
      recent,
      stats,
      profile,
      pStats,
    ] = await Promise.all([
      getAllCategories(),
      getAllTemplates(),
      getAllTripsWithProgress(),
      getCompletedHistoryTrips(),
      getUpcomingHeroTrip(),
      getRecentTrips(4),
      getDashboardStats(),
      getUserProfile(),
      getProfileStats(),
    ]);

    setCategories(cats);
    setTemplates(tpls);
    setTrips(allTrips);
    setHistoryTrips(completed);
    setUpcomingHeroTrip(hero);
    setRecentTrips(recent);
    setDashboardStats(stats);
    setUserProfile(profile);
    setProfileStats(pStats);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await getDatabase();
        const onboarded = await isOnboardingCompleted();
        await loadCoreData();
        if (mounted) {
          setHasCompletedOnboarding(onboarded);
          setIsDbReady(true);
          setDbError(null);
        }
      } catch (err) {
        if (mounted) {
          setDbError(
            err instanceof Error
              ? err.message
              : 'Unable to initialize offline SQLite storage.'
          );
          setIsDbReady(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadCoreData]);

  const refreshAll = useCallback(async () => {
    try {
      await loadCoreData();
      setDataVersion((v) => v + 1);
    } catch (err) {
      console.error('[PACKMATE Context] Refresh failed:', err);
    }
  }, [loadCoreData]);

  const notifyDataChanged = useCallback(async () => {
    await refreshAll();
  }, [refreshAll]);

  const completeOnboarding = useCallback(async () => {
    await setOnboardingCompleted(true);
    setHasCompletedOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    await setOnboardingCompleted(false);
    setHasCompletedOnboarding(false);
  }, []);

  const saveProfile = useCallback(
    async (input: SaveProfileInput): Promise<UserProfile> => {
      const saved = await saveUserProfile(input);
      setUserProfile(saved);
      await refreshAll();
      return saved;
    },
    [refreshAll]
  );

  const updateProfile = useCallback(
    async (input: Partial<SaveProfileInput>): Promise<UserProfile> => {
      const updated = await updateUserProfile(input);
      setUserProfile(updated);
      await refreshAll();
      return updated;
    },
    [refreshAll]
  );

  const resetProfile = useCallback(async (): Promise<void> => {
    await resetUserProfile();
    setUserProfile(null);
    await refreshAll();
  }, [refreshAll]);

  const hasUserProfile = Boolean(userProfile);

  const value = useMemo<AppContextValue>(
    () => ({
      isDbReady,
      dbError,
      hasCompletedOnboarding,
      userProfile,
      hasUserProfile,
      profileStats,
      dataVersion,
      categories,
      templates,
      trips,
      historyTrips,
      upcomingHeroTrip,
      recentTrips,
      dashboardStats,
      refreshAll,
      notifyDataChanged,
      completeOnboarding,
      resetOnboarding,
      saveProfile,
      updateProfile,
      resetProfile,
    }),
    [
      isDbReady,
      dbError,
      hasCompletedOnboarding,
      userProfile,
      hasUserProfile,
      profileStats,
      dataVersion,
      categories,
      templates,
      trips,
      historyTrips,
      upcomingHeroTrip,
      recentTrips,
      dashboardStats,
      refreshAll,
      notifyDataChanged,
      completeOnboarding,
      resetOnboarding,
      saveProfile,
      updateProfile,
      resetProfile,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside AppProvider.');
  }
  return ctx;
}
