-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_REMINDER';

-- AlterTable
ALTER TABLE "operation" ADD COLUMN     "paymentReminders" INTEGER NOT NULL DEFAULT 0;

