-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'UNBOOKED';

-- AlterTable
ALTER TABLE "request" ADD COLUMN     "carriedFromId" TEXT,
ADD COLUMN     "carryOver" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "request_carriedFromId_key" ON "request"("carriedFromId");

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_carriedFromId_fkey" FOREIGN KEY ("carriedFromId") REFERENCES "request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

