-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('CLAIMED', 'RELEASED', 'WITHDRAWN', 'EXPIRED');

-- CreateTable
CREATE TABLE "operation" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'CLAIMED',
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadlineAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "operation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "operation_requestId_idx" ON "operation"("requestId");

-- CreateIndex
CREATE INDEX "operation_assistantId_status_idx" ON "operation"("assistantId", "status");

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operation" ADD CONSTRAINT "operation_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- One active operation per assistant, and per request.
CREATE UNIQUE INDEX "operation_active_assistant_key" ON "operation"("assistantId") WHERE "status" = 'CLAIMED';
CREATE UNIQUE INDEX "operation_active_request_key" ON "operation"("requestId") WHERE "status" = 'CLAIMED';
