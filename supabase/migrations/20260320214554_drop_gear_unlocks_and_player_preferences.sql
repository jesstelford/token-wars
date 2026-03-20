/*
  # Drop gear_unlocks and player_preferences tables

  These tables are no longer used. All data persistence has been moved to
  browser localStorage. Dropping both tables to clean up the database.

  1. Tables dropped
    - gear_unlocks
    - player_preferences
*/

DROP TABLE IF EXISTS gear_unlocks;
DROP TABLE IF EXISTS player_preferences;
