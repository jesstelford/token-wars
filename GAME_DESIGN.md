# TokenWars — Game Design Overview

## Concept

TokenWars is a single-player arbitrage simulation inspired by classic drug-trade games (Drugwars, Dope Wars). You play as a token broker with 31 days to pay off debt, grow your portfolio, and maximise your final score. Every day you travel to a new community, prices fluctuate, events fire, and you decide what to buy, sell, hold, bank, or run from.

---

## Core Loop

1. **Buy** tokens at the current community's market prices.
2. **Travel** to a new community. This advances the day, triggers the market loop, and can fire events.
3. **Sell** tokens at the new prices.
4. Repeat until Day 31, then optionally **Finish** the game to liquidate inventory.

---

## Assets

Nine AI company tokens arranged across four tiers by base price and volatility:

| Tier | Asset | Base Price | Volatility |
|------|-------|-----------|-----------|
| 1 | OpenAI | $15,000 | 35% |
| 1 | Anthropic | $10,000 | 35% |
| 2 | Gemini | $5,000 | 28% |
| 2 | Meta AI | $2,500 | 28% |
| 3 | Mistral | $1,200 | 20% |
| 3 | Cohere | $700 | 20% |
| 4 | Perplexity | $300 | 12% |
| 4 | Hugging Face | $150 | 12% |
| 4 | Grok | $50 | 12% |

Tier 1 assets offer the highest reward but require significant capital. Tier 4 assets are accessible early with low cash and low risk, but lower ceiling returns. Not all assets are available in every community — a random subset of at least half the assets is drawn each day.

---

## Communities

Six locations, each with a distinct FTC encounter risk modifier:

| Community | FTC Variance | Character |
|-----------|-------------|-----------|
| Meetups | -5% | Safest — in-person community |
| Podcast Promos | -4% | Low enforcement zone |
| Discord | -2% | Tight-knit, slightly safer |
| Reddit | +0% | High traffic, moderate risk |
| X (Twitter) | +4% | Volatile, elevated risk |
| The Dark Web | +8% | Highest regulator presence |

Travelling to the same community you are already in is not allowed. Each travel triggers the full market loop.

---

## Economy

### Starting Conditions
- Cash: $5,500
- Debt: $5,500 (must be repaid by end)
- Inventory capacity: 100 units
- Bank savings: $0

### Debt
Debt compounds at **8% per day**. Every day you travel, your outstanding debt grows. Ignoring debt is extremely costly over a 31-day run. Paying it down early is almost always the right play.

### Bank
You can deposit cash into the bank at any time. Bank savings earn **3% interest per day**. Critically, cash on hand is vulnerable to robbery while bank savings are only vulnerable to hacks (which are less frequent).

### Inventory Capacity
You start with 100 units of capacity. Capacity can be expanded by random positive events (storage device finds). Each token purchased consumes one unit of capacity regardless of tier.

---

## Market Mechanics

### Price Generation
Each day, all asset prices are independently regenerated from their base price with a random variance:

```
price = basePrice × (1 + random(-volatility, +volatility))
```

Prices are fully independent between days — there is no trend or mean-reversion modelling. This means arbitrage opportunities are purely luck-driven and timing the market is not possible.

### Anomalies
Each travel has a **20% chance** of an anomaly affecting one available asset:

- **Surge**: Price multiplied by 5–10×. Creates a brief selling opportunity.
- **Crash**: Price multiplied by 0.1–0.2×. Creates a brief buying opportunity.

Anomalies are surfaced in the event log and flagged in the market and sell/buy modals.

---

## Events

### Robbery (6.7% per day)
A random fraction (0–50%) of your **cash on hand** is stolen. Bank savings are not affected. A modal is shown with the loss amount and a reminder to keep cash in the bank.

### Bank Hack (4% per day, only if you have savings)
A random fraction (0–80%) of your **bank savings** is stolen by a remote attacker. Cash is not affected.

### Free Token Drop (15% per day)
A random asset's tokens are gifted to you (quantity varies by tier: 1–4 for Tier 1, up to 8–20 for Tier 4). These have an average purchase price of $0, so any sale is pure profit. A modal is shown before play resumes.

### Positive Health Recovery
Each travel recovers 5 health (capped at 100).

---

## Encounters (FTC Raids)

Base encounter probability is **18%**, modified by the destination community's FTC variance. When an encounter triggers, you must choose:

### Run
- **Success**: Escape unharmed. ~50% probability (implied by game logic).
- **Failure**: Caught. Lose some inventory (random fraction of random assets) and -20 health.

### Stay and Fight
- **Success**: No damage, assets retained.
- **Failure**: -40 to -50 health. No inventory lost.

If health reaches 0, the simulation ends immediately.

---

## Scoring

```
Final Score = Cash + Bank Savings − (Debt × 2)
```

Unsold inventory does **not** count toward the final score directly — you must use the **Finish** button (or reach Day 31) to trigger automatic inventory liquidation at current market prices before score is calculated.

The debt penalty is doubled at game end to punish leaving it unpaid.

### Score Tiers

| Score | Tier |
|-------|------|
| $500,000+ | Legendary |
| $200,000+ | Elite Trader |
| $100,000+ | Seasoned Arbitrageur |
| $50,000+ | Emerging Player |
| $0+ | Break Even |
| Negative | Bankrupt |

---

## High Scores

Scores are stored locally in `localStorage`. On game completion, the score is saved automatically under the name "Anon". The player can optionally edit their name on the game-over screen. The leaderboard displays all runs, sorted by score descending.

---

## Strategy Notes

- Pay debt early. The 8% daily compounding rate accelerates faster than you expect.
- Bank cash aggressively. Robbery steals a fraction of cash only; bank savings earn interest.
- Tier 1 assets have the highest variance — a well-timed sell into a surge can single-handedly win a run.
- Tier 4 assets are safe entry points for building volume early when capital is low.
- Dark Web offers the best prices (most volatile) but the highest FTC risk. Use sparingly.
- Meetups are the safest for uneventful grinding.
- Free token drops have a $0 cost basis — always sell them when prices are favourable.
