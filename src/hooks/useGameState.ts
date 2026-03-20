import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { GameState, HighScoreEntry } from '../types/game';
import { INITIAL_DEBT, INITIAL_CAPACITY, MAX_DAYS } from '../constants/assets';
import { ASSET_MAP } from '../constants/assets';
import type { AssetId } from '../constants/assets';
import type { CommunityId } from '../constants/communities';
import { generateInitialPrices, generateInitialAvailableAssets, runMarketLoop } from '../utils/marketLoop';
import { resolveRun, resolveFight } from '../utils/encounters';
import { generateEventId } from '../utils/formatting';
import { calculateScore } from '../utils/scoring';

const SAVE_KEY = 'token_wars_save';
const SCORES_KEY = 'token_wars_scores';

function buildInitialState(): GameState {
  return {
    current_cash: INITIAL_DEBT,
    bank_savings: 0,
    current_debt: INITIAL_DEBT,
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
      message: 'Simulation started. You have $5,500 in cash and owe $5,500. The clock is ticking.',
      day: 1,
    }],
    game_phase: 'playing',
    encounter_state: null,
  };
}

export function useGameState() {
  const [state, setState] = useLocalStorage<GameState>(SAVE_KEY, buildInitialState());
  const [scores, setScores] = useLocalStorage<HighScoreEntry[]>(SCORES_KEY, []);

  const hasSave = useCallback(() => {
    return Boolean(localStorage.getItem(SAVE_KEY));
  }, []);

  const startNewGame = useCallback(() => {
    setState(buildInitialState());
  }, [setState]);

  const travel = useCallback((targetCommunity: CommunityId) => {
    setState(prev => {
      if (prev.current_community === targetCommunity) return prev;
      if (prev.current_day >= MAX_DAYS) {
        return { ...prev, game_phase: 'gameover' };
      }
      const { updatedState } = runMarketLoop(prev, targetCommunity);
      const nextDay = (updatedState.current_day ?? prev.current_day);
      if (nextDay > MAX_DAYS) {
        return { ...prev, ...updatedState, game_phase: 'gameover' };
      }
      return { ...prev, ...updatedState };
    });
  }, [setState]);

  const resolveEncounterRun = useCallback(() => {
    setState(prev => {
      if (prev.game_phase !== 'encounter') return prev;
      const result = resolveRun(prev);
      const newInventory = result.lostInventory ? [] : prev.inventory;
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

  const resolveEncounterFight = useCallback(() => {
    setState(prev => {
      if (prev.game_phase !== 'encounter') return prev;
      const result = resolveFight(prev);
      const newHealth = Math.max(0, prev.health - result.healthLost);
      const newLog = [result.event, ...prev.event_log].slice(0, 20);
      return {
        ...prev,
        health: newHealth,
        event_log: newLog,
        game_phase: result.terminated ? 'gameover' : 'playing',
        encounter_state: null,
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
      if (usedCapacity + quantity > prev.capacity) return prev;
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
      const newEvent = {
        id: generateEventId(),
        type: 'info' as const,
        message: `Paid $${payment.toLocaleString(undefined, { maximumFractionDigits: 0 })} toward debt.`,
        day: prev.current_day,
      };
      return {
        ...prev,
        current_cash: prev.current_cash - payment,
        current_debt: prev.current_debt - payment,
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

  const submitScore = useCallback((playerName: string) => {
    setScores(prev => {
      const entry: HighScoreEntry = {
        name: playerName.trim() || 'Anonymous',
        score: calculateScore(state),
        date: new Date().toLocaleDateString(),
        days_survived: state.current_day,
      };
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
