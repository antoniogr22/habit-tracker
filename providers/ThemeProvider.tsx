import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, ThemeColors, ThemeMode } from '@/lib/theme';

const STORAGE_KEY = 'habit-tracker.theme';
type ThemeContextValue = { mode: ThemeMode; colors: ThemeColors; setMode: (mode: ThemeMode) => void; toggleMode: () => void; };
const ThemeContext = createContext<ThemeContextValue | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemMode = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [mode, setModeState] = useState<ThemeMode>(systemMode);
  useEffect(() => { AsyncStorage.getItem(STORAGE_KEY).then(value => { if (value === 'light' || value === 'dark') setModeState(value); }).catch(() => {}); }, []);
  const setMode = (next: ThemeMode) => { setModeState(next); AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {}); };
  const value = useMemo(() => ({ mode, colors: palettes[mode], setMode, toggleMode: () => setMode(mode === 'dark' ? 'light' : 'dark') }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const value = useContext(ThemeContext); if (!value) throw new Error('useTheme must be used inside ThemeProvider'); return value; }
