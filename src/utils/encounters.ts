import type { GameState } from '../types/game';
import { generateEventId } from './formatting';
import type { GameEvent } from '../types/game';

const RUN_FAIL_HEALTH_LOSS = 20;
const FIGHT_FAIL_HEALTH_LOSS = 50;

export interface EncounterResult {
  success: boolean;
  healthLost: number;
  lostInventory: boolean;
  terminated: boolean;
  message: string;
  event: GameEvent;
}

export function resolveRun(state: GameState, success: boolean): EncounterResult {
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
      message: `They caught you. You lost all your inventory and took ${RUN_FAIL_HEALTH_LOSS} health damage.`,
      event: { id: generateEventId(), type: 'ftc', message: `Caught while fleeing. Lost all inventory. -${RUN_FAIL_HEALTH_LOSS} health.`, day: state.current_day },
    };
  }
}

export function resolveFight(state: GameState, success: boolean): EncounterResult {
  if (success) {
    return {
      success: true,
      healthLost: 0,
      lostInventory: false,
      terminated: false,
      message: 'You outmaneuvered them legally. Assets retained, no damage taken.',
      event: { id: generateEventId(), type: 'ftc', message: 'Stood your ground and won. Assets retained.', day: state.current_day },
    };
  } else {
    const newHealth = state.health - FIGHT_FAIL_HEALTH_LOSS;
    return {
      success: false,
      healthLost: FIGHT_FAIL_HEALTH_LOSS,
      lostInventory: false,
      terminated: newHealth <= 0,
      message: newHealth <= 0
        ? 'They took everything. Simulation terminated.'
        : `You lost the fight. -${FIGHT_FAIL_HEALTH_LOSS} health. You kept your assets but at a cost.`,
      event: { id: generateEventId(), type: 'ftc', message: `Lost the fight. -${FIGHT_FAIL_HEALTH_LOSS} health.`, day: state.current_day },
    };
  }
}
