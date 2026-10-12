ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "sheetFit" TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS "Review" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");

DO $$ BEGIN
  ALTER TABLE "Review"
    ADD CONSTRAINT "Review_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

UPDATE "Product"
SET "sizes" = '["King (108 × 108 in)","Queen (90 × 108 in)"]'
WHERE "category" = 'bedsheet';
