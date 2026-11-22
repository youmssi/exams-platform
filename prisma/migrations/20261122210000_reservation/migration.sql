-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RequestStatus" ADD VALUE 'BOOKED';
ALTER TYPE "RequestStatus" ADD VALUE 'ELSEWHERE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OperationStatus" ADD VALUE 'INVALID_CREDENTIALS';
ALTER TYPE "OperationStatus" ADD VALUE 'RESERVED';
ALTER TYPE "OperationStatus" ADD VALUE 'CONFIRMED';
ALTER TYPE "OperationStatus" ADD VALUE 'DISPUTED';

-- AlterTable
ALTER TABLE "offer" ADD COLUMN     "centerFeeDays" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "request" ADD COLUMN     "credentialsRejectedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "operation" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "releaseAt" TIMESTAMP(3),
ADD COLUMN     "reservedAt" TIMESTAMP(3);

