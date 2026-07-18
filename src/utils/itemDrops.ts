import { GEAR_ITEMS, type GearItemId } from '../constants/items';
import type { PendingVendor } from '../types/game';
import { rollWeightedRarity } from './gearEffects';

const SCAVENGE_BASE_PROB = 0.10;
const VENDOR_PROB = 0.05;

const COMMUNITY_SCAVENGE_BONUS: Record<string, number> = {
  darkweb: 0.03,
  meetups: 0.02,
  podcasts: 0.01,
  discord: 0,
  reddit: 0,
  twitter: -0.01,
};

export function rollScavengeDrop(
  communityId: string,
  ownedGear: GearItemId[],
  gearSlotsFull: boolean,
): GearItemId | null {
  if (gearSlotsFull) return null;

  const bonus = COMMUNITY_SCAVENGE_BONUS[communityId] ?? 0;
  const prob = SCAVENGE_BASE_PROB + bonus;

  if (Math.random() > prob) return null;

  const itemId = rollWeightedRarity(communityId);

  if (ownedGear.includes(itemId)) {
    return itemId;
  }

  return itemId;
}

export function rollVendorEvent(
  ownedGear: GearItemId[],
  currentCash: number,
): PendingVendor | null {
  if (Math.random() > VENDOR_PROB) return null;

  const count = Math.random() < 0.50 ? 1 : Math.random() < 0.70 ? 2 : 3;

  const priceByRarity: Record<string, [number, number]> = {
    common: [800, 1500],
    uncommon: [2500, 5000],
    rare: [9000, 16000],
    legendary: [28000, 45000],
  };

  const shuffled = [...GEAR_ITEMS].sort(() => Math.random() - 0.5);
  const offered: GearItemId[] = [];
  const prices: Partial<Record<GearItemId, number>> = {};

  for (const item of shuffled) {
    if (offered.length >= count) break;
    if (!offered.includes(item.id)) {
      offered.push(item.id);
      const [min, max] = priceByRarity[item.rarity];
      prices[item.id] = Math.round(min + Math.random() * (max - min));
    }
  }

  const allOwned = offered.every(id => ownedGear.includes(id));
  if (allOwned) return null;

  const anyAffordable = offered.some(id => (prices[id] ?? Infinity) <= currentCash);
  if (!anyAffordable && currentCash < 500) return null;

  return { offeredItems: offered, prices };
}

export function rollMilestoneDrop(
  day: number,
  totalGearCount: number,
): 'common' | 'uncommon' | null {
  if (day === 10 && totalGearCount === 0) return 'common';
  if (day === 20 && totalGearCount < 2) return 'uncommon';
  return null;
}

export function pickMilestoneItem(rarity: 'common' | 'uncommon'): GearItemId {
  const pool = GEAR_ITEMS.filter(g => g.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)].id;
}

export function getVendorPrice(vendor: PendingVendor, itemId: GearItemId): number {
  return vendor.prices[itemId] ?? 0;
}
