-- Enable RLS on exercise_muscle_groups table
ALTER TABLE exercise_muscle_groups ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read exercise muscle group relationships (public data)
CREATE POLICY "exercise_muscle_groups_select_policy"
ON exercise_muscle_groups
FOR SELECT
USING (true);

-- Policy: Only authenticated users can insert exercise muscle group relationships
CREATE POLICY "exercise_muscle_groups_insert_policy"
ON exercise_muscle_groups
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Only authenticated users can update exercise muscle group relationships
CREATE POLICY "exercise_muscle_groups_update_policy"
ON exercise_muscle_groups
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Only authenticated users can delete exercise muscle group relationships
CREATE POLICY "exercise_muscle_groups_delete_policy"
ON exercise_muscle_groups
FOR DELETE
TO authenticated
USING (true);

