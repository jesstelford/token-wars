export type GearRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type GearEffectType =
  | 'capacity_boost'
  | 'robbery_prob_reduction'
  | 'bank_hack_prob_reduction'
  | 'anomaly_prob_boost'
  | 'positive_event_boost'
  | 'health_regen_boost'
  | 'debt_rate_reduction'
  | 'fight_health_reduction'
  | 'run_inventory_loss_reduction'
  | 'robbery_loss_reduction'
  | 'combined_bionic'
  | 'combined_vault'
  | 'combined_alpha';

export interface GearItem {
  id: GearItemId;
  name: string;
  description: string;
  effectSummary: string;
  rarity: GearRarity;
  icon: string;
  effectType: GearEffectType;
  effectValue: number;
  debtCost: number;
  scrapValue: number;
}

export const GEAR_ITEMS: GearItem[] = [
  {
    id: 'rabbit_foot_usb',
    name: "Rabbit's Foot USB",
    description: 'A cracked plastic drive that somehow never gets seized.',
    effectSummary: '-2% robbery chance',
    rarity: 'common',
    icon: 'Usb',
    effectType: 'robbery_prob_reduction',
    effectValue: 0.02,
    debtCost: 300,
    scrapValue: 150,
  },
  {
    id: 'encrypted_nas',
    name: 'Encrypted NAS Drive',
    description: 'Ruggedized storage unit with AES-256 encryption. Holds more.',
    effectSummary: '+15 inventory capacity',
    rarity: 'common',
    icon: 'HardDrive',
    effectType: 'capacity_boost',
    effectValue: 15,
    debtCost: 400,
    scrapValue: 200,
  },
  {
    id: 'medkit_sub',
    name: 'Medkit Subscription',
    description: 'Monthly delivery of recovery essentials. Heals faster.',
    effectSummary: '+3 vibes recovery per travel',
    rarity: 'common',
    icon: 'HeartPulse',
    effectType: 'health_regen_boost',
    effectValue: 3,
    debtCost: 350,
    scrapValue: 175,
  },
  {
    id: 'loan_shark_contact',
    name: 'Loan Shark Contact',
    description: 'Shady refinancing deal. Your debt compounds a little slower.',
    effectSummary: '-1% daily debt interest',
    rarity: 'common',
    icon: 'Phone',
    effectType: 'debt_rate_reduction',
    effectValue: 0.01,
    debtCost: 500,
    scrapValue: 250,
  },
  {
    id: 'vpn_cloak',
    name: 'VPN Cloak',
    description: 'Obfuscates your trail. When caught running, you lose less.',
    effectSummary: '-25% inventory loss on failed run',
    rarity: 'uncommon',
    icon: 'EyeOff',
    effectType: 'run_inventory_loss_reduction',
    effectValue: 0.25,
    debtCost: 1500,
    scrapValue: 600,
  },
  {
    id: 'insider_newsletter',
    name: 'Insider Newsletter',
    description: 'Curated alpha from anonymous sources. More token drops flow your way.',
    effectSummary: '+5% chance of free token drops',
    rarity: 'uncommon',
    icon: 'Mail',
    effectType: 'positive_event_boost',
    effectValue: 0.05,
    debtCost: 1200,
    scrapValue: 500,
  },
  {
    id: '2fa_key',
    name: '2FA Hardware Key',
    description: 'Physical authentication token. Hackers bounce off your bank.',
    effectSummary: '-2% bank hack chance',
    rarity: 'uncommon',
    icon: 'KeyRound',
    effectType: 'bank_hack_prob_reduction',
    effectValue: 0.02,
    debtCost: 1800,
    scrapValue: 700,
  },
  {
    id: 'sentiment_analyzer',
    name: 'Sentiment Analyzer',
    description: 'Reads the crowd before the market moves. More anomalies detected.',
    effectSummary: '+5% anomaly probability',
    rarity: 'uncommon',
    icon: 'BarChart2',
    effectType: 'anomaly_prob_boost',
    effectValue: 0.05,
    debtCost: 2200,
    scrapValue: 900,
  },
  {
    id: 'legal_shield',
    name: 'Legal Shield',
    description: 'Pre-paid legal retainer. FTC fights hurt a lot less.',
    effectSummary: '-30% vibes lost when fight fails',
    rarity: 'rare',
    icon: 'Scale',
    effectType: 'fight_health_reduction',
    effectValue: 0.30,
    debtCost: 6000,
    scrapValue: 2000,
  },
  {
    id: 'whale_tracker',
    name: 'Whale Tracker',
    description: 'Monitors on-chain megawallet moves. Surges and crashes appear more often.',
    effectSummary: '+10% anomaly probability',
    rarity: 'rare',
    icon: 'Radar',
    effectType: 'anomaly_prob_boost',
    effectValue: 0.10,
    debtCost: 7500,
    scrapValue: 2500,
  },
  {
    id: 'diplomatic_passport',
    name: 'Diplomatic Passport',
    description: 'Grants immunity in certain territories. Robbers take less.',
    effectSummary: '-30% max fraction lost to robbery',
    rarity: 'rare',
    icon: 'BadgeCheck',
    effectType: 'robbery_loss_reduction',
    effectValue: 0.30,
    debtCost: 8000,
    scrapValue: 2800,
  },
  {
    id: 'quantum_drive',
    name: 'Quantum Hard Drive',
    description: 'Theoretically infinite storage. Practically, just enormous.',
    effectSummary: '+35 inventory capacity',
    rarity: 'rare',
    icon: 'Database',
    effectType: 'capacity_boost',
    effectValue: 35,
    debtCost: 9000,
    scrapValue: 3000,
  },
  {
    id: 'bionic_implant',
    name: 'Bionic Implant',
    description: 'Sub-dermal hardware upgrade. You heal fast and take hits like a tank.',
    effectSummary: '+10 vibes regen per travel, -50% fight damage',
    rarity: 'legendary',
    icon: 'Zap',
    effectType: 'combined_bionic',
    effectValue: 0,
    debtCost: 22000,
    scrapValue: 7000,
  },
  {
    id: 'cold_storage_vault',
    name: 'Cold Storage Vault',
    description: 'Air-gapped hardware wallet in a undisclosed bunker. Nearly unhackable.',
    effectSummary: '-3% bank hack chance, -40% hack loss',
    rarity: 'legendary',
    icon: 'Vault',
    effectType: 'combined_vault',
    effectValue: 0,
    debtCost: 26000,
    scrapValue: 8500,
  },
  {
    id: 'alpha_leak_feed',
    name: 'Alpha Leak Feed',
    description: 'Direct line to the most well-connected insiders. Everything moves in your favor.',
    effectSummary: '+10% positive events, +8% anomaly chance',
    rarity: 'legendary',
    icon: 'Antenna',
    effectType: 'combined_alpha',
    effectValue: 0,
    debtCost: 30000,
    scrapValue: 10000,
  },
];

export type GearItemId =
  | 'rabbit_foot_usb'
  | 'encrypted_nas'
  | 'medkit_sub'
  | 'loan_shark_contact'
  | 'vpn_cloak'
  | 'insider_newsletter'
  | '2fa_key'
  | 'sentiment_analyzer'
  | 'legal_shield'
  | 'whale_tracker'
  | 'diplomatic_passport'
  | 'quantum_drive'
  | 'bionic_implant'
  | 'cold_storage_vault'
  | 'alpha_leak_feed';

export const GEAR_MAP = Object.fromEntries(GEAR_ITEMS.map(g => [g.id, g])) as Record<GearItemId, GearItem>;

export const RARITY_COLORS: Record<GearRarity, { border: string; badge: string; text: string; bg: string }> = {
  common: {
    border: 'border-slate-400 dark:border-slate-500',
    badge: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    text: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-800',
  },
  uncommon: {
    border: 'border-teal-400 dark:border-teal-500',
    badge: 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300',
    text: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
  },
  rare: {
    border: 'border-amber-400 dark:border-amber-500',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  legendary: {
    border: 'border-rose-400 dark:border-rose-500',
    badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
    text: 'text-rose-600 dark:text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
};

export const MAX_GEAR_SLOTS = 3;
