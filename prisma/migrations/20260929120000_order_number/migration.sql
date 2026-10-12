-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");

-- Seed sequence so next new order is AHD-2026-001555
INSERT INTO "SiteSetting" ("key", "value", "updatedAt")
VALUES ('orderSeq:2026', '1554', NOW())
ON CONFLICT ("key") DO NOTHING;
