-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('PROOF_REQUESTED', 'REVIEW', 'DECIDED');

-- CreateEnum
CREATE TYPE "DisputeOutcome" AS ENUM ('BOOKED', 'NOT_BOOKED');

-- CreateEnum
CREATE TYPE "StrikeReason" AS ENUM ('CLAIM_TIMEOUT', 'ABUSIVE_DISPUTE', 'AT_FAULT');

-- CreateEnum
CREATE TYPE "ReportTarget" AS ENUM ('SESSION', 'OPERATION');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('WRONG_SESSION', 'ABUSE', 'FRAUD', 'OTHER');

-- AlterEnum
ALTER TYPE "OperationStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "suspendedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "dispute" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'PROOF_REQUESTED',
    "proofDueAt" TIMESTAMP(3) NOT NULL,
    "proofPath" TEXT,
    "proofAt" TIMESTAMP(3),
    "outcome" "DisputeOutcome",
    "decisionNote" TEXT,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" "StrikeReason" NOT NULL,
    "operationId" TEXT,
    "liftedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "ReportTarget" NOT NULL,
    "targetId" TEXT NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "message" TEXT,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dispute_operationId_key" ON "dispute"("operationId");

-- CreateIndex
CREATE INDEX "dispute_status_idx" ON "dispute"("status");

-- CreateIndex
CREATE INDEX "strike_userId_idx" ON "strike"("userId");

-- CreateIndex
CREATE INDEX "report_handledAt_idx" ON "report"("handledAt");

-- AddForeignKey
ALTER TABLE "dispute" ADD CONSTRAINT "dispute_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strike" ADD CONSTRAINT "strike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Bookings disputed before this migration wait for a proof, with a full deadline from now.
INSERT INTO "dispute" ("id", "operationId", "proofDueAt")
SELECT gen_random_uuid()::text, o.id, now() + interval '12 hours'
FROM "operation" o
WHERE o.status = 'DISPUTED';
