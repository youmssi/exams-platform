-- CreateEnum
CREATE TYPE "AssistantVerification" AS ENUM ('NONE', 'PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "assistant_profile" ADD COLUMN     "identityPath" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "verification" "AssistantVerification" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "verifiedAt" TIMESTAMP(3);


-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ASSISTANT_VERIFIED';
ALTER TYPE "NotificationType" ADD VALUE 'ASSISTANT_REJECTED';
