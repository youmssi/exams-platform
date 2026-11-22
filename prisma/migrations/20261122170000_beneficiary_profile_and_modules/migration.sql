-- Beneficiary: official first and last names plus the details exam centres ask for.
ALTER TABLE "beneficiary"
ADD COLUMN     "birthDate" DATE,
ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "participantNumber" TEXT,
ADD COLUMN     "phone" TEXT;

-- Keep existing names: the full name moves to the last name, to be split by its owner.
UPDATE "beneficiary" SET "lastName" = "fullName";

ALTER TABLE "beneficiary" DROP COLUMN "fullName";

-- Request: booked modules. Existing requests are for the full exam.
ALTER TABLE "request" ADD COLUMN     "modules" TEXT[];

UPDATE "request" r SET "modules" = o."modules"
FROM "exam_session" s JOIN "offer" o ON o."id" = s."offerId"
WHERE s."id" = r."sessionId";
