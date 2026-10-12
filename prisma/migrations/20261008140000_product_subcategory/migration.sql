ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "subcategory" TEXT NOT NULL DEFAULT '';

-- Bedsheets were using kids sizes (2-3Y …). Switch those to bed sizes.
UPDATE "Product"
SET "sizes" = '["Single","Double","Queen","King"]'
WHERE "category" = 'bedsheet'
  AND (
    "sizes" LIKE '%2-3Y%'
    OR "sizes" LIKE '%4-5Y%'
    OR "sizes" LIKE '%6-7Y%'
    OR "sizes" LIKE '%8-9Y%'
  );
