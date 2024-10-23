-- AlterTable
ALTER TABLE "CarrierConfig" ADD COLUMN     "hasDisabledRates" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DisabledShippingRate" (
    "id" SERIAL NOT NULL,
    "carrierConfigId" INTEGER NOT NULL,
    "shippingCode" TEXT NOT NULL,
    "shippingName" TEXT NOT NULL,
    "isInternational" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DisabledShippingRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DisabledShippingRate_carrierConfigId_shippingCode_key" ON "DisabledShippingRate"("carrierConfigId", "shippingCode");

-- AddForeignKey
ALTER TABLE "DisabledShippingRate" ADD CONSTRAINT "DisabledShippingRate_carrierConfigId_fkey" FOREIGN KEY ("carrierConfigId") REFERENCES "CarrierConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
