/*
  Warnings:

  - You are about to drop the column `userId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `accessToken` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `accountOwner` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `collaborator` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `Shop` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "userId",
ADD COLUMN     "accountOwner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "collaborator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "locale" TEXT,
ADD COLUMN     "shopId" INTEGER;

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "accessToken",
DROP COLUMN "accountOwner",
DROP COLUMN "collaborator",
DROP COLUMN "email",
DROP COLUMN "emailVerified",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "locale",
DROP COLUMN "scope";

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
