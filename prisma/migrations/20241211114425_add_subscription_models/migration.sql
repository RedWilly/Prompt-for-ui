/*
  Warnings:

  - The values [PREMIUM] on the enum `Plan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `endDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `Subscription` table. All the data in the column will be lost.
  - The `status` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `resetDate` on the `UsageCount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UsageCount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED', 'PAST_DUE');

-- AlterEnum
BEGIN;
CREATE TYPE "Plan_new" AS ENUM ('FREE', 'PRO');
ALTER TABLE "Subscription" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "Plan_old";
ALTER TABLE "Subscription" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "endDate",
DROP COLUMN "startDate",
DROP COLUMN "stripeCustomerId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stripeCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "UsageCount" DROP COLUMN "resetDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
