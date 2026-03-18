-- Add asset categories for post-upload classification

ALTER TABLE media_assets
ADD COLUMN IF NOT EXISTS category_slug TEXT;

UPDATE media_assets
SET category_slug = 'uncategorized'
WHERE category_slug IS NULL OR btrim(category_slug) = '';

ALTER TABLE media_assets
ALTER COLUMN category_slug SET DEFAULT 'uncategorized';

ALTER TABLE media_assets
ALTER COLUMN category_slug SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_media_assets_category_slug
  ON media_assets(category_slug);

CREATE INDEX IF NOT EXISTS idx_media_assets_type_category_created_at
  ON media_assets(type, category_slug, created_at DESC);
