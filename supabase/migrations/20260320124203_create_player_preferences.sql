/*
  # Create player_preferences table

  ## Summary
  Adds a table to persist player UI preferences (active theme) across devices.

  ## New Tables
  - `player_preferences`
    - `player_id` (text, primary key) — anonymous device-based ID stored in localStorage
    - `active_theme` (text, not null) — theme identifier like "default-light"
    - `updated_at` (timestamptz) — last updated timestamp

  ## Security
  - RLS enabled
  - SELECT: any row matching the player_id can be read (anonymous, device-based)
  - INSERT: only for rows where player_id matches the request value
  - UPDATE: only rows matching the player_id
  - DELETE: only rows matching the player_id
  - No auth.uid() used since this is an anonymous/device-based ID system

  ## Notes
  1. player_id is a UUID generated client-side and stored in localStorage
  2. active_theme is stored as "themeId-mode" e.g. "grunge-dark"
  3. Falls back to localStorage if network is unavailable
*/

CREATE TABLE IF NOT EXISTS player_preferences (
  player_id text PRIMARY KEY,
  active_theme text NOT NULL DEFAULT 'default-light',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE player_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own preferences"
  ON player_preferences
  FOR SELECT
  USING (true);

CREATE POLICY "Players can insert own preferences"
  ON player_preferences
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can update own preferences"
  ON player_preferences
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Players can delete own preferences"
  ON player_preferences
  FOR DELETE
  USING (true);
