# Database Migrations

This directory contains SQL migration scripts for the Rive Lift Tracker database.

## Migration Files

### 001_muscle_groups_rls.sql
Sets up Row Level Security (RLS) policies for the `muscle_groups` table.
- Public read access
- Authenticated users can insert/update/delete

### 002_exercise_muscle_groups_rls.sql
Sets up RLS policies for the `exercise_muscle_groups` junction table.
- Public read access
- Authenticated users can insert/update/delete

### 003_populate_muscle_groups.sql
Populates the `muscle_groups` table with common muscle groups.
- Includes: Chest, Back, Shoulders, Biceps, Triceps, Legs, Quadriceps, Hamstrings, Glutes, Calves, Core, Abs, Forearms, Traps, Lats, Delts, Cardio
- Uses `ON CONFLICT DO NOTHING` to avoid duplicates

### 004_migrate_exercise_categories.sql
Migrates existing exercise categories to the new muscle group system.
- Maps single category exercises to their primary muscle group
- Handles "Arms" category by adding Biceps (primary), Triceps, and Shoulders
- Includes case-insensitive matching and fallback logic

## Running Migrations

Execute these SQL files in order in your Supabase SQL Editor:

1. Run `001_muscle_groups_rls.sql`
2. Run `002_exercise_muscle_groups_rls.sql`
3. Run `003_populate_muscle_groups.sql`
4. Run `004_migrate_exercise_categories.sql`

## Notes

- The migration scripts use `ON CONFLICT` and `NOT EXISTS` checks to be idempotent (safe to run multiple times)
- After running migrations, you may want to manually review and adjust muscle group assignments for exercises
- Consider adding more specific muscle groups (e.g., "Upper Chest", "Lower Chest") if needed
- The "Arms" category mapping adds all three arm muscle groups - you may want to customize this based on your needs

