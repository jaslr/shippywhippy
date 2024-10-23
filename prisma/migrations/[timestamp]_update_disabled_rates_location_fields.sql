-- Step 1: Add new columns as nullable
ALTER TABLE "DisabledShippingRate" 
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "postalCode" TEXT,
ADD COLUMN IF NOT EXISTS "countryCode" TEXT;

-- Step 2: Update existing records with default values
UPDATE "DisabledShippingRate" dr
SET 
    "location" = COALESCE(
        (
            SELECT l.name 
            FROM "CarrierConfig" cc
            JOIN "Shop" s ON s.id = cc.id
            JOIN "Location" l ON l.id = s.id
            WHERE cc.id = dr."carrierConfigId"
            LIMIT 1
        ),
        'Default Location'
    ),
    "postalCode" = COALESCE(
        (
            SELECT l.zip
            FROM "CarrierConfig" cc
            JOIN "Shop" s ON s.id = cc.id
            JOIN "Location" l ON l.id = s.id
            WHERE cc.id = dr."carrierConfigId"
            LIMIT 1
        ),
        '0000'
    )
WHERE dr."location" IS NULL OR dr."postalCode" IS NULL;

-- Step 3: Make columns required after setting defaults
ALTER TABLE "DisabledShippingRate" 
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "postalCode" SET NOT NULL;

-- Step 4: Add the new unique constraint
DROP INDEX IF EXISTS "DisabledShippingRate_carrierConfigId_shippingCode_key";
CREATE UNIQUE INDEX "DisabledShippingRate_carrierConfigId_shippingCode_location_postal_key" 
ON "DisabledShippingRate"("carrierConfigId", "shippingCode", "location", "postalCode");
