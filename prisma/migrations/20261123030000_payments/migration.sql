-- CreateEnum
CREATE TYPE "PaymentRecipient" AS ENUM ('ASSISTANT', 'PLATFORM');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('DUE', 'DECLARED', 'RECEIVED');

-- AlterEnum


ALTER TYPE "OperationStatus" ADD VALUE 'CLOSED';
ALTER TYPE "OperationStatus" ADD VALUE 'UNPAID';

-- AlterTable
ALTER TABLE "country" ADD COLUMN     "platformMomoName" TEXT,
ADD COLUMN     "platformMomoNumber" TEXT,
ADD COLUMN     "platformOperator" TEXT;

-- AlterTable
ALTER TABLE "operation" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "paymentDueAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "payment_declaration" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "recipient" "PaymentRecipient" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'DUE',
    "declaredAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "rejections" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_declaration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_declaration_recipient_status_idx" ON "payment_declaration"("recipient", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_declaration_operationId_recipient_key" ON "payment_declaration"("operationId", "recipient");

-- AddForeignKey
ALTER TABLE "payment_declaration" ADD CONSTRAINT "payment_declaration_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Bookings confirmed before this migration owe their two deposits too, with a full deadline from now.
UPDATE "operation" o
SET "paymentDueAt" = now() + make_interval(hours => f."paymentDeadlineH")
FROM "request" r
JOIN "exam_session" s ON s.id = r."sessionId"
JOIN "offer" f ON f.id = s."offerId"
WHERE o."requestId" = r.id AND o.status = 'CONFIRMED';

INSERT INTO "payment_declaration" ("id", "operationId", "recipient", "amount", "currency", "updatedAt")
SELECT gen_random_uuid()::text, o.id, p.recipient::"PaymentRecipient",
       CASE WHEN p.recipient = 'ASSISTANT' THEN r."assistantShare" ELSE r.commission END,
       r.currency, now()
FROM "operation" o
JOIN "request" r ON r.id = o."requestId"
CROSS JOIN (VALUES ('ASSISTANT'), ('PLATFORM')) AS p(recipient)
WHERE o.status = 'CONFIRMED';
