export const ASSETS = [
  { id: 'openai', name: 'OpenAI', basePrice: 15000, tier: 1, volatility: 0.35 },
  { id: 'anthropic', name: 'Anthropic', basePrice: 10000, tier: 1, volatility: 0.35 },
  { id: 'deepmind', name: 'Gemini', basePrice: 5000, tier: 2, volatility: 0.28 },
  { id: 'meta_ai', name: 'Meta AI', basePrice: 2500, tier: 2, volatility: 0.28 },
  { id: 'mistral', name: 'Mistral', basePrice: 1200, tier: 3, volatility: 0.20 },
  { id: 'cohere', name: 'Cohere', basePrice: 700, tier: 3, volatility: 0.20 },
  { id: 'perplexity', name: 'Perplexity', basePrice: 300, tier: 4, volatility: 0.12 },
  { id: 'huggingface', name: 'Hugging Face', basePrice: 150, tier: 4, volatility: 0.12 },
  { id: 'grok', name: 'Grok', basePrice: 50, tier: 4, volatility: 0.12 },
] as const;

export type AssetId = typeof ASSETS[number]['id'];

export const ASSET_MAP = Object.fromEntries(ASSETS.map(a => [a.id, a])) as Record<AssetId, typeof ASSETS[number]>;

export const INITIAL_DEBT = 5500;
export const INITIAL_CAPACITY = 100;
export const MAX_DAYS = 31;
export const DEBT_INTEREST_RATE = 0.08;
export const BANK_INTEREST_RATE = 0.03;
export const ANOMALY_PROBABILITY = 0.20;
export const ROBBERY_PROBABILITY = 0.12;
export const ROBBERY_MAX_FRACTION = 0.50;
export const BANK_HACK_PROBABILITY = 0.06;
export const BANK_HACK_MAX_FRACTION = 0.80;
export const FTC_BASE_PROBABILITY = 0.18;
export const POSITIVE_EVENT_PROBABILITY = 0.30;
