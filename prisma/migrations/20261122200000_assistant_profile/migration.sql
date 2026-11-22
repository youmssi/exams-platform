-- AlterTable
ALTER TABLE "country" ADD COLUMN     "mobileMoneyOperators" TEXT[];

-- CreateTable
CREATE TABLE "assistant_profile" (
    "userId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "momoNumber" TEXT NOT NULL,
    "momoName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assistant_profile_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "assistant_profile" ADD CONSTRAINT "assistant_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assistant_profile" ADD CONSTRAINT "assistant_profile_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Cameroon: the two Mobile Money operators assistants use.
UPDATE "country" SET "mobileMoneyOperators" = ARRAY['MTN Mobile Money', 'Orange Money'] WHERE "code" = 'CM';
