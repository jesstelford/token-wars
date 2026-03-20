import { supabase } from './supabase';
import type { GearItemId } from '../constants/items';

const PLAYER_ID_KEY = 'token_wars_player_id';

export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export async function fetchUnlockedGear(playerId: string): Promise<GearItemId[]> {
  try {
    const { data, error } = await supabase
      .from('gear_unlocks')
      .select('item_id')
      .eq('player_id', playerId);
    if (error) return [];
    return (data ?? []).map(row => row.item_id as GearItemId);
  } catch {
    return [];
  }
}

export async function unlockGear(playerId: string, itemId: GearItemId): Promise<void> {
  try {
    await supabase
      .from('gear_unlocks')
      .upsert({ player_id: playerId, item_id: itemId }, { onConflict: 'player_id,item_id', ignoreDuplicates: true });
  } catch {
    // silent fail
  }
}
