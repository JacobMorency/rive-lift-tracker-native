-- Enable RLS on muscle_groups table
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read muscle groups (public data)
CREATE POLICY "muscle_groups_select_policy"
ON muscle_groups
FOR SELECT
USING (true);

-- Policy: Only authenticated users can insert muscle groups
-- (You may want to restrict this further to admins only)
CREATE POLICY "muscle_groups_insert_policy"
ON muscle_groups
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Only authenticated users can update muscle groups
CREATE POLICY "muscle_groups_update_policy"
ON muscle_groups
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Only authenticated users can delete muscle groups
CREATE POLICY "muscle_groups_delete_policy"
ON muscle_groups
FOR DELETE
TO authenticated
USING (true);

