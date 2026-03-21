const MINIGAME_UNLOCKS_KEY = 'token_wars_minigame_unlocks';

export type MiniGameId = 'signal_scramble' | 'voltage_surge' | 'port_scan' | 'counter_hack' | 'decoy';

function load(): MiniGameId[] {
  try {
    const raw = localStorage.getItem(MINIGAME_UNLOCKS_KEY);
    return raw ? (JSON.parse(raw) as MiniGameId[]) : [];
  } catch {
    return [];
  }
}

function save(ids: MiniGameId[]): void {
  localStorage.setItem(MINIGAME_UNLOCKS_KEY, JSON.stringify(ids));
}

export function getUnlockedMiniGames(): MiniGameId[] {
  return load();
}

export function unlockMiniGame(id: MiniGameId): void {
  const current = load();
  if (!current.includes(id)) {
    save([...current, id]);
  }
}
