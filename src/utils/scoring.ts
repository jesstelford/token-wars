import type { GameState } from '../types/game';
import { ASSET_MAP } from '../constants/assets';
import type { GearItemId } from '../constants/items';
import { GEAR_MAP } from '../constants/items';

const GEAR_SCORE_BONUS: Record<string, number> = {
  common: 300,
  uncommon: 800,
  rare: 2000,
  legendary: 5000,
};

export function calculateGearBonus(gearIds: GearItemId[]): number {
  return gearIds.reduce((sum, id) => {
    const item = GEAR_MAP[id];
    return sum + (GEAR_SCORE_BONUS[item?.rarity ?? 'common'] ?? 0);
  }, 0);
}

export function calculateScore(state: GameState): number {
  const baseScore = (state.current_cash + state.bank_savings) - (state.current_debt * 2);
  const allGear = [...(state.equipped_gear ?? []), ...(state.found_gear ?? [])].slice(0, 3);
  const gearBonus = calculateGearBonus(allGear);
  return baseScore + gearBonus;
}

export function calculateNetWorth(state: GameState): number {
  const inventoryValue = state.inventory.reduce((sum, item) => {
    const marketEntry = state.market_prices[item.assetId];
    const price = marketEntry ? marketEntry.price : ASSET_MAP[item.assetId]?.basePrice ?? 0;
    return sum + price * item.quantity;
  }, 0);
  return state.current_cash + state.bank_savings + inventoryValue - state.current_debt;
}

export function getScoreTier(score: number): { label: string; description: string } {
  if (score >= 500_000) return { label: 'Legendary', description: 'You outpaced every model on the market.' };
  if (score >= 200_000) return { label: 'Elite Trader', description: 'You played the market like a maestro.' };
  if (score >= 100_000) return { label: 'Seasoned Arbitrageur', description: 'Solid returns. You know the game.' };
  if (score >= 50_000) return { label: 'Emerging Player', description: 'Good instincts, room to grow.' };
  if (score >= 0) return { label: 'Break Even', description: 'You survived. Barely.' };
  return { label: 'Bankrupt', description: 'The debt ate you alive.' };
}
