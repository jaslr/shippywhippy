/*
  Warnings:

  - A unique constraint covering the columns `[carrierConfigId,shippingCode,location,postalCode]` on the table `DisabledShippingRate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `location` to the `DisabledShippingRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `DisabledShippingRate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DisabledShippingRate_carrierConfigId_shippingCode_key";

-- AlterTable
ALTER TABLE "DisabledShippingRate" ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DisabledShippingRate_carrierConfigId_shippingCode_location__key" ON "DisabledShippingRate"("carrierConfigId", "shippingCode", "location", "postalCode");
