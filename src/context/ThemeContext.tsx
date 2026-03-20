import { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeId, ThemeMode } from '../types/theme';
import { THEMES } from '../types/theme';
import { supabase } from '../lib/supabase';
import { getPlayerId } from '../lib/gearUnlocks';

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

async function saveThemeToSupabase(themeKey: string) {
  try {
    const playerId = getPlayerId();
    await supabase
      .from('player_preferences')
      .upsert({ player_id: playerId, active_theme: themeKey, updated_at: new Date().toISOString() }, { onConflict: 'player_id' });
  } catch {
    // silent fail
  }
}

async function fetchThemeFromSupabase(): Promise<{ id: ThemeId; mode: ThemeMode } | null> {
  try {
    const playerId = getPlayerId();
    const { data } = await supabase
      .from('player_preferences')
      .select('active_theme')
      .eq('player_id', playerId)
      .maybeSingle();
    if (data?.active_theme) {
      const parts = (data.active_theme as string).split('-');
      if (parts.length >= 2) {
        const mode = parts[parts.length - 1] as ThemeMode;
        const id = parts.slice(0, -1).join('-') as ThemeId;
        if ((mode === 'light' || mode === 'dark') && THEMES.find(t => t.id === id)) {
          return { id, mode };
        }
      }
    }
  } catch {}
  return null;
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
    const themeKey = `${themeId}-${mode}`;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: themeId, mode }));
    saveThemeToSupabase(themeKey);
  }, [themeId, mode]);

  useEffect(() => {
    fetchThemeFromSupabase().then(remote => {
      if (remote) {
        setThemeIdState(remote.id);
        setMode(remote.mode);
      }
    });
  }, []);

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
