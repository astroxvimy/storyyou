DROP POLICY "Users can view pages of their own stories" ON story_pages;

ALTER TABLE stories ADD COLUMN is_public BOOLEAN DEFAULT FALSE;

CREATE POLICY "Users can view pages of their own stories"
ON story_pages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM stories
    WHERE stories.id = story_pages.story_id
      AND stories.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view public stories"
ON stories
FOR SELECT
USING (is_public = true);

CREATE POLICY "Anyone can view pages of public stories"
ON story_pages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM stories
    WHERE stories.id = story_pages.story_id
      AND stories.is_public = true
  )
);
