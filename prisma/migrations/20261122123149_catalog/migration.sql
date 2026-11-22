-- AlterTable
ALTER TABLE "session" ADD COLUMN     "secondFactorAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "center" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "officialUrl" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "center_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer" (
    "id" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "modules" TEXT[],
    "standardPrice" INTEGER NOT NULL,
    "commissionRateBp" INTEGER NOT NULL,
    "commissionMin" INTEGER NOT NULL,
    "bonusStep" INTEGER NOT NULL,
    "bonusCap" INTEGER NOT NULL,
    "claimTimeoutMin" INTEGER NOT NULL,
    "confirmOnlineMin" INTEGER NOT NULL,
    "confirmOfflineMin" INTEGER NOT NULL,
    "paymentDeadlineH" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "country_code_key" ON "country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "center_countryId_name_key" ON "center"("countryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "offer_centerId_level_key" ON "offer"("centerId", "level");

-- CreateIndex
CREATE INDEX "audit_log_targetType_targetId_idx" ON "audit_log"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "center" ADD CONSTRAINT "center_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "center"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Initial catalog: Cameroon, Goethe-Institut Yaoundé, B1 and B2.
-- Prices are the admin's starting values and can be changed from the back office.
INSERT INTO "country" ("id", "code", "currency", "timeZone", "active", "updatedAt")
VALUES ('country_cm', 'CM', 'XAF', 'Africa/Douala', true, CURRENT_TIMESTAMP);

INSERT INTO "center" ("id", "countryId", "name", "city", "officialUrl", "active", "updatedAt")
VALUES ('center_goethe_yaounde', 'country_cm', 'Goethe-Institut Kamerun', 'Yaoundé', 'https://www.goethe.de/ins/cm/fr/spr/prf/anm.html', true, CURRENT_TIMESTAMP);

INSERT INTO "offer" ("id", "centerId", "level", "modules", "standardPrice", "commissionRateBp", "commissionMin", "bonusStep", "bonusCap", "claimTimeoutMin", "confirmOnlineMin", "confirmOfflineMin", "paymentDeadlineH", "active", "updatedAt")
VALUES
  ('offer_goethe_yaounde_b1', 'center_goethe_yaounde', 'B1', ARRAY['Lesen', 'Hören', 'Schreiben', 'Sprechen'], 3000, 1000, 300, 500, 3000, 20, 15, 5, 24, true, CURRENT_TIMESTAMP),
  ('offer_goethe_yaounde_b2', 'center_goethe_yaounde', 'B2', ARRAY['Lesen', 'Hören', 'Schreiben', 'Sprechen'], 5000, 1000, 300, 500, 5000, 20, 15, 5, 24, true, CURRENT_TIMESTAMP);
