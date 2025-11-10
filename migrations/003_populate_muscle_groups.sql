-- Populate muscle_groups table with common muscle groups
-- This uses INSERT ... ON CONFLICT to avoid duplicates if run multiple times

INSERT INTO muscle_groups (name) VALUES
  ('Chest'),
  ('Back'),
  ('Shoulders'),
  ('Biceps'),
  ('Triceps'),
  ('Legs'),
  ('Quadriceps'),
  ('Hamstrings'),
  ('Glutes'),
  ('Calves'),
  ('Core'),
  ('Abs'),
  ('Forearms'),
  ('Traps'),
  ('Lats'),
  ('Delts'),
  ('Cardio')
ON CONFLICT (name) DO NOTHING;

