import type { GameState } from '../types/game';
import { generateEventId } from './formatting';
import type { GameEvent } from '../types/game';
import type { ActiveEffects } from './gearEffects';
import { rollFightRewardRarity } from './gearEffects';
import type { GearItemId } from '../constants/items';

const RUN_FAIL_HEALTH_LOSS = 20;

export interface EncounterResult {
  success: boolean;
  healthLost: number;
  lostInventory: boolean;
  terminated: boolean;
  message: string;
  event: GameEvent;
  itemDrop?: GearItemId;
}

export function resolveRun(state: GameState, success: boolean, gearEffects?: ActiveEffects): EncounterResult {
  if (success) {
    return {
      success: true,
      healthLost: 0,
      lostInventory: false,
      terminated: false,
      message: 'You slipped away before they could catch you. Close call.',
      event: { id: generateEventId(), type: 'ftc', message: 'You escaped the regulators. Barely made it out.', day: state.current_day },
    };
  } else {
    const newHealth = state.health - RUN_FAIL_HEALTH_LOSS;
    return {
      success: false,
      healthLost: RUN_FAIL_HEALTH_LOSS,
      lostInventory: true,
      terminated: newHealth <= 0,
      message: `They caught you. You lost some of your inventory and took ${RUN_FAIL_HEALTH_LOSS} health damage.`,
      event: { id: generateEventId(), type: 'ftc', message: `Caught while fleeing. Lost some inventory. -${RUN_FAIL_HEALTH_LOSS} health.`, day: state.current_day },
    };
  }
}

export function resolveFight(state: GameState, success: boolean, preRolledHealthLost?: number, gearEffects?: ActiveEffects): EncounterResult {
  if (success) {
    const canGetItem = (state.equipped_gear.length + state.found_gear.length) < 3;
    const getsItem = canGetItem && Math.random() < 0.40;
    const itemDrop = getsItem ? rollFightRewardRarity() : undefined;

    return {
      success: true,
      healthLost: 0,
      lostInventory: false,
      terminated: false,
      message: 'You outmaneuvered them legally. Assets retained, no damage taken.',
      event: { id: generateEventId(), type: 'ftc', message: 'Stood your ground and won. Assets retained.', day: state.current_day },
      itemDrop,
    };
  } else {
    const fx = gearEffects;
    const reduction = fx?.fightHealthLossReduction ?? 0;
    const baseHealth = preRolledHealthLost ?? (40 + Math.floor(Math.random() * 11));
    const healthLost = Math.round(baseHealth * (1 - reduction));
    const newHealth = state.health - healthLost;
    return {
      success: false,
      healthLost,
      lostInventory: false,
      terminated: newHealth <= 0,
      message: newHealth <= 0
        ? 'They took everything. Simulation terminated.'
        : `You lost the fight. -${healthLost} health. You kept your assets but at a cost.`,
      event: { id: generateEventId(), type: 'ftc', message: `Lost the fight. -${healthLost} health.`, day: state.current_day },
    };
  }
}

export function buildPartialInventoryLossWithGear(
  inventory: GameState['inventory'],
  gearEffects?: ActiveEffects,
): GameState['inventory'] {
  if (inventory.length === 0) return inventory;
  const shuffled = [...inventory].sort(() => Math.random() - 0.5);
  const numToAffect = 1 + Math.floor(Math.random() * shuffled.length);
  const affected = new Set(shuffled.slice(0, numToAffect).map(i => i.assetId));
  const baseFraction = 0.5 + Math.random() * 0.5;
  const reduction = gearEffects?.runInventoryLossReduction ?? 0;
  const lossFraction = Math.max(0.05, baseFraction * (1 - reduction));
  return inventory
    .map(item => {
      if (!affected.has(item.assetId)) return item;
      const lost = Math.ceil(item.quantity * lossFraction);
      return { ...item, quantity: item.quantity - lost };
    })
    .filter(item => item.quantity > 0);
}
