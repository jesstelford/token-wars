import type { GearItemId } from '../constants/items';

const PLAYER_ID_KEY = 'token_wars_player_id';
const GEAR_UNLOCKS_KEY = 'token_wars_gear_unlocks';

export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

function loadUnlocks(): Record<string, GearItemId[]> {
  try {
    const raw = localStorage.getItem(GEAR_UNLOCKS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, GearItemId[]>) : {};
  } catch {
    return {};
  }
}

function saveUnlocks(data: Record<string, GearItemId[]>): void {
  localStorage.setItem(GEAR_UNLOCKS_KEY, JSON.stringify(data));
}

export async function fetchUnlockedGear(playerId: string): Promise<GearItemId[]> {
  const all = loadUnlocks();
  return all[playerId] ?? [];
}

export async function unlockGear(playerId: string, itemId: GearItemId): Promise<void> {
  const all = loadUnlocks();
  const current = all[playerId] ?? [];
  if (!current.includes(itemId)) {
    all[playerId] = [...current, itemId];
    saveUnlocks(all);
  }
}
