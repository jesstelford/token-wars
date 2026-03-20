import { useState, useCallback } from 'react';
import type { GameState, TutorialStep } from '../types/game';
import type { AssetId } from '../constants/assets';
import { generateEventId } from '../utils/formatting';

const TUTORIAL_SEEN_KEY = 'token_wars_tutorial_seen';
const TUTORIAL_BUY_PRICE = 50;
const TUTORIAL_SELL_PRICE = 80;
const TUTORIAL_QUANTITY = 5;
const TUTORIAL_STARTING_CASH = 5500;
const TUTORIAL_STARTING_DEBT = 5500;

export const TUTORIAL_ASSET_ID: AssetId = 'grok';
export const TUTORIAL_START_COMMUNITY = 'github' as const;
export const TUTORIAL_DEST_COMMUNITY = 'reddit' as const;
export { TUTORIAL_QUANTITY, TUTORIAL_BUY_PRICE, TUTORIAL_SELL_PRICE };

export function hasTutorialBeenSeen(): boolean {
  return Boolean(localStorage.getItem(TUTORIAL_SEEN_KEY));
}

export function markTutorialSeen(): void {
  localStorage.setItem(TUTORIAL_SEEN_KEY, '1');
}

export function buildTutorialState(): GameState {
  const prices: GameState['market_prices'] = {
    openai: { assetId: 'openai', price: 15000, isAnomaly: false },
    anthropic: { assetId: 'anthropic', price: 10000, isAnomaly: false },
    deepmind: { assetId: 'deepmind', price: 5000, isAnomaly: false },
    meta_ai: { assetId: 'meta_ai', price: 2500, isAnomaly: false },
    mistral: { assetId: 'mistral', price: 1200, isAnomaly: false },
    cohere: { assetId: 'cohere', price: 700, isAnomaly: false },
    perplexity: { assetId: 'perplexity', price: 300, isAnomaly: false },
    huggingface: { assetId: 'huggingface', price: 150, isAnomaly: false },
    grok: { assetId: 'grok', price: TUTORIAL_BUY_PRICE, isAnomaly: false },
  };

  return {
    current_cash: TUTORIAL_STARTING_CASH,
    bank_savings: 0,
    current_debt: TUTORIAL_STARTING_DEBT,
    health: 100,
    current_day: 1,
    inventory: [],
    capacity: 100,
    current_community: TUTORIAL_START_COMMUNITY,
    market_prices: prices,
    available_assets: ['grok'],
    event_log: [{
      id: generateEventId(),
      type: 'info' as const,
      message: 'Tutorial: Buy Grok tokens cheap here at Meetups.',
      day: 1,
    }],
    game_phase: 'playing',
    encounter_state: null,
    pending_thefts: [],
    pending_free_tokens: [],
    equipped_gear: [],
    found_gear: [],
    pending_item_drop: null,
    pending_vendor: null,
  };
}

export function buildTutorialSellState(prev: GameState): GameState {
  const prices = {
    ...prev.market_prices,
    grok: { assetId: 'grok' as AssetId, price: TUTORIAL_SELL_PRICE, isAnomaly: false },
  };
  return {
    ...prev,
    current_community: TUTORIAL_DEST_COMMUNITY,
    current_day: 2,
    market_prices: prices,
    available_assets: ['grok'],
    current_debt: Math.round(prev.current_debt * 1.08),
    event_log: [{
      id: generateEventId(),
      type: 'info' as const,
      message: 'Tutorial: You arrived at Reddit. Grok is worth more here — sell it!',
      day: 2,
    }, ...prev.event_log].slice(0, 20),
  };
}

export function useTutorial() {
  const [tutorialStep, setTutorialStep] = useState<TutorialStep | null>(null);
  const [tutorialState, setTutorialState] = useState<GameState | null>(null);

  const startTutorial = useCallback(() => {
    setTutorialState(buildTutorialState());
    setTutorialStep('buy');
  }, []);

  const advanceTutorial = useCallback((step: TutorialStep, updatedState?: GameState) => {
    if (updatedState) {
      setTutorialState(updatedState);
    }
    setTutorialStep(step);
  }, []);

  const completeTutorial = useCallback(() => {
    markTutorialSeen();
    setTutorialStep(null);
    setTutorialState(null);
  }, []);

  const skipTutorial = useCallback(() => {
    markTutorialSeen();
    setTutorialStep(null);
    setTutorialState(null);
  }, []);

  return {
    tutorialStep,
    tutorialState,
    setTutorialState,
    startTutorial,
    advanceTutorial,
    completeTutorial,
    skipTutorial,
  };
}
