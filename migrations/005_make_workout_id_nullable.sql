-- Migration: Make workout_id nullable and add name column to workout_sessions
-- This enables sessions to exist without requiring a workout template

-- Step 1: Add name column to workout_sessions (nullable for now, will be populated)
ALTER TABLE workout_sessions
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Step 2: Populate name column from workouts table for existing sessions
UPDATE workout_sessions ws
SET name = w.name
FROM workouts w
WHERE ws.workout_id = w.id
  AND ws.name IS NULL;

-- Step 3: Set default name for sessions without workout_id (use formatted date)
-- This handles any edge cases where workout_id exists but workout doesn't
UPDATE workout_sessions
SET name = TO_CHAR(started_at, 'Mon DD, YYYY')
WHERE name IS NULL;

-- Step 4: Make workout_id nullable
ALTER TABLE workout_sessions
ALTER COLUMN workout_id DROP NOT NULL;

-- Step 5: Add constraint to ensure name is not null going forward
-- First, ensure all existing rows have a name
UPDATE workout_sessions
SET name = COALESCE(name, TO_CHAR(started_at, 'Mon DD, YYYY'))
WHERE name IS NULL;

-- Now add NOT NULL constraint
ALTER TABLE workout_sessions
ALTER COLUMN name SET NOT NULL;

-- Step 6: Create index on name for faster queries
CREATE INDEX IF NOT EXISTS idx_workout_sessions_name ON workout_sessions(name);

-- Note: RLS policies should already work since they're based on user_id, not workout_id