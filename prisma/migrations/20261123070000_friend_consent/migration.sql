-- AlterTable
ALTER TABLE "beneficiary" ADD COLUMN     "consentConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "consentRequestedAt" TIMESTAMP(3),
ADD COLUMN     "consentTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "beneficiary_consentTokenHash_key" ON "beneficiary"("consentTokenHash");


-- Friends added before this change were attested by the holder; their consent stands.
UPDATE "beneficiary" SET "consentConfirmedAt" = "consentAt" WHERE "isSelf" = false AND "consentAt" IS NOT NULL;
