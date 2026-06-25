ALTER TABLE review
    ADD COLUMN IF NOT EXISTS effectiveness_rating INTEGER;

ALTER TABLE review
    ADD COLUMN IF NOT EXISTS safety_rating INTEGER;

ALTER TABLE review
    ADD COLUMN IF NOT EXISTS ergonomics_rating INTEGER;

ALTER TABLE review
    ADD COLUMN IF NOT EXISTS durability_rating INTEGER;

ALTER TABLE review
    ADD COLUMN IF NOT EXISTS media_urls JSON;

ALTER TABLE review
    ADD COLUMN IF NOT EXISTS admin_reply TEXT;

ALTER TABLE review
    ADD COLUMN IF NOT EXISTS admin_reply_created_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE review
    ADD COLUMN IF NOT EXISTS admin_reply_edited_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE review
    ADD COLUMN IF NOT EXISTS admin_reply_edit_count INTEGER DEFAULT 0;

UPDATE review
SET admin_reply_created_at = COALESCE(admin_reply_created_at, created_at)
WHERE admin_reply IS NOT NULL
  AND admin_reply_created_at IS NULL;

UPDATE review
SET admin_reply_edit_count = COALESCE(admin_reply_edit_count, 0)
WHERE admin_reply_edit_count IS NULL;

UPDATE review
SET effectiveness_rating = COALESCE(effectiveness_rating, rating, 5),
    safety_rating = COALESCE(safety_rating, rating, 5),
    ergonomics_rating = COALESCE(ergonomics_rating, rating, 5),
    durability_rating = COALESCE(durability_rating, rating, 5)
WHERE effectiveness_rating IS NULL
   OR safety_rating IS NULL
   OR ergonomics_rating IS NULL
   OR durability_rating IS NULL;

ALTER TABLE review
    ALTER COLUMN effectiveness_rating SET DEFAULT 5;

ALTER TABLE review
    ALTER COLUMN safety_rating SET DEFAULT 5;

ALTER TABLE review
    ALTER COLUMN ergonomics_rating SET DEFAULT 5;

ALTER TABLE review
    ALTER COLUMN durability_rating SET DEFAULT 5;

ALTER TABLE review
    ALTER COLUMN effectiveness_rating SET NOT NULL;

ALTER TABLE review
    ALTER COLUMN safety_rating SET NOT NULL;

ALTER TABLE review
    ALTER COLUMN ergonomics_rating SET NOT NULL;

ALTER TABLE review
    ALTER COLUMN durability_rating SET NOT NULL;

ALTER TABLE review
    ALTER COLUMN admin_reply_edit_count SET DEFAULT 0;

ALTER TABLE review
    ALTER COLUMN admin_reply_edit_count SET NOT NULL;