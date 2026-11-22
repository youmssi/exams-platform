-- CreateTable
CREATE TABLE "beneficiary" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isSelf" BOOLEAN NOT NULL DEFAULT false,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordCipher" TEXT,
    "consentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "beneficiary_ownerId_idx" ON "beneficiary"("ownerId");

-- AddForeignKey
ALTER TABLE "beneficiary" ADD CONSTRAINT "beneficiary_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- At most one "self" beneficiary per account (partial index, not expressible in the Prisma schema).
CREATE UNIQUE INDEX "beneficiary_ownerId_self_key" ON "beneficiary"("ownerId") WHERE "isSelf";
