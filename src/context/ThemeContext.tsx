import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppTheme, getAppTheme } from '../theme';
import { ThemeMode } from '../types';
import { getThemeModeSetting, setThemeModeSetting } from '../database/queries/settingsQueries';

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: getAppTheme('light'),
  mode: 'light',
  setThemeMode: async () => {},
  toggleTheme: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await getThemeModeSetting();
        if (mounted) {
          setMode(stored);
        }
      } catch {
        // Fallback to default light theme if DB is still initializing
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setThemeMode = useCallback(async (nextMode: ThemeMode) => {
    setMode(nextMode);
    try {
      await setThemeModeSetting(nextMode);
    } catch (err) {
      console.error('[PACKMATE Theme] Failed saving theme setting:', err);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const next: ThemeMode = mode === 'light' ? 'dark' : 'light';
    await setThemeMode(next);
  }, [mode, setThemeMode]);

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  const value = useMemo(
    () => ({ theme, mode, setThemeMode, toggleTheme }),
    [theme, mode, setThemeMode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
