import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DashboardStats,
  ItemCategory,
  PackingTemplate,
  TripWithProgress,
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

interface AppContextValue {
  isDbReady: boolean;
  dbError: string | null;
  hasCompletedOnboarding: boolean;
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
}

const DEFAULT_STATS: DashboardStats = {
  totalTrips: 0,
  upcomingTrips: 0,
  ongoingTrips: 0,
  completedTrips: 0,
  totalItemsAllTrips: 0,
  totalPackedItems: 0,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
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
    ] = await Promise.all([
      getAllCategories(),
      getAllTemplates(),
      getAllTripsWithProgress(),
      getCompletedHistoryTrips(),
      getUpcomingHeroTrip(),
      getRecentTrips(4),
      getDashboardStats(),
    ]);

    setCategories(cats);
    setTemplates(tpls);
    setTrips(allTrips);
    setHistoryTrips(completed);
    setUpcomingHeroTrip(hero);
    setRecentTrips(recent);
    setDashboardStats(stats);
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

  const value = useMemo<AppContextValue>(
    () => ({
      isDbReady,
      dbError,
      hasCompletedOnboarding,
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
    }),
    [
      isDbReady,
      dbError,
      hasCompletedOnboarding,
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
