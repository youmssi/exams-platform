-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CatalogRequestKind" AS ENUM ('COUNTRY', 'CENTER', 'LEVEL', 'OTHER');

-- CreateTable
CREATE TABLE "exam_session" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "examDate" DATE NOT NULL,
    "registrationOpensAt" TIMESTAMP(3) NOT NULL,
    "officialUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_confirmation" (
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_confirmation_pkey" PRIMARY KEY ("sessionId","userId")
);

-- CreateTable
CREATE TABLE "request" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "publishAt" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "standardPrice" INTEGER NOT NULL,
    "bonus" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "commission" INTEGER NOT NULL,
    "assistantShare" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_request" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "kind" "CatalogRequestKind" NOT NULL,
    "details" TEXT NOT NULL,
    "officialUrl" TEXT,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_session_offerId_examDate_key" ON "exam_session"("offerId", "examDate");

-- CreateIndex
CREATE INDEX "request_sessionId_status_publishAt_idx" ON "request"("sessionId", "status", "publishAt");

-- CreateIndex
CREATE INDEX "request_ownerId_idx" ON "request"("ownerId");

-- AddForeignKey
ALTER TABLE "exam_session" ADD CONSTRAINT "exam_session_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_session" ADD CONSTRAINT "exam_session_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_confirmation" ADD CONSTRAINT "session_confirmation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "exam_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_confirmation" ADD CONSTRAINT "session_confirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "exam_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_request" ADD CONSTRAINT "catalog_request_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- One open request per beneficiary and session (partial index, not expressible in the Prisma schema).
CREATE UNIQUE INDEX "request_beneficiary_session_open_key" ON "request"("beneficiaryId", "sessionId") WHERE "status" = 'OPEN';
