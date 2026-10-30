ALTER TABLE "household_surveys"
ADD COLUMN IF NOT EXISTS "total_members" INTEGER;

ALTER TABLE "household_surveys"
ALTER COLUMN "total_members" DROP DEFAULT,
ALTER COLUMN "total_members" DROP NOT NULL;
