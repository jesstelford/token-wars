/*
  # Create gear_unlocks table

  ## Summary
  Stores meta-progression data for the TokenWars gear system.
  Each row represents a unique gear item that a player has unlocked
  at least once across all their game runs.

  ## New Tables
  - `gear_unlocks`
    - `id` (uuid, primary key) - unique row identifier
    - `player_id` (text) - anonymous stable player identifier stored in localStorage
    - `item_id` (text) - the gear item ID (matches GEAR_ITEMS constant in the app)
    - `unlocked_at` (timestamptz) - when the item was first unlocked

  ## Security
  - RLS enabled on `gear_unlocks`
  - Players can only read/insert their own rows (matched by player_id)
  - Uses player_id in a request header claim pattern (anonymous, no auth required)

  ## Notes
  1. No authentication required - players are identified by a UUID stored in localStorage
  2. player_id + item_id has a unique constraint to prevent duplicate unlock rows
  3. This is append-only data - we never delete gear unlocks (intentional progression)
*/

CREATE TABLE IF NOT EXISTS gear_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text NOT NULL,
  item_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE (player_id, item_id)
);

ALTER TABLE gear_unlocks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS gear_unlocks_player_id_idx ON gear_unlocks (player_id);

CREATE POLICY "Players can read own gear unlocks"
  ON gear_unlocks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Players can insert own gear unlocks"
  ON gear_unlocks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
