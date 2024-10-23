/*
  Warnings:

  - A unique constraint covering the columns `[carrierConfigId,shippingCode,location,postalCode]` on the table `DisabledShippingRate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `location` to the `DisabledShippingRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `DisabledShippingRate` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Drop existing unique constraint
DROP INDEX IF EXISTS "DisabledShippingRate_carrierConfigId_shippingCode_key";

-- Step 2: Add new columns as nullable first
ALTER TABLE "DisabledShippingRate" 
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "postalCode" TEXT,
ADD COLUMN IF NOT EXISTS "countryCode" TEXT;

-- Step 3: Set default values for existing records
UPDATE "DisabledShippingRate" 
SET 
    "location" = '',
    "postalCode" = ''
WHERE "location" IS NULL 
   OR "postalCode" IS NULL;

-- Step 4: Make columns non-nullable after setting defaults
ALTER TABLE "DisabledShippingRate" 
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "postalCode" SET NOT NULL;

-- Step 5: Create new unique constraint
CREATE UNIQUE INDEX "DisabledShippingRate_carrierConfigId_shippingCode_location_postalCode_key" 
ON "DisabledShippingRate"("carrierConfigId", "shippingCode", "location", "postalCode");
