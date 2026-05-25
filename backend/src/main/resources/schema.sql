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