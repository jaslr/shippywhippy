/*
  Warnings:

  - A unique constraint covering the columns `[shopifyUrl]` on the table `Shop` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Shop_shopifyUrl_key" ON "Shop"("shopifyUrl");
