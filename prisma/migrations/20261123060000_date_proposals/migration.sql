-- AlterTable
ALTER TABLE "center" ADD COLUMN     "autoDates" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "datesCheckedAt" TIMESTAMP(3),
ADD COLUMN     "datesError" TEXT,
ADD COLUMN     "datesUrl" TEXT;

-- CreateTable
CREATE TABLE "date_proposal" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "examDate" DATE NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "date_proposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "date_proposal_offerId_examDate_key" ON "date_proposal"("offerId", "examDate");

-- AddForeignKey
ALTER TABLE "date_proposal" ADD CONSTRAINT "date_proposal_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

