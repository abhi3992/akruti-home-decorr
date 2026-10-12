-- Product categories
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'towel';

-- Default all, then classify by name (order matters: more specific last wins where needed)
UPDATE "Product" SET "category" = 'towel';

UPDATE "Product"
SET "category" = 'bathrobe'
WHERE lower("name") LIKE '%bathrobe%'
   OR lower("name") LIKE '%bath robe%'
   OR (lower("name") LIKE '%robe%' AND lower("name") NOT LIKE '%bedsheet%');

UPDATE "Product"
SET "category" = 'bedsheet'
WHERE lower("name") LIKE '%bedsheet%'
   OR lower("name") LIKE '%bed sheet%'
   OR lower("name") LIKE '%pillow cover%'
   OR lower("name") LIKE '%dohar%'
   OR lower("name") LIKE '%quilt%';

CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");

-- Towel name-print on order lines
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "customName" TEXT NOT NULL DEFAULT '';
