ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "image" TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS "ProductEvent" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProductEvent_kind_createdAt_idx" ON "ProductEvent"("kind", "createdAt");
CREATE INDEX IF NOT EXISTS "ProductEvent_productId_createdAt_idx" ON "ProductEvent"("productId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "ProductEvent" ADD CONSTRAINT "ProductEvent_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
