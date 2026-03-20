import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { GameState, HighScoreEntry, PendingTheft, PendingFreeToken } from '../types/game';
import { INITIAL_DEBT, INITIAL_CAPACITY, MAX_DAYS } from '../constants/assets';
import { ASSET_MAP } from '../constants/assets';
import type { AssetId } from '../constants/assets';
import type { CommunityId } from '../constants/communities';
import { generateInitialPrices, generateInitialAvailableAssets, runMarketLoop } from '../utils/marketLoop';
import { resolveRun, resolveFight, buildPartialInventoryLossWithGear } from '../utils/encounters';
import { generateEventId } from '../utils/formatting';
import { calculateScore } from '../utils/scoring';
import { computeGearEffects, getAllGear, getScrapValue } from '../utils/gearEffects';
import type { GearItemId } from '../constants/items';
import { GEAR_MAP } from '../constants/items';
import { unlockGear, getPlayerId } from '../lib/gearUnlocks';

const SAVE_KEY = 'token_wars_save';
const SCORES_KEY = 'token_wars_scores';

function buildInitialState(equippedGear: GearItemId[] = [], extraDebt: number = 0): GameState {
  const startingDebt = INITIAL_DEBT + extraDebt;
  return {
    current_cash: INITIAL_DEBT,
    bank_savings: 0,
    current_debt: startingDebt,
    health: 100,
    current_day: 1,
    inventory: [],
    capacity: INITIAL_CAPACITY,
    current_community: 'reddit',
    market_prices: generateInitialPrices(),
    available_assets: generateInitialAvailableAssets(),
    event_log: [{
      id: generateEventId(),
      type: 'info',
      message: equippedGear.length > 0
        ? `Simulation started with ${equippedGear.length} piece${equippedGear.length > 1 ? 's' : ''} of gear. Starting debt: $${startingDebt.toLocaleString()}.`
        : 'Simulation started. You have $5,500 in cash and owe $5,500. The clock is ticking.',
      day: 1,
    }],
    game_phase: 'playing',
    encounter_state: null,
    pending_thefts: [],
    pending_free_tokens: [],
    equipped_gear: equippedGear,
    found_gear: [],
    pending_item_drop: null,
    pending_vendor: null,
  };
}

export function useGameState() {
  const [state, setState] = useLocalStorage<GameState>(SAVE_KEY, buildInitialState());
  const [scores, setScores] = useLocalStorage<HighScoreEntry[]>(SCORES_KEY, []);

  const hasSave = useCallback(() => {
    return Boolean(localStorage.getItem(SAVE_KEY));
  }, []);

  const startNewGame = useCallback((equippedGear: GearItemId[] = [], extraDebt: number = 0) => {
    setState(buildInitialState(equippedGear, extraDebt));
  }, [setState]);

  const travel = useCallback((targetCommunity: CommunityId) => {
    setState(prev => {
      if (prev.current_community === targetCommunity) return prev;
      if (prev.current_day >= MAX_DAYS) {
        return { ...prev, game_phase: 'gameover' };
      }

      const allGear = getAllGear(prev);
      const gearEffects = computeGearEffects(allGear);

      const { updatedState, robbedAmount, bankHackedAmount, freeTokenEvent, pendingItemDrop, pendingVendor } =
        runMarketLoop(prev, targetCommunity, gearEffects);

      const nextDay = (updatedState.current_day ?? prev.current_day);

      const pendingThefts: PendingTheft[] = [];
      if (robbedAmount > 0) {
        const cashAfter = (updatedState.current_cash ?? prev.current_cash);
        pendingThefts.push({ type: 'robbery', amountLost: robbedAmount, newTotal: cashAfter });
      }
      if (bankHackedAmount > 0) {
        const savingsAfter = (updatedState.bank_savings ?? prev.bank_savings);
        pendingThefts.push({ type: 'bank_hack', amountLost: bankHackedAmount, newTotal: savingsAfter });
      }

      const pendingFreeTokens: PendingFreeToken[] = freeTokenEvent ? [freeTokenEvent] : [];
      const merged = {
        ...prev,
        ...updatedState,
        pending_thefts: pendingThefts,
        pending_free_tokens: pendingFreeTokens,
        pending_item_drop: pendingItemDrop ?? prev.pending_item_drop,
        pending_vendor: pendingVendor ?? prev.pending_vendor,
      };

      if (nextDay > MAX_DAYS) {
        return { ...merged, game_phase: 'gameover' };
      }
      return merged;
    });
  }, [setState]);

  const dismissFreeToken = useCallback(() => {
    setState(prev => ({
      ...prev,
      pending_free_tokens: prev.pending_free_tokens?.slice(1) ?? [],
    }));
  }, [setState]);

  const dismissTheft = useCallback(() => {
    setState(prev => ({
      ...prev,
      pending_thefts: prev.pending_thefts.slice(1),
    }));
  }, [setState]);

  const collectItem = useCallback((itemId: GearItemId) => {
    setState(prev => {
      const allGear = getAllGear(prev);
      const isDuplicate = allGear.includes(itemId);

      if (isDuplicate) {
        const scrapValue = getScrapValue(itemId);
        const gearItem = GEAR_MAP[itemId];
        const newEvent = {
          id: generateEventId(),
          type: 'gear_found' as const,
          message: `Duplicate ${gearItem?.name ?? itemId} scrapped for $${scrapValue.toLocaleString()}.`,
          day: prev.current_day,
        };
        return {
          ...prev,
          current_cash: prev.current_cash + scrapValue,
          pending_item_drop: null,
          event_log: [newEvent, ...prev.event_log].slice(0, 20),
        };
      }

      if (allGear.length >= 3) {
        return { ...prev, pending_item_drop: null };
      }

      const playerId = getPlayerId();
      unlockGear(playerId, itemId);

      const gearItem = GEAR_MAP[itemId];
      const newEvent = {
        id: generateEventId(),
        type: 'gear_found' as const,
        message: `Collected ${gearItem?.name ?? itemId}. Active effects applied.`,
        day: prev.current_day,
      };

      return {
        ...prev,
        found_gear: [...prev.found_gear, itemId],
        pending_item_drop: null,
        event_log: [newEvent, ...prev.event_log].slice(0, 20),
      };
    });
  }, [setState]);

  const dismissItemDrop = useCallback(() => {
    setState(prev => ({ ...prev, pending_item_drop: null }));
  }, [setState]);

  const purchaseFromVendor = useCallback((itemId: GearItemId, price: number) => {
    setState(prev => {
      const allGear = getAllGear(prev);
      if (prev.current_cash < price) return prev;
      if (allGear.length >= 3) return prev;

      const playerId = getPlayerId();
      unlockGear(playerId, itemId);

      const gearItem = GEAR_MAP[itemId];
      const newEvent = {
        id: generateEventId(),
        type: 'vendor' as const,
        message: `Purchased ${gearItem?.name ?? itemId} from the vendor for $${price.toLocaleString()}.`,
        day: prev.current_day,
      };

      return {
        ...prev,
        current_cash: prev.current_cash - price,
        found_gear: [...prev.found_gear, itemId],
        pending_vendor: null,
        event_log: [newEvent, ...prev.event_log].slice(0, 20),
      };
    });
  }, [setState]);

  const declineVendor = useCallback(() => {
    setState(prev => ({ ...prev, pending_vendor: null }));
  }, [setState]);

  const finishGame = useCallback(() => {
    setState(prev => {
      const inventorySaleRevenue = prev.inventory.reduce((sum, item) => {
        const mp = prev.market_prices[item.assetId];
        return sum + (mp ? mp.price * item.quantity : 0);
      }, 0);
      const finalCash = prev.current_cash + inventorySaleRevenue;
      const finalDebt = prev.current_debt < 1 ? 0 : prev.current_debt;
      return {
        ...prev,
        current_cash: finalCash,
        inventory: [],
        current_debt: finalDebt,
        game_phase: 'gameover',
      };
    });
  }, [setState]);

  const resolveEncounterRun = useCallback((success: boolean) => {
    setState(prev => {
      if (prev.game_phase !== 'encounter') return prev;
      const allGear = getAllGear(prev);
      const gearEffects = computeGearEffects(allGear);
      const result = resolveRun(prev, success, gearEffects);
      const newInventory = result.lostInventory
        ? buildPartialInventoryLossWithGear(prev.inventory, gearEffects)
        : prev.inventory;
      const newHealth = Math.max(0, prev.health - result.healthLost);
      const newLog = [result.event, ...prev.event_log].slice(0, 20);
      return {
        ...prev,
        health: newHealth,
        inventory: newInventory,
        event_log: newLog,
        game_phase: result.terminated ? 'gameover' : 'playing',
        encounter_state: null,
      };
    });
  }, [setState]);

  const resolveEncounterFight = useCallback((success: boolean, healthLost?: number) => {
    setState(prev => {
      if (prev.game_phase !== 'encounter') return prev;
      const allGear = getAllGear(prev);
      const gearEffects = computeGearEffects(allGear);
      const result = resolveFight(prev, success, healthLost, gearEffects);
      const newHealth = Math.max(0, prev.health - result.healthLost);
      const newLog = [result.event, ...prev.event_log].slice(0, 20);

      const pendingItemDrop = result.itemDrop
        ? { itemId: result.itemDrop, source: 'ftc_win' as const }
        : prev.pending_item_drop;

      return {
        ...prev,
        health: newHealth,
        event_log: newLog,
        game_phase: result.terminated ? 'gameover' : 'playing',
        encounter_state: null,
        pending_item_drop: pendingItemDrop,
      };
    });
  }, [setState]);

  const buyAsset = useCallback((assetId: AssetId, quantity: number) => {
    setState(prev => {
      const marketEntry = prev.market_prices[assetId];
      if (!marketEntry) return prev;
      const totalCost = marketEntry.price * quantity;
      if (totalCost > prev.current_cash) return prev;
      const usedCapacity = prev.inventory.reduce((sum, i) => sum + i.quantity, 0);
      const allGear = getAllGear(prev);
      const gearEffects = computeGearEffects(allGear);
      const effectiveCapacity = prev.capacity + gearEffects.capacityBonus;
      if (usedCapacity + quantity > effectiveCapacity) return prev;
      const existingIndex = prev.inventory.findIndex(i => i.assetId === assetId);
      let newInventory = [...prev.inventory];
      if (existingIndex >= 0) {
        const existing = newInventory[existingIndex];
        const totalQty = existing.quantity + quantity;
        const newAvg = (existing.avgPurchasePrice * existing.quantity + marketEntry.price * quantity) / totalQty;
        newInventory[existingIndex] = { ...existing, quantity: totalQty, avgPurchasePrice: newAvg };
      } else {
        newInventory.push({ assetId, quantity, avgPurchasePrice: marketEntry.price });
      }
      const assetName = ASSET_MAP[assetId]?.name ?? assetId;
      const newEvent = {
        id: generateEventId(),
        type: 'info' as const,
        message: `Bought ${quantity}x ${assetName} for $${(totalCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
        day: prev.current_day,
      };
      return {
        ...prev,
        current_cash: prev.current_cash - totalCost,
        inventory: newInventory,
        event_log: [newEvent, ...prev.event_log].slice(0, 20),
      };
    });
  }, [setState]);

  const sellAsset = useCallback((assetId: AssetId, quantity: number) => {
    setState(prev => {
      const marketEntry = prev.market_prices[assetId];
      if (!marketEntry) return prev;
      const existingItem = prev.inventory.find(i => i.assetId === assetId);
      if (!existingItem || existingItem.quantity < quantity) return prev;
      const totalRevenue = marketEntry.price * quantity;
      const newInventory = prev.inventory
        .map(i => i.assetId === assetId ? { ...i, quantity: i.quantity - quantity } : i)
        .filter(i => i.quantity > 0);
      const assetName = ASSET_MAP[assetId]?.name ?? assetId;
      const newEvent = {
        id: generateEventId(),
        type: 'info' as const,
        message: `Sold ${quantity}x ${assetName} for $${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
        day: prev.current_day,
      };
      return {
        ...prev,
        current_cash: prev.current_cash + totalRevenue,
        inventory: newInventory,
        event_log: [newEvent, ...prev.event_log].slice(0, 20),
      };
    });
  }, [setState]);

  const payDebt = useCallback((amount: number) => {
    setState(prev => {
      const payment = Math.min(amount, prev.current_debt, prev.current_cash);
      if (payment <= 0) return prev;
      const newDebt = prev.current_debt - payment;
      const roundedDebt = newDebt < 1 ? 0 : newDebt;
      const newEvent = {
        id: generateEventId(),
        type: 'info' as const,
        message: `Paid $${payment.toLocaleString(undefined, { maximumFractionDigits: 0 })} toward debt.`,
        day: prev.current_day,
      };
      return {
        ...prev,
        current_cash: prev.current_cash - payment,
        current_debt: roundedDebt,
        event_log: [newEvent, ...prev.event_log].slice(0, 20),
      };
    });
  }, [setState]);

  const deposit = useCallback((amount: number) => {
    setState(prev => {
      const actual = Math.min(amount, prev.current_cash);
      if (actual <= 0) return prev;
      const newEvent = {
        id: generateEventId(),
        type: 'info' as const,
        message: `Deposited $${actual.toLocaleString(undefined, { maximumFractionDigits: 0 })} to the bank.`,
        day: prev.current_day,
      };
      return {
        ...prev,
        current_cash: prev.current_cash - actual,
        bank_savings: prev.bank_savings + actual,
        event_log: [newEvent, ...prev.event_log].slice(0, 20),
      };
    });
  }, [setState]);

  const withdraw = useCallback((amount: number) => {
    setState(prev => {
      const actual = Math.min(amount, prev.bank_savings);
      if (actual <= 0) return prev;
      const newEvent = {
        id: generateEventId(),
        type: 'info' as const,
        message: `Withdrew $${actual.toLocaleString(undefined, { maximumFractionDigits: 0 })} from the bank.`,
        day: prev.current_day,
      };
      return {
        ...prev,
        current_cash: prev.current_cash + actual,
        bank_savings: prev.bank_savings - actual,
        event_log: [newEvent, ...prev.event_log].slice(0, 20),
      };
    });
  }, [setState]);

  const submitScore = useCallback((playerName: string, updateLatest?: boolean) => {
    setScores(prev => {
      const allGear = getAllGear(state);
      const entry: HighScoreEntry = {
        name: playerName.trim() || 'Anon',
        score: calculateScore(state),
        date: new Date().toLocaleDateString(),
        days_survived: state.current_day,
        gear_collected: allGear,
      };
      if (updateLatest) {
        const targetScore = entry.score;
        const idx = prev.findIndex(e => e.score === targetScore && e.date === entry.date && e.days_survived === entry.days_survived);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = entry;
          return updated.sort((a, b) => b.score - a.score);
        }
      }
      return [...prev, entry].sort((a, b) => b.score - a.score);
    });
  }, [setScores, state]);

  const clearSave = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
  }, []);

  return {
    state,
    scores,
    hasSave,
    startNewGame,
    travel,
    dismissFreeToken,
    dismissTheft,
    collectItem,
    dismissItemDrop,
    purchaseFromVendor,
    declineVendor,
    finishGame,
    resolveEncounterRun,
    resolveEncounterFight,
    buyAsset,
    sellAsset,
    payDebt,
    deposit,
    withdraw,
    submitScore,
    clearSave,
  };
}
