-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REQUEST_CLAIMED', 'REQUEST_RETURNED', 'BOOKING_DECLARED', 'PROBLEM_REPORTED', 'BOOKING_CONFIRMED', 'DISPUTE_OPENED', 'PAYMENT_DECLARED', 'PAYMENT_REJECTED', 'OPERATION_CLOSED', 'DISPUTE_DECIDED', 'STRIKE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "emailUpdates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'fr';

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_userId_readAt_idx" ON "notification"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

