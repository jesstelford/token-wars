# TokenWars — Design Decisions Log

A running record of design and implementation decisions, in rough chronological order.

---

## Initial Design

### Theme: AI Token Arbitrage
**Decision:** Model the game after classic Drugwars/Dope Wars but set in the AI ecosystem — trading tokens of named AI companies (OpenAI, Anthropic, Gemini, etc.) across online communities instead of drugs across cities.

**Rationale:** Provides an immediately legible theme for a tech-savvy audience. The drug-trade mechanics (buy low, sell high, debt pressure, random events) translate cleanly. Named AI companies give the asset tier system personality.

---

### Asset Tier System
**Decision:** Four tiers of assets by base price ($50 → $15,000) and volatility (12% → 35%).

**Rationale:** Gives players a meaningful progression arc. Early game is dominated by cheap Tier 4 assets where small capital can buy many units. As cash grows, Tier 1 assets become accessible and offer dramatically higher absolute swings. Higher volatility at higher price points means larger nominal gains but larger nominal losses.

---

### Communities as Risk Zones
**Decision:** Six communities with FTC encounter probability modifiers ranging from -5% (Meetups) to +8% (Dark Web).

**Rationale:** Creates a risk/reward trade-off across locations. Dark Web implies higher danger but no explicit price bonus — the tension is purely in encounter risk. This keeps the market pricing system clean (prices are asset-driven, not location-driven) while still making location choice meaningful.

---

### Debt as Core Pressure Mechanic
**Decision:** Player starts with $5,500 in both cash and debt. Debt compounds at 8% per day.

**Rationale:** The initial debt-equals-cash balance means you start with nothing and need to grow your way out. The 8% daily compound rate (not annual) creates severe pressure. A player who ignores debt for 31 days will face a debt roughly 10× the original amount.

---

### Score Formula: Penalise Unpaid Debt Twice
**Decision:** `Score = Cash + Bank Savings − (Debt × 2)`

**Rationale:** A simple "cash minus debt" formula would let players end with $0 debt and call it a draw. The 2× multiplier means carrying debt to the end is actively punishing — you need surplus cash to cover it and then some. Inventory is not included in the score formula directly, forcing players to liquidate via the Finish button or natural day expiry.

---

### Bank as Safe Harbour
**Decision:** Bank earns 3% daily interest; robbery affects cash only; bank hacks are separate, rarer events.

**Rationale:** Creates a genuine strategic split. Keeping all cash uninvested is dangerous (robbery). Parking everything in the bank protects against robbery but earns interest instead of trading profit. Players must actively manage cash vs. bank vs. inventory allocation.

---

## UI / UX Decisions

### Buy Modal: Remove "Max Possible" Stat
**Decision:** Removed the "Max possible" affordability row from the Buy modal info grid.

**Rationale:** The MAX button already fills the quantity to the maximum affordable/available. The stat row was redundant and added visual noise. The quantity controls (stepper + MAX button) are sufficient.

### Buy Modal: Bank Withdrawal Hint
**Decision:** When a player has bank savings that would allow them to afford additional units beyond their current cash, show a contextual hint with the exact number of extra units they could unlock by withdrawing.

**Rationale:** New players often don't realise their bank balance is actionable. The hint is shown inline only when relevant and quantified precisely, so it's informative without being nagging.

### Sell Modal: Profit / Loss Display
**Decision:** Show "Avg buy price" and a "Profit" or "Loss" row in the Sell modal, calculated against the average purchase price across all buys of that asset.

**Rationale:** The inventory system already tracks `avgPurchasePrice`. Surfacing it at sell time gives players immediate feedback on the quality of their trade without requiring them to mentally calculate it. Uses green/red colouring and trend icons to make the signal instant.

### Robbery Modal: Bank Safety Hint
**Decision:** Added a small tip at the bottom of the "You were robbed" modal: "Cash on hand is always at risk. Keep your savings in the bank — robbers can't touch it."

**Rationale:** The robbery event is the most natural teachable moment for the bank mechanic. Players who have just been robbed are primed to act on the advice. The hint is subtle (small text, neutral background) and only appears on robbery events, not bank hacks.

---

## Balance Decisions

### Reduce Robbery and Bank Hack Frequency by ~1/3
**Decision:** Robbery probability reduced from 10% → 6.7% per day. Bank hack probability reduced from 6% → 4% per day.

**Rationale:** At 10%/6%, the negative events were firing too frequently, making runs feel punishing regardless of strategy. The reduction keeps the events meaningful and impactful when they occur without making every run feel like a death march. At 6.7%, a player can expect roughly 2 robberies per full 31-day run (down from ~3). Bank hacks now average roughly 1 per run.

---

## High Score Flow

### Auto-Submit Score on Game Completion
**Decision:** The score is saved automatically (as "Anon") the moment the game-over screen mounts. No "Submit" button is required.

**Rationale:** Requiring a submit step created friction and meant players who closed the screen without submitting lost their score. Auto-saving respects the player's time and ensures every completed run is recorded.

### Name is Optional, Editable After Auto-Submit
**Decision:** The game-over screen shows "Saved as Anon" with an "Edit name" link. Clicking it opens an inline input. Confirming the name updates the existing leaderboard entry rather than adding a duplicate.

**Rationale:** Most leaderboard implementations force name entry before proceeding. Making the name optional and editable after the fact removes a barrier while still allowing personalisation. The update-in-place logic (matching by score + date + days_survived) prevents duplicate entries.

### Display "Anon" for Blank Names
**Decision:** Both the title screen top-5 leaderboard and the full high scores modal display "Anon" wherever a name is empty or not set.

**Rationale:** Blank name entries look like a bug. "Anon" is a convention familiar to users from online spaces and fits the game's internet-culture theme.
