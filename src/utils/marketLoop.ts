import { ASSETS, ANOMALY_PROBABILITY, DEBT_INTEREST_RATE, BANK_INTEREST_RATE, ROBBERY_PROBABILITY, ROBBERY_MAX_FRACTION, BANK_HACK_PROBABILITY, BANK_HACK_MAX_FRACTION, FTC_BASE_PROBABILITY, POSITIVE_EVENT_PROBABILITY } from '../constants/assets';
import { COMMUNITY_MAP } from '../constants/communities';
import { SURGE_TEMPLATES, CRASH_TEMPLATES, ROBBERY_TEMPLATES, BANK_HACK_TEMPLATES, FTC_TEMPLATES, POSITIVE_EVENT_TEMPLATES, pickRandom, fillTemplate } from '../constants/events';
import type { GameState, GameEvent, MarketPrice, EncounterState, PendingFreeToken, PendingItemDrop, PendingVendor } from '../types/game';
import type { AssetId } from '../constants/assets';
import type { CommunityId } from '../constants/communities';
import { generateEventId } from './formatting';
import { formatCurrencyFull } from './formatting';
import type { ActiveEffects } from './gearEffects';
import { getAllGear } from './gearEffects';
import { rollScavengeDrop, rollVendorEvent, rollMilestoneDrop, pickMilestoneItem } from './itemDrops';
import { GEAR_MAP } from '../constants/items';

interface MarketLoopResult {
  updatedState: Partial<GameState>;
  newEvents: GameEvent[];
  encounter: EncounterState | null;
  robbedAmount: number;
  bankHackedAmount: number;
  freeTokenEvent: PendingFreeToken | null;
  pendingItemDrop: PendingItemDrop | null;
  pendingVendor: PendingVendor | null;
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

export function runMarketLoop(state: GameState, targetCommunity: CommunityId, gearEffects?: ActiveEffects): MarketLoopResult {
  const fx = gearEffects ?? {
    capacityBonus: 0, robberyProbReduction: 0, bankHackProbReduction: 0,
    anomalyProbBonus: 0, positiveEventProbBonus: 0, healthRegenBonus: 0,
    debtRateReduction: 0, fightHealthLossReduction: 0, runInventoryLossReduction: 0,
    robberyLossFractionReduction: 0, bankHackLossFractionReduction: 0,
  };

  const newEvents: GameEvent[] = [];
  let updatedCash = state.current_cash;
  const effectiveDebtRate = Math.max(0.02, DEBT_INTEREST_RATE - fx.debtRateReduction);
  const updatedDebt = state.current_debt * (1 + effectiveDebtRate);
  let updatedBankSavings = state.bank_savings * (1 + BANK_INTEREST_RATE);
  const healthRegen = Math.min(15, 5 + fx.healthRegenBonus);
  const updatedHealth = Math.min(100, state.health + healthRegen);
  let encounter: EncounterState | null = null;
  let robbedAmount = 0;
  let bankHackedAmount = 0;
  let updatedInventory = [...state.inventory];
  let freeTokenEvent: PendingFreeToken | null = null;
  let pendingItemDrop: PendingItemDrop | null = null;
  let pendingVendor: PendingVendor | null = null;

  const communityData = COMMUNITY_MAP[targetCommunity];
  const communityName = communityData.name;
  const nextDay = state.current_day + 1;

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

  const effectiveAnomalyProb = Math.min(0.50, ANOMALY_PROBABILITY + fx.anomalyProbBonus);
  if (Math.random() < effectiveAnomalyProb) {
    const eligibleAssets = ASSETS.filter(a => availableAssets.includes(a.id as AssetId));
    const anomalyAsset = eligibleAssets[Math.floor(Math.random() * eligibleAssets.length)];
    const isSurge = Math.random() < 0.5;
    const assetId = anomalyAsset.id as AssetId;
    const currentEntry = newPrices[assetId]!;

    if (isSurge) {
      const mult = 5 + Math.random() * 5;
      newPrices[assetId] = { ...currentEntry, price: currentEntry.price * mult, isAnomaly: true, anomalyType: 'surge' };
      const msg = fillTemplate(pickRandom(SURGE_TEMPLATES), { Company: anomalyAsset.name, Community: communityName });
      newEvents.push({ id: generateEventId(), type: 'surge', message: msg, day: nextDay });
    } else {
      const mult = 0.1 + Math.random() * 0.1;
      newPrices[assetId] = { ...currentEntry, price: currentEntry.price * mult, isAnomaly: true, anomalyType: 'crash' };
      const msg = fillTemplate(pickRandom(CRASH_TEMPLATES), { Company: anomalyAsset.name, Community: communityName });
      newEvents.push({ id: generateEventId(), type: 'crash', message: msg, day: nextDay });
    }
  }

  const effectiveRobberyProb = Math.max(0, ROBBERY_PROBABILITY - fx.robberyProbReduction);
  if (Math.random() < effectiveRobberyProb && updatedCash > 0) {
    const effectiveMaxFraction = Math.max(0.05, ROBBERY_MAX_FRACTION - fx.robberyLossFractionReduction);
    const fraction = Math.random() * effectiveMaxFraction;
    robbedAmount = Math.floor(updatedCash * fraction);
    if (robbedAmount > 0) {
      updatedCash -= robbedAmount;
      const msg = fillTemplate(pickRandom(ROBBERY_TEMPLATES), {
        Community: communityName,
        Amount: formatCurrencyFull(robbedAmount),
      });
      newEvents.push({ id: generateEventId(), type: 'robbery', message: msg, day: nextDay });
    }
  }

  const effectiveBankHackProb = Math.max(0, BANK_HACK_PROBABILITY - fx.bankHackProbReduction);
  if (Math.random() < effectiveBankHackProb && updatedBankSavings > 0) {
    const effectiveBankHackMax = Math.max(0.05, BANK_HACK_MAX_FRACTION - fx.bankHackLossFractionReduction);
    const fraction = Math.random() * effectiveBankHackMax;
    bankHackedAmount = Math.floor(updatedBankSavings * fraction);
    if (bankHackedAmount > 0) {
      updatedBankSavings -= bankHackedAmount;
      const msg = fillTemplate(pickRandom(BANK_HACK_TEMPLATES), {
        Amount: formatCurrencyFull(bankHackedAmount),
      });
      newEvents.push({ id: generateEventId(), type: 'bank_hack', message: msg, day: nextDay });
    }
  }

  const effectivePositiveEventProb = Math.min(0.40, POSITIVE_EVENT_PROBABILITY + fx.positiveEventProbBonus);
  if (Math.random() < effectivePositiveEventProb) {
    const eligibleAssets = ASSETS.filter(a => availableAssets.includes(a.id as AssetId));
    const chosenAsset = eligibleAssets[Math.floor(Math.random() * eligibleAssets.length)];
    const tier = chosenAsset.tier as 1 | 2 | 3 | 4;
    const quantityRanges: Record<1 | 2 | 3 | 4, [number, number]> = {
      1: [1, 4],
      2: [2, 7],
      3: [5, 13],
      4: [8, 20],
    };
    const [minQ, maxQ] = quantityRanges[tier];
    const quantity = minQ + Math.floor(Math.random() * (maxQ - minQ + 1));
    const usedCapacity = updatedInventory.reduce((sum, i) => sum + i.quantity, 0);
    const effectiveCapacity = state.capacity + fx.capacityBonus;
    const freeCapacity = effectiveCapacity - usedCapacity;
    const actualQuantity = Math.min(quantity, freeCapacity);
    if (actualQuantity > 0) {
      const assetId = chosenAsset.id as AssetId;
      const existingIdx = updatedInventory.findIndex(i => i.assetId === assetId);
      if (existingIdx >= 0) {
        updatedInventory = updatedInventory.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + actualQuantity } : item
        );
      } else {
        updatedInventory = [...updatedInventory, { assetId, quantity: actualQuantity, avgPurchasePrice: 0 }];
      }
      freeTokenEvent = { assetId, quantity: actualQuantity, communityName };
      const msg = fillTemplate(pickRandom(POSITIVE_EVENT_TEMPLATES), {
        Company: chosenAsset.name,
        Community: communityName,
        Quantity: String(actualQuantity),
      });
      newEvents.push({ id: generateEventId(), type: 'resource_influx', message: msg, day: nextDay });
    }
  }

  const ftcProbability = FTC_BASE_PROBABILITY + communityData.ftcVariance;
  if (Math.random() < ftcProbability) {
    const msg = fillTemplate(pickRandom(FTC_TEMPLATES), { Community: communityName });
    encounter = { communityName, message: msg };
  }

  const allGear = getAllGear(state);
  const gearSlotsFull = allGear.length >= 3;

  const milestoneRarity = rollMilestoneDrop(nextDay, allGear.length);
  if (milestoneRarity && !pendingItemDrop) {
    const milestoneItemId = pickMilestoneItem(milestoneRarity);
    pendingItemDrop = { itemId: milestoneItemId, source: 'milestone' };
    const gearItem = GEAR_MAP[milestoneItemId];
    newEvents.push({
      id: generateEventId(),
      type: 'gear_found',
      message: `Milestone reward: You discovered a ${gearItem?.name ?? milestoneItemId}!`,
      day: nextDay,
    });
  }

  if (!pendingItemDrop && !encounter) {
    const scavengeResult = rollScavengeDrop(targetCommunity, allGear, gearSlotsFull);
    if (scavengeResult) {
      pendingItemDrop = { itemId: scavengeResult, source: 'travel' };
      const gearItem = GEAR_MAP[scavengeResult];
      newEvents.push({
        id: generateEventId(),
        type: 'gear_found',
        message: `While passing through ${communityName}, you found a ${gearItem?.name ?? scavengeResult}.`,
        day: nextDay,
      });
    }
  }

  if (!pendingVendor && !encounter && !pendingItemDrop) {
    const vendor = rollVendorEvent(allGear, updatedCash);
    if (vendor) {
      pendingVendor = vendor;
      newEvents.push({
        id: generateEventId(),
        type: 'vendor',
        message: `A shadowy figure in ${communityName} has something to offer...`,
        day: nextDay,
      });
    }
  }

  const combinedEvents = [...newEvents, ...state.event_log].slice(0, 20);

  const updatedState: Partial<GameState> = {
    current_day: nextDay,
    current_debt: updatedDebt,
    bank_savings: updatedBankSavings,
    current_cash: updatedCash,
    health: updatedHealth,
    inventory: updatedInventory,
    market_prices: newPrices as Record<AssetId, MarketPrice>,
    available_assets: availableAssets,
    current_community: targetCommunity,
    event_log: combinedEvents,
    game_phase: encounter ? 'encounter' : 'playing',
    encounter_state: encounter,
  };

  return { updatedState, newEvents, encounter, robbedAmount, bankHackedAmount, freeTokenEvent, pendingItemDrop, pendingVendor };
}
