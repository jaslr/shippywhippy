/*
  Warnings:

  - Added the required column `defaultApiKey` to the `Carrier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Carrier" ADD COLUMN     "defaultApiKey" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CarrierService" (
    "id" TEXT NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "callbackUrl" TEXT NOT NULL,
    "serviceDiscovery" BOOLEAN NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarrierService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarrierService_shopifyId_key" ON "CarrierService"("shopifyId");
