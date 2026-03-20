import { GEAR_MAP, GEAR_ITEMS, type GearItemId } from '../constants/items';

export interface ActiveEffects {
  capacityBonus: number;
  robberyProbReduction: number;
  bankHackProbReduction: number;
  anomalyProbBonus: number;
  positiveEventProbBonus: number;
  healthRegenBonus: number;
  debtRateReduction: number;
  fightHealthLossReduction: number;
  runInventoryLossReduction: number;
  robberyLossFractionReduction: number;
  bankHackLossFractionReduction: number;
}

export function computeGearEffects(gearIds: GearItemId[]): ActiveEffects {
  const effects: ActiveEffects = {
    capacityBonus: 0,
    robberyProbReduction: 0,
    bankHackProbReduction: 0,
    anomalyProbBonus: 0,
    positiveEventProbBonus: 0,
    healthRegenBonus: 0,
    debtRateReduction: 0,
    fightHealthLossReduction: 0,
    runInventoryLossReduction: 0,
    robberyLossFractionReduction: 0,
    bankHackLossFractionReduction: 0,
  };

  for (const id of gearIds) {
    const item = GEAR_MAP[id];
    if (!item) continue;

    switch (item.effectType) {
      case 'capacity_boost':
        effects.capacityBonus += item.effectValue;
        break;
      case 'robbery_prob_reduction':
        effects.robberyProbReduction += item.effectValue;
        break;
      case 'bank_hack_prob_reduction':
        effects.bankHackProbReduction += item.effectValue;
        break;
      case 'anomaly_prob_boost':
        effects.anomalyProbBonus += item.effectValue;
        break;
      case 'positive_event_boost':
        effects.positiveEventProbBonus += item.effectValue;
        break;
      case 'health_regen_boost':
        effects.healthRegenBonus += item.effectValue;
        break;
      case 'debt_rate_reduction':
        effects.debtRateReduction += item.effectValue;
        break;
      case 'fight_health_reduction':
        effects.fightHealthLossReduction += item.effectValue;
        break;
      case 'run_inventory_loss_reduction':
        effects.runInventoryLossReduction += item.effectValue;
        break;
      case 'robbery_loss_reduction':
        effects.robberyLossFractionReduction += item.effectValue;
        break;
      case 'combined_bionic':
        effects.healthRegenBonus += 10;
        effects.fightHealthLossReduction += 0.50;
        break;
      case 'combined_vault':
        effects.bankHackProbReduction += 0.03;
        effects.bankHackLossFractionReduction += 0.40;
        break;
      case 'combined_alpha':
        effects.positiveEventProbBonus += 0.10;
        effects.anomalyProbBonus += 0.08;
        break;
    }
  }

  effects.capacityBonus = Math.min(effects.capacityBonus, 75);
  effects.robberyProbReduction = Math.min(effects.robberyProbReduction, 0.08);
  effects.bankHackProbReduction = Math.min(effects.bankHackProbReduction, 0.06);
  effects.anomalyProbBonus = Math.min(effects.anomalyProbBonus, 0.25);
  effects.positiveEventProbBonus = Math.min(effects.positiveEventProbBonus, 0.20);
  effects.healthRegenBonus = Math.min(effects.healthRegenBonus, 15);
  effects.debtRateReduction = Math.min(effects.debtRateReduction, 0.04);
  effects.fightHealthLossReduction = Math.min(effects.fightHealthLossReduction, 0.60);
  effects.runInventoryLossReduction = Math.min(effects.runInventoryLossReduction, 0.50);
  effects.robberyLossFractionReduction = Math.min(effects.robberyLossFractionReduction, 0.50);
  effects.bankHackLossFractionReduction = Math.min(effects.bankHackLossFractionReduction, 0.60);

  return effects;
}

export function getStartingDebtCost(selectedGearIds: GearItemId[]): number {
  return selectedGearIds.reduce((sum, id) => {
    const item = GEAR_MAP[id];
    return sum + (item?.debtCost ?? 0);
  }, 0);
}

export function getAllGear(state: { equipped_gear: GearItemId[]; found_gear: GearItemId[] }): GearItemId[] {
  const combined = [...state.equipped_gear, ...state.found_gear];
  return combined.slice(0, 3);
}

export function canAddGear(state: { equipped_gear: GearItemId[]; found_gear: GearItemId[] }): boolean {
  return state.equipped_gear.length + state.found_gear.length < 3;
}

export function getScrapValue(itemId: GearItemId): number {
  return GEAR_MAP[itemId]?.scrapValue ?? 0;
}

export function rollWeightedRarity(communityId: string): GearItemId {
  const isDarkWeb = communityId === 'darkweb';

  const weights = isDarkWeb
    ? { common: 35, uncommon: 30, rare: 25, legendary: 10 }
    : { common: 50, uncommon: 30, rare: 15, legendary: 5 };

  const total = weights.common + weights.uncommon + weights.rare + weights.legendary;
  const roll = Math.random() * total;

  let rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  if (roll < weights.common) rarity = 'common';
  else if (roll < weights.common + weights.uncommon) rarity = 'uncommon';
  else if (roll < weights.common + weights.uncommon + weights.rare) rarity = 'rare';
  else rarity = 'legendary';

  const pool = GEAR_ITEMS.filter(g => g.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)].id;
}

export function rollFightRewardRarity(): GearItemId {
  const weights = { common: 25, uncommon: 40, rare: 30, legendary: 5 };
  const total = 100;
  const roll = Math.random() * total;

  let rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  if (roll < weights.common) rarity = 'common';
  else if (roll < weights.common + weights.uncommon) rarity = 'uncommon';
  else if (roll < weights.common + weights.uncommon + weights.rare) rarity = 'rare';
  else rarity = 'legendary';

  const pool = GEAR_ITEMS.filter(g => g.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)].id;
}
