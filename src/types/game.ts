import type { AssetId } from '../constants/assets';
import type { CommunityId } from '../constants/communities';

export type GamePhase = 'title' | 'playing' | 'encounter' | 'gameover';

export type EventType =
  | 'surge'
  | 'crash'
  | 'robbery'
  | 'bank_hack'
  | 'ftc'
  | 'inventory_expansion'
  | 'resource_influx'
  | 'info';

export interface GameEvent {
  id: string;
  type: EventType;
  message: string;
  day: number;
}

export interface InventoryItem {
  assetId: AssetId;
  quantity: number;
  avgPurchasePrice: number;
}

export interface MarketPrice {
  assetId: AssetId;
  price: number;
  isAnomaly: boolean;
  anomalyType?: 'surge' | 'crash';
}

export interface EncounterState {
  communityName: string;
  message: string;
}

export interface PendingTheft {
  type: 'robbery' | 'bank_hack';
  amountLost: number;
  newTotal: number;
}

export interface GameState {
  current_cash: number;
  bank_savings: number;
  current_debt: number;
  health: number;
  current_day: number;
  inventory: InventoryItem[];
  capacity: number;
  current_community: CommunityId;
  market_prices: Record<AssetId, MarketPrice>;
  available_assets: AssetId[];
  event_log: GameEvent[];
  game_phase: GamePhase;
  encounter_state: EncounterState | null;
  pending_thefts: PendingTheft[];
  pending_free_tokens: PendingFreeToken[];
}

export interface HighScoreEntry {
  name: string;
  score: number;
  date: string;
  days_survived: number;
}

export type ModalType = 'buy' | 'sell' | 'finance' | 'encounter' | 'highscores' | null;

export interface PendingFreeToken {
  assetId: AssetId;
  quantity: number;
  communityName: string;
}
