import type { GameState } from '../types/game';
import { ASSET_MAP } from '../constants/assets';

export function calculateScore(state: GameState): number {
  return (state.current_cash + state.bank_savings) - (state.current_debt * 2);
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
