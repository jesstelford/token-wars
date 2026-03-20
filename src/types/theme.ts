export type ThemeId =
  | 'default'
  | 'grunge'
  | 'crypto'
  | 'retro'
  | 'terminal'
  | 'vaporwave'
  | 'neon';

export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  description: string;
  colors: { primary: string; accent: string; bg: string };
  defaultMode: ThemeMode;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Clean and modern',
    colors: { primary: '#0284c7', accent: '#38bdf8', bg: '#f8fafc' },
    defaultMode: 'light',
  },
  {
    id: 'grunge',
    label: 'Grunge',
    description: 'Urban underground',
    colors: { primary: '#c2410c', accent: '#f97316', bg: '#1a1209' },
    defaultMode: 'dark',
  },
  {
    id: 'crypto',
    label: 'Crypto Bro',
    description: 'Neon maximalist hype',
    colors: { primary: '#00ff88', accent: '#ff006e', bg: '#000000' },
    defaultMode: 'dark',
  },
  {
    id: 'retro',
    label: 'Retro',
    description: 'Windows 95 Dope Wars',
    colors: { primary: '#000080', accent: '#808080', bg: '#c0c0c0' },
    defaultMode: 'light',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    description: 'Bloomberg data desk',
    colors: { primary: '#ff8c00', accent: '#ffa500', bg: '#000000' },
    defaultMode: 'dark',
  },
  {
    id: 'vaporwave',
    label: 'Vaporwave',
    description: '80s dream aesthetic',
    colors: { primary: '#ff71ce', accent: '#01cdfe', bg: '#0d0221' },
    defaultMode: 'dark',
  },
  {
    id: 'neon',
    label: 'Neon Noir',
    description: 'Cyberpunk rain district',
    colors: { primary: '#39ff14', accent: '#ff073a', bg: '#0a0a0f' },
    defaultMode: 'dark',
  },
];
