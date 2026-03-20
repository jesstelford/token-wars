# Token Wars - Architectural Blueprint (AGENTS.md)

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18.3 + TypeScript 5.5 |
| Build Tool | Vite 5.4 |
| Styling | Tailwind CSS 3.4 (utility-first) |
| Icons | Lucide React |
| Persistence | Browser LocalStorage only |
| Auth | None |
| Server | None |

---

## Data Persistence

- **Storage**: Browser-native `localStorage` exclusively. Zero server-side egress.
- **Key**: `token_wars_save` for active game state, `token_wars_scores` for high score table, `token_wars_theme` for dark mode preference.
- **Serialization**: JSON stringify/parse.
- **Auto-save**: Every state mutation (every turn advance and every free action).
- **Save-on-unload**: `beforeunload` event listener.

---

## Game State Variables

| Variable | Type | Description |
|---|---|---|
| `current_cash` | number | Liquid USD available |
| `bank_savings` | number | Deposited cash (safe from robbery) |
| `current_debt` | number | Outstanding loan balance |
| `health` | number | 0–100, simulation ends at 0 |
| `current_day` | number | 1–31 |
| `inventory` | InventoryItem[] | Array of { assetId, quantity } |
| `capacity` | number | Max total inventory units (default 100) |
| `current_community` | string | Active community node ID |
| `market_prices` | Record<string, number> | Current price per asset |
| `event_log` | GameEvent[] | Last 20 events |
| `game_phase` | GamePhase | 'title' \| 'playing' \| 'encounter' \| 'gameover' |

---

## Asset Registry (9 Entities)

| Tier | ID | Display Name | Base Price (USD) | Volatility |
|---|---|---|---|---|
| 1 | openai | OpenAI | 15,000 | Extreme |
| 1 | anthropic | Anthropic | 10,000 | Extreme |
| 2 | deepmind | Google DeepMind | 5,000 | High |
| 2 | meta_ai | Meta AI | 2,500 | High |
| 3 | mistral | Mistral | 1,200 | Moderate |
| 3 | cohere | Cohere | 700 | Moderate |
| 4 | perplexity | Perplexity | 300 | Low |
| 4 | huggingface | Hugging Face | 150 | Low |
| 4 | grok | Grok | 50 | Low |

Volatility maps to random variance range:
- Extreme: ±35%
- High: ±28%
- Moderate: ±20%
- Low: ±12%

---

## Community Nodes (6 Operational Nodes)

| ID | Display Name | FTC Variance | Description |
|---|---|---|---|
| reddit | Reddit | +2% | High traffic, moderate risk |
| discord | Discord | -2% | Tight-knit, slightly safer |
| dark_web | The Dark Web | +8% | High regulator presence |
| twitter | X (formerly Twitter) | +4% | Volatile, elevated risk |
| podcast | Podcast Promos | -4% | Low enforcement zone |
| github | GitHub | -5% | Developer community, safest |

Base FTC encounter probability: **10%**. Per-community variance is added to the base.

---

## Market Loop Algorithm (Executed on Every Move)

1. **Temporal Advance**: `current_day += 1`. If `current_day > 31`, trigger Final Liquidation.
2. **Debt Accrual**: `current_debt = current_debt * 1.10`.
3. **Bank Interest**: `bank_savings = bank_savings * 1.03`.
4. **Price Generation**: For each asset: `variance = Random(-volatility, +volatility)`, `current_price = base_price * (1 + variance)`.
5. **Anomaly Check (15% probability)**: If triggered, select Surge or Crash, select target asset.
   - Surge: `current_price = current_price * Random(5, 10)`. Apply anomaly color highlight.
   - Crash: `current_price = current_price * Random(0.1, 0.2)`. Apply anomaly color highlight.
6. **Robbery Check (8% probability)**: If triggered, `stolen = current_cash * Random(0, 0.50)`. Bank savings untouched.
7. **Bank Hack Check (4% probability)**: If triggered, `stolen = bank_savings * Random(0, 0.80)`.
8. **FTC Encounter Check**: `roll = Random(0,1)`. If `roll < (0.10 + community_variance)`, trigger encounter modal.
9. **Event Notification**: Push corresponding string to event log.

---

## Banking Mechanic Rules

- Deposit and Withdraw are **free actions** (do NOT advance the day or trigger the market loop).
- `bank_savings` is immune to the robbery check.
- `bank_savings` earns **3% interest** on every Move action.
- **4% chance** on every Move action that the bank gets hacked: up to 80% of `bank_savings` is stolen.
- Robbery steals up to 50% of `current_cash` (not bank savings). **8% chance** per Move.

---

## FTC Encounter Resolution

- **Run**: 60% success rate. Failure: `health -= 20`, lose all inventory.
- **Stay and Fight**: 30% success rate. Failure: `health -= 50` or simulation terminated if health <= 0. Success: retain all assets, stay at current node.

---

## Price Color Coding

- **Only anomaly prices** receive color coding (surge = amber/orange, crash = red).
- Regular price fluctuations are displayed without color highlights.

---

## Event String Templates (8 per type, randomly selected)

### Positive Anomaly (Surge)
1. "The hype around {Company} is reaching a fever pitch in {Community}. Prices are sky-high!"
2. "A major VC just went all-in on {Company} tokens. {Community} is going wild!"
3. "{Company} just announced AGI. {Community} can't stop talking about it. Prices are insane!"
4. "Elon tweeted about {Company} and {Community} imploded. Moon mission confirmed."
5. "{Company} tokens are flying off the shelves in {Community}. Demand is unprecedented!"
6. "A celebrity endorsement has sent {Company} prices through the roof in {Community}."
7. "{Community} insiders are stacking {Company} like there's no tomorrow. FOMO is real."
8. "A leaked roadmap for {Company} has {Community} in a frenzy. Prices have 5x'd overnight."

### Negative Anomaly (Crash)
1. "A major security breach has compromised {Company} infrastructure. Token value has cratered!"
2. "A new open-source model has disrupted {Company}. Prices are bottoming out!"
3. "A whistleblower in {Community} exposed {Company}'s training data scandal. Prices tanked."
4. "The SEC froze all {Company} transactions. {Community} is in panic mode."
5. "{Company} accidentally leaked their weights. The market is in freefall in {Community}."
6. "A coordinated short attack on {Company} has wiped out gains in {Community}."
7. "{Company}'s flagship model just failed a public safety audit. {Community} is dumping."
8. "A congressional hearing named {Company} as a systemic risk. Prices collapsed."

### Inventory Expansion
1. "You found a discarded {Storage_Device} in {Community}. You can now carry more tokens!"
2. "A generous dev in {Community} left a {Storage_Device} on a park bench. Extra capacity unlocked."
3. "Dumpster diving behind a {Community} data center paid off. {Storage_Device} found. +25 capacity."
4. "A {Storage_Device} fell out of someone's pocket in {Community}. Finders keepers. More room."
5. "You traded a meme NFT for a {Storage_Device} in {Community}. Capacity increased."
6. "A stranger in {Community} handed you a {Storage_Device} and said 'you'll need this'. Odd."
7. "You won a {Storage_Device} in a {Community} trivia contest. Inventory expanded."
8. "An anonymous tip led you to a {Storage_Device} hidden in {Community}. Jackpot."

### Resource Influx (Free Tokens)
1. "A venture capitalist in {Community} gave you {Quantity} units of {Company} to 'spread the word'!"
2. "A {Company} dev airdropped {Quantity} tokens to everyone in {Community}. You caught some."
3. "You completed a {Company} survey in {Community} and received {Quantity} tokens as payment."
4. "A whale in {Community} is distributing {Quantity} {Company} tokens for 'marketing purposes'."
5. "You helped debug a {Company} repo in {Community}. They paid you {Quantity} tokens."
6. "{Company} ran a promotional campaign in {Community}. You snagged {Quantity} free tokens."
7. "A {Company} ambassador in {Community} liked your post. {Quantity} tokens deposited."
8. "You found {Quantity} {Company} tokens in an old {Community} thread. Someone forgot to claim them."

### Regulator Intervention
1. "The FTC is raiding {Community}! Run or Stay and Fight?"
2. "Plainclothes regulators just swept into {Community}. Do you run or stand your ground?"
3. "A tip-off brought the feds to {Community}. Everyone's scattering. What do you do?"
4. "SEC agents are checking wallets in {Community}. You've been spotted. Run or fight?"
5. "A compliance drone is scanning {Community}. You're flagged. Flee or face them?"
6. "The regulators finally found {Community}. Your exit is closing. Run or Stay and Fight?"
7. "Two agents in dark suits just entered {Community}. They're heading your way. Run or fight?"
8. "A market surveillance alert has triggered in {Community}. Agents incoming. Your move."

### Robbery
1. "You got robbed on the way to {Community}! Someone lifted {Amount} from your pockets."
2. "A pickpocket in {Community} hit you before you could react. {Amount} is gone."
3. "Your transfer to {Community} was intercepted. {Amount} in cash stolen. Bank untouched."
4. "Someone shoulder-surfed your credentials near {Community}. {Amount} drained from your wallet."
5. "A mugging outside {Community}'s server farm cost you {Amount}. Keep your head down."
6. "A social engineering attack between communities netted a thief {Amount} of your cash."
7. "You were ambushed near {Community}. {Amount} gone. At least the bank is safe."
8. "A flash mob in {Community} distracted you while someone lifted {Amount} from your account."

### Bank Hack
1. "Your bank account was breached! {Amount} has been siphoned by a remote attacker."
2. "A zero-day exploit hit the bank servers. {Amount} of your savings is gone."
3. "An APT group targeted financial institutions. You lost {Amount} from your account."
4. "Phishing attack successful — the attacker cleared {Amount} from your bank balance."
5. "A state-sponsored hacker group raided your savings. {Amount} is unrecoverable."
6. "Your bank notified you of 'unusual activity'. {Amount} was transferred out without your consent."
7. "A supply chain attack on the banking software cost you {Amount} in savings."
8. "Your account was compromised in a credential stuffing attack. {Amount} stolen from the bank."

---

## Score Formula

```
Score = (current_cash + bank_savings) - (current_debt * 2)
```

---

## File Structure

```
src/
  constants/
    assets.ts         # Asset registry (9 entities)
    communities.ts    # Community node definitions
    events.ts         # Event string template arrays (8 per type)
  types/
    game.ts           # All TypeScript interfaces
  hooks/
    useLocalStorage.ts
    useGameState.ts
    useKeyboardNav.ts
    useGamepadInput.ts
  utils/
    marketLoop.ts     # Price generation, anomaly check, debt accrual, bank interest
    encounters.ts     # FTC encounter resolution, robbery, bank hack
    scoring.ts        # Final score calculation
    formatting.ts     # Currency and number formatting helpers
  components/
    Header/
      Header.tsx
    Market/
      MarketView.tsx
      AssetRow.tsx
    Inventory/
      InventoryView.tsx
      InventoryRow.tsx
    Travel/
      TravelPanel.tsx   # Always-visible inline panel
    Finance/
      FinanceModal.tsx
    Encounter/
      EncounterModal.tsx
    Console/
      ControlConsole.tsx
    Modals/
      BuyModal.tsx
      SellModal.tsx
      EventModal.tsx
    Screens/
      TitleScreen.tsx
      GameOverScreen.tsx
      HighScoresModal.tsx
    EventLog/
      EventLog.tsx
  App.tsx
  main.tsx
  index.css
```

---

## UI Architecture

- **Root**: `display: flex; flex-direction: column; height: 100vh; overflow: hidden; max-width: 1400px; margin: auto`
- **Header HUD**: Fixed height, flex row, displays Cash, Bank, Debt, Day, Health, Community, Dark Mode toggle
- **Main Dashboard**: `flex: 1`, three columns: Market View (flex: 2), Inventory View (flex: 1), Travel Panel (flex: 1, always visible)
- **Control Console**: Fixed 80px height footer with Buy, Sell, Finance action buttons
- **Modals**: FTC Encounter, Buy, Sell, Finance, High Scores History — overlay on demand

---

## Input Matrix

| Action | Keyboard | Mouse/Touch | Gamepad |
|---|---|---|---|
| Navigate | Arrow keys, Tab | Click/Tap | D-pad |
| Activate | Enter, Space | Click/Tap | A or X |
| Cancel/Back | Escape | Click backdrop | B |
| Pane switch | Tab / Shift+Tab | Click | Shoulder buttons |

---

## CSS Architecture

- **Framework**: Tailwind CSS utility-first
- **Dark Mode**: `darkMode: 'class'` in tailwind.config.js, toggled via `document.documentElement.classList`
- **Container Queries**: `@container` for Market and Inventory pane responsiveness
- **Centering**: `max-width: 1400px; margin: auto` on root
- **Performance**: Default CSS `transition` for state changes; `transform`/`opacity` hardware-accelerated animations for capable devices; `prefers-reduced-motion` media query disables animations

---

## Color Coding Rules

- Anomaly Surge prices: amber/orange highlight
- Anomaly Crash prices: red highlight
- Regular price fluctuations: NO color coding (neutral display)
- Health bar: green > 60, amber 30-60, red < 30
- Debt: red when debt exceeds 50% of net worth

---

## High Score Storage

- Key: `token_wars_scores`
- Format: Array of `{ name: string, score: number, date: string, days_survived: number }`
- Sorted by score descending
- No cap on stored entries
- Title screen shows top 5 inline; clicking opens full history modal
