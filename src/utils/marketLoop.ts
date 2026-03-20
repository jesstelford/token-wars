import { ASSETS, ANOMALY_PROBABILITY, DEBT_INTEREST_RATE, BANK_INTEREST_RATE, ROBBERY_PROBABILITY, ROBBERY_MAX_FRACTION, BANK_HACK_PROBABILITY, BANK_HACK_MAX_FRACTION, FTC_BASE_PROBABILITY } from '../constants/assets';
import { COMMUNITY_MAP } from '../constants/communities';
import { SURGE_TEMPLATES, CRASH_TEMPLATES, ROBBERY_TEMPLATES, BANK_HACK_TEMPLATES, FTC_TEMPLATES, pickRandom, fillTemplate } from '../constants/events';
import type { GameState, GameEvent, MarketPrice, EncounterState } from '../types/game';
import type { AssetId } from '../constants/assets';
import type { CommunityId } from '../constants/communities';
import { generateEventId } from './formatting';
import { formatCurrencyFull } from './formatting';

interface MarketLoopResult {
  updatedState: Partial<GameState>;
  newEvents: GameEvent[];
  encounter: EncounterState | null;
  robbedAmount: number;
  bankHackedAmount: number;
}

function pickAvailableAssets(): AssetId[] {
  const all = ASSETS.map(a => a.id as AssetId);
  const minCount = Math.ceil(all.length / 2);
  const count = minCount + Math.floor(Math.random() * (all.length - minCount + 1));
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generateInitialPrices(): Record<AssetId, MarketPrice> {
  const prices: Partial<Record<AssetId, MarketPrice>> = {};
  for (const asset of ASSETS) {
    const variance = (Math.random() * 2 - 1) * asset.volatility;
    prices[asset.id as AssetId] = {
      assetId: asset.id as AssetId,
      price: asset.basePrice * (1 + variance),
      isAnomaly: false,
    };
  }
  return prices as Record<AssetId, MarketPrice>;
}

export function generateInitialAvailableAssets(): AssetId[] {
  return ASSETS.map(a => a.id as AssetId);
}

export function runMarketLoop(state: GameState, targetCommunity: CommunityId): MarketLoopResult {
  const newEvents: GameEvent[] = [];
  let updatedCash = state.current_cash;
  let updatedDebt = state.current_debt * (1 + DEBT_INTEREST_RATE);
  let updatedBankSavings = state.bank_savings * (1 + BANK_INTEREST_RATE);
  let updatedHealth = Math.min(100, state.health + 5);
  let encounter: EncounterState | null = null;
  let robbedAmount = 0;
  let bankHackedAmount = 0;

  const communityData = COMMUNITY_MAP[targetCommunity];
  const communityName = communityData.name;

  const availableAssets = pickAvailableAssets();

  const newPrices: Partial<Record<AssetId, MarketPrice>> = {};
  for (const asset of ASSETS) {
    const variance = (Math.random() * 2 - 1) * asset.volatility;
    newPrices[asset.id as AssetId] = {
      assetId: asset.id as AssetId,
      price: asset.basePrice * (1 + variance),
      isAnomaly: false,
    };
  }

  if (Math.random() < ANOMALY_PROBABILITY) {
    const eligibleAssets = ASSETS.filter(a => availableAssets.includes(a.id as AssetId));
    const anomalyAsset = eligibleAssets[Math.floor(Math.random() * eligibleAssets.length)];
    const isSurge = Math.random() < 0.5;
    const assetId = anomalyAsset.id as AssetId;
    const currentEntry = newPrices[assetId]!;

    if (isSurge) {
      const mult = 5 + Math.random() * 5;
      newPrices[assetId] = { ...currentEntry, price: currentEntry.price * mult, isAnomaly: true, anomalyType: 'surge' };
      const msg = fillTemplate(pickRandom(SURGE_TEMPLATES), { Company: anomalyAsset.name, Community: communityName });
      newEvents.push({ id: generateEventId(), type: 'surge', message: msg, day: state.current_day + 1 });
    } else {
      const mult = 0.1 + Math.random() * 0.1;
      newPrices[assetId] = { ...currentEntry, price: currentEntry.price * mult, isAnomaly: true, anomalyType: 'crash' };
      const msg = fillTemplate(pickRandom(CRASH_TEMPLATES), { Company: anomalyAsset.name, Community: communityName });
      newEvents.push({ id: generateEventId(), type: 'crash', message: msg, day: state.current_day + 1 });
    }
  }

  if (Math.random() < ROBBERY_PROBABILITY && updatedCash > 0) {
    const fraction = Math.random() * ROBBERY_MAX_FRACTION;
    robbedAmount = Math.floor(updatedCash * fraction);
    if (robbedAmount > 0) {
      updatedCash -= robbedAmount;
      const msg = fillTemplate(pickRandom(ROBBERY_TEMPLATES), {
        Community: communityName,
        Amount: formatCurrencyFull(robbedAmount),
      });
      newEvents.push({ id: generateEventId(), type: 'robbery', message: msg, day: state.current_day + 1 });
    }
  }

  if (Math.random() < BANK_HACK_PROBABILITY && updatedBankSavings > 0) {
    const fraction = Math.random() * BANK_HACK_MAX_FRACTION;
    bankHackedAmount = Math.floor(updatedBankSavings * fraction);
    if (bankHackedAmount > 0) {
      updatedBankSavings -= bankHackedAmount;
      const msg = fillTemplate(pickRandom(BANK_HACK_TEMPLATES), {
        Amount: formatCurrencyFull(bankHackedAmount),
      });
      newEvents.push({ id: generateEventId(), type: 'bank_hack', message: msg, day: state.current_day + 1 });
    }
  }

  const ftcProbability = FTC_BASE_PROBABILITY + communityData.ftcVariance;
  if (Math.random() < ftcProbability) {
    const msg = fillTemplate(pickRandom(FTC_TEMPLATES), { Community: communityName });
    encounter = { communityName, message: msg };
  }

  const combinedEvents = [...newEvents, ...state.event_log].slice(0, 20);

  const updatedState: Partial<GameState> = {
    current_day: state.current_day + 1,
    current_debt: updatedDebt,
    bank_savings: updatedBankSavings,
    current_cash: updatedCash,
    health: updatedHealth,
    market_prices: newPrices as Record<AssetId, MarketPrice>,
    available_assets: availableAssets,
    current_community: targetCommunity,
    event_log: combinedEvents,
    game_phase: encounter ? 'encounter' : 'playing',
    encounter_state: encounter,
  };

  return { updatedState, newEvents, encounter, robbedAmount, bankHackedAmount };
}
