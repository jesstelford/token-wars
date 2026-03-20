import type { GameState, InventoryItem } from '../types/game';
import { generateEventId } from './formatting';
import type { GameEvent } from '../types/game';
import type { ActiveEffects } from './gearEffects';
import { rollFightRewardRarity } from './gearEffects';
import type { GearItemId } from '../constants/items';
import { ASSET_MAP } from '../constants/assets';

const RUN_FAIL_HEALTH_LOSS = 20;

export interface LostInventoryEntry {
  assetId: string;
  name: string;
  quantityLost: number;
}

export interface EncounterResult {
  success: boolean;
  healthLost: number;
  lostInventory: boolean;
  terminated: boolean;
  message: string;
  event: GameEvent;
  itemDrop?: GearItemId;
  lostItems?: LostInventoryEntry[];
  precomputedInventory?: InventoryItem[];
}

export function buildDetailedInventoryLoss(
  inventory: InventoryItem[],
  gearEffects?: ActiveEffects,
): { newInventory: InventoryItem[]; lostItems: LostInventoryEntry[] } {
  if (inventory.length === 0) return { newInventory: inventory, lostItems: [] };
  const shuffled = [...inventory].sort(() => Math.random() - 0.5);
  const numToAffect = 1 + Math.floor(Math.random() * shuffled.length);
  const affected = new Set(shuffled.slice(0, numToAffect).map(i => i.assetId));
  const baseFraction = 0.5 + Math.random() * 0.5;
  const reduction = gearEffects?.runInventoryLossReduction ?? 0;
  const lossFraction = Math.max(0.05, baseFraction * (1 - reduction));

  const lostItems: LostInventoryEntry[] = [];
  const newInventory = inventory
    .map(item => {
      if (!affected.has(item.assetId)) return item;
      const lost = Math.ceil(item.quantity * lossFraction);
      const actualLost = Math.min(lost, item.quantity);
      if (actualLost > 0) {
        lostItems.push({
          assetId: item.assetId,
          name: ASSET_MAP[item.assetId as keyof typeof ASSET_MAP]?.name ?? item.assetId,
          quantityLost: actualLost,
        });
      }
      return { ...item, quantity: item.quantity - actualLost };
    })
    .filter(item => item.quantity > 0);

  return { newInventory, lostItems };
}

export function resolveRun(state: GameState, success: boolean, gearEffects?: ActiveEffects): EncounterResult {
  if (success) {
    return {
      success: true,
      healthLost: 0,
      lostInventory: false,
      terminated: false,
      message: 'You slipped away before they could catch you. Close call.',
      event: { id: generateEventId(), type: 'ftc_win', message: 'You escaped the regulators. Barely made it out.', day: state.current_day },
    };
  } else {
    const newHealth = state.health - RUN_FAIL_HEALTH_LOSS;
    const { newInventory, lostItems } = buildDetailedInventoryLoss(state.inventory, gearEffects);
    const lostSummary = lostItems.length > 0
      ? lostItems.map(l => `${l.quantityLost}x ${l.name}`).join(', ')
      : null;
    const message = lostSummary
      ? `They caught you. Seized: ${lostSummary}. -${RUN_FAIL_HEALTH_LOSS} vibes.`
      : `They caught you. Nothing seized. -${RUN_FAIL_HEALTH_LOSS} vibes.`;
    const eventMessage = lostSummary
      ? `Caught while fleeing. Seized: ${lostSummary}. -${RUN_FAIL_HEALTH_LOSS} vibes.`
      : `Caught while fleeing. No inventory lost. -${RUN_FAIL_HEALTH_LOSS} vibes.`;
    return {
      success: false,
      healthLost: RUN_FAIL_HEALTH_LOSS,
      lostInventory: lostItems.length > 0,
      terminated: newHealth <= 0,
      message,
      event: { id: generateEventId(), type: 'ftc', message: eventMessage, day: state.current_day },
      lostItems,
      precomputedInventory: newInventory,
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
      event: { id: generateEventId(), type: 'ftc_win', message: 'Stood your ground and won. Assets retained.', day: state.current_day },
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
        : `You lost the fight. -${healthLost} vibes. You kept your assets but at a cost.`,
      event: { id: generateEventId(), type: 'ftc', message: `Lost the fight. -${healthLost} vibes.`, day: state.current_day },
    };
  }
}

export function buildPartialInventoryLossWithGear(
  inventory: GameState['inventory'],
  gearEffects?: ActiveEffects,
): GameState['inventory'] {
  return buildDetailedInventoryLoss(inventory, gearEffects).newInventory;
}
