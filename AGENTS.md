# Token Wars — Agent Reference

## Documentation

| File | Purpose |
|---|---|
| `GAME_DESIGN.md` | Full game mechanics reference — assets, economy, events, encounters, scoring, and strategy notes |
| `DECISIONS.md` | Chronological log of design and implementation decisions with rationale |

---

## Stack

React 18 + TypeScript 5 | Vite 5 | Tailwind CSS 3 | Lucide React | LocalStorage (no server, no auth)

---

## Source Map

```
src/
  App.tsx                          # Root: modal orchestration, state wiring
  constants/
    assets.ts                      # Asset registry, game constants (rates, probabilities)
    communities.ts                 # Community node definitions + FTC variance
    events.ts                      # Event string templates (8 per type), pickRandom, fillTemplate
  types/
    game.ts                        # All TS interfaces: GameState, ModalType, PendingTheft, PendingFreeToken, etc.
  hooks/
    useGameState.ts                # All state mutations (buy, sell, travel, encounter resolution, etc.)
    useLocalStorage.ts             # Generic LocalStorage hook
    useKeyboardNav.ts              # Keyboard navigation bindings
    useGamepadInput.ts             # Gamepad bindings
  utils/
    marketLoop.ts                  # Price generation, anomaly, debt accrual, robbery, free tokens
    encounters.ts                  # FTC run/fight resolution logic
    scoring.ts                     # Score formula
    formatting.ts                  # Currency/number formatting helpers
  components/
    Header/Header.tsx              # HUD: cash, bank, debt, day, health, community, dark mode
    Stats/StatsPanel.tsx           # Secondary stats display
    Market/MarketView.tsx          # Asset price list + buy entry
    Market/AssetRow.tsx
    Inventory/InventoryView.tsx    # Held tokens + sell entry
    Inventory/InventoryRow.tsx
    Travel/TravelPanel.tsx         # Community selector (always visible, triggers market loop on travel)
    Finance/FinanceModal.tsx       # Debt repayment, deposit, withdraw (free actions)
    Encounter/EncounterModal.tsx   # FTC run/fight modal
    Console/ControlConsole.tsx     # Action button footer
    Modals/
      BuyModal.tsx                 # Quantity input + buy confirmation
      SellModal.tsx                # Quantity input + sell confirmation
      TheftModal.tsx               # Robbery / bank hack notification
      FreeTokenModal.tsx           # Resource influx notification
    Screens/
      TitleScreen.tsx
      GameOverScreen.tsx
      HighScoresModal.tsx
    EventLog/EventLog.tsx          # Last 20 events strip
```

---

## State (`GameState` — `src/types/game.ts`)

| Field | Notes |
|---|---|
| `current_cash` | Liquid funds |
| `bank_savings` | Safe from robbery; earns 3% interest per move |
| `current_debt` | Compounds 8% per move (see `DEBT_INTEREST_RATE` in `assets.ts`) |
| `health` | 0–100; 0 = game over |
| `current_day` | 1–31; exceeding `MAX_DAYS` ends game |
| `inventory` | `InventoryItem[]` — assetId, quantity, avgPurchasePrice |
| `capacity` | Max total inventory units |
| `current_community` | Active `CommunityId` |
| `market_prices` | `Record<AssetId, MarketPrice>` |
| `event_log` | Last 20 `GameEvent` entries |
| `game_phase` | `'title' \| 'playing' \| 'encounter' \| 'gameover'` |
| `encounter_state` | Non-null during FTC encounter |
| `pending_thefts` | Queue of robbery/bank hack notifications |
| `pending_free_tokens` | Queue of free token awards awaiting modal dismissal |

LocalStorage keys: `token_wars_save`, `token_wars_scores`, `token_wars_theme`.

---

## Assets (`src/constants/assets.ts`)

9 assets across 4 tiers. Tier determines base price, volatility, and free token quantity range.

| Tier | IDs | Volatility | Free token range |
|---|---|---|---|
| 1 | `openai`, `anthropic` | ±35% | 1–4 |
| 2 | `deepmind`, `meta_ai` | ±28% | 2–7 |
| 3 | `mistral`, `cohere` | ±20% | 5–13 |
| 4 | `perplexity`, `huggingface`, `grok` | ±12% | 8–20 |

---

## Market Loop (`src/utils/marketLoop.ts`)

Runs on every `travel()` call. Sequence:

1. Day +1 → if > `MAX_DAYS`, trigger game over
2. Debt × `DEBT_INTEREST_RATE` (8%)
3. Bank savings × `BANK_INTEREST_RATE` (3%)
4. Price regeneration per asset (base × (1 ± volatility))
5. Anomaly check (`ANOMALY_PROBABILITY` 20%): surge ×5–10 or crash ×0.1–0.2
6. Robbery check (`ROBBERY_PROBABILITY` 10%): up to 50% of `current_cash`
7. Bank hack check (`BANK_HACK_PROBABILITY` 6%): up to 80% of `bank_savings`
8. FTC encounter check (`FTC_BASE_PROBABILITY` 18% + community variance)
9. Free token check (`POSITIVE_EVENT_PROBABILITY` 15%): random asset, tier-based quantity
10. Returns `{ updatedState, robbedAmount, bankHackedAmount, freeTokenEvent }`

---

## Key Flows

**Travel** (`useGameState.ts → travel()`): runs market loop, merges state, populates `pending_thefts` and `pending_free_tokens` queues. Modal display priority in `App.tsx`: encounter → theft → free token → buy/sell/finance.

**Buy/Sell**: quantity input resets to previous value (not clamped) if typed value exceeds max. See `BuyModal.tsx` / `SellModal.tsx` `handleInputChange`.

**FTC Encounter**: `src/utils/encounters.ts`. Run — 60% success, fail = −20 health + partial inventory loss. Fight — 30% success, fail = −40–50 health.

**Finance actions** (deposit, withdraw, pay debt): free actions — do not advance day or run market loop.

---

## Score Formula (`src/utils/scoring.ts`)

```
score = (current_cash + bank_savings) - (current_debt * 2)
```

High scores stored as `{ name, score, date, days_survived }[]`, sorted descending.

---

## Modal Orchestration (`App.tsx`)

`activeModal: ModalType` controls buy/sell/finance. Encounter, theft, and free token modals derive from game state directly (`game_phase === 'encounter'`, `pending_thefts[0]`, `pending_free_tokens[0]`). Blocking priority: encounter > theft > free token > activeModal.

---

## Styling Conventions

- Tailwind utility-first; dark mode via `class` strategy (`dark:` prefix)
- Anomaly surge: amber; crash: red. Regular price moves: no color
- Health bar: green >60, amber 30–60, red <30
- 8px spacing system; max-width 1024px centered
