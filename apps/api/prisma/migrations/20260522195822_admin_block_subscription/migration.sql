-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "blockedReason" TEXT,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionEndAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStartAt" TIMESTAMP(3);
