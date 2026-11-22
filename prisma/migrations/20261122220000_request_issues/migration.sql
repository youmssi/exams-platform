-- An assistant reports a problem with a reason instead of only "credentials refused".
CREATE TYPE "RequestIssue" AS ENUM ('CREDENTIALS', 'WRONG_DETAILS', 'ACCOUNT_BLOCKED', 'OTHER');

ALTER TABLE "request"
ADD COLUMN "issue" "RequestIssue",
ADD COLUMN "issueNote" TEXT,
ADD COLUMN "issueAt" TIMESTAMP(3);

UPDATE "request" SET "issue" = 'CREDENTIALS', "issueAt" = "credentialsRejectedAt"
WHERE "credentialsRejectedAt" IS NOT NULL;

ALTER TABLE "request" DROP COLUMN "credentialsRejectedAt";

ALTER TYPE "OperationStatus" RENAME VALUE 'INVALID_CREDENTIALS' TO 'REPORTED';
