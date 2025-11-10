-- Migration script to populate exercise_muscle_groups from existing category data
-- This maps old category values to new muscle groups

-- Step 1: Map single category exercises to their primary muscle group
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, is_primary)
SELECT DISTINCT
  el.id as exercise_id,
  mg.id as muscle_group_id,
  true as is_primary
FROM exercise_library el
INNER JOIN muscle_groups mg ON mg.name = el.category
WHERE el.category IN ('Chest', 'Back', 'Legs', 'Biceps', 'Triceps', 'Shoulders', 'Core', 'Abs')
  AND NOT EXISTS (
    SELECT 1 FROM exercise_muscle_groups emg 
    WHERE emg.exercise_id = el.id AND emg.muscle_group_id = mg.id
  );

-- Step 2: Handle "Arms" category - add Biceps, Triceps, and Shoulders
-- Mark Biceps as primary for Arms exercises
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, is_primary)
SELECT DISTINCT
  el.id as exercise_id,
  mg.id as muscle_group_id,
  CASE WHEN mg.name = 'Biceps' THEN true ELSE false END as is_primary
FROM exercise_library el
CROSS JOIN muscle_groups mg
WHERE el.category = 'Arms'
  AND mg.name IN ('Biceps', 'Triceps', 'Shoulders')
  AND NOT EXISTS (
    SELECT 1 FROM exercise_muscle_groups emg 
    WHERE emg.exercise_id = el.id AND emg.muscle_group_id = mg.id
  );

-- Step 3: Handle case-insensitive category matching for variations
-- This catches categories like "Chest ", "chest", "CHEST", etc.
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, is_primary)
SELECT DISTINCT
  el.id as exercise_id,
  mg.id as muscle_group_id,
  true as is_primary
FROM exercise_library el
INNER JOIN muscle_groups mg ON LOWER(TRIM(el.category)) = LOWER(mg.name)
WHERE NOT EXISTS (
    SELECT 1 FROM exercise_muscle_groups emg 
    WHERE emg.exercise_id = el.id AND emg.muscle_group_id = mg.id
  )
  AND el.id NOT IN (
    -- Exclude exercises already mapped in previous steps
    SELECT DISTINCT exercise_id FROM exercise_muscle_groups
  );

-- Step 4: Handle compound categories or special cases
-- For example, if you have categories like "Legs - Quads" or "Back - Lats"
-- This will try to match the first word to a muscle group
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, is_primary)
SELECT DISTINCT
  el.id as exercise_id,
  mg.id as muscle_group_id,
  true as is_primary
FROM exercise_library el
INNER JOIN muscle_groups mg ON LOWER(SPLIT_PART(TRIM(el.category), ' ', 1)) = LOWER(mg.name)
WHERE NOT EXISTS (
    SELECT 1 FROM exercise_muscle_groups emg 
    WHERE emg.exercise_id = el.id AND emg.muscle_group_id = mg.id
  )
  AND el.id NOT IN (
    SELECT DISTINCT exercise_id FROM exercise_muscle_groups
  );

-- Step 5: Default fallback for unmapped exercises
-- Assign to "Core" if no match found (you can change this to another default)
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group_id, is_primary)
SELECT DISTINCT
  el.id as exercise_id,
  mg.id as muscle_group_id,
  true as is_primary
FROM exercise_library el
CROSS JOIN muscle_groups mg
WHERE mg.name = 'Core'
  AND NOT EXISTS (
    SELECT 1 FROM exercise_muscle_groups emg 
    WHERE emg.exercise_id = el.id
  );
