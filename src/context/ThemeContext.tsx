import { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeId, ThemeMode } from '../types/theme';
import { THEMES } from '../types/theme';

interface ThemeContextValue {
  themeId: ThemeId;
  mode: ThemeMode;
  setThemeId: (id: ThemeId) => void;
  toggleMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'default',
  mode: 'light',
  setThemeId: () => {},
  toggleMode: () => {},
  isDark: false,
});

const STORAGE_KEY = 'token_wars_theme_v2';

interface StoredTheme {
  id: ThemeId;
  mode: ThemeMode;
}

function loadStored(): StoredTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredTheme;
      if (parsed.id && parsed.mode) return parsed;
    }
  } catch {}
  return { id: 'default', mode: 'light' };
}

function applyTheme(id: ThemeId, mode: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute('data-theme', `${id}-${mode}`);
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const stored = loadStored();
  const [themeId, setThemeIdState] = useState<ThemeId>(stored.id);
  const [mode, setMode] = useState<ThemeMode>(stored.mode);

  useEffect(() => {
    applyTheme(themeId, mode);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: themeId, mode }));
  }, [themeId, mode]);

  function setThemeId(id: ThemeId) {
    const theme = THEMES.find(t => t.id === id);
    setThemeIdState(id);
    if (theme) setMode(theme.defaultMode);
  }

  function toggleMode() {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  }

  return (
    <ThemeContext.Provider
      value={{ themeId, mode, setThemeId, toggleMode, isDark: mode === 'dark' }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
