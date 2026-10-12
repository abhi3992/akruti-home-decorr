-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "CartPresence" (
    "visitorId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartPresence_pkey" PRIMARY KEY ("visitorId","productId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WishlistPresence" (
    "visitorId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WishlistPresence_pkey" PRIMARY KEY ("visitorId","productId")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CartPresence_productId_idx" ON "CartPresence"("productId");
CREATE INDEX IF NOT EXISTS "WishlistPresence_productId_idx" ON "WishlistPresence"("productId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "CartPresence" ADD CONSTRAINT "CartPresence_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "WishlistPresence" ADD CONSTRAINT "WishlistPresence_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
