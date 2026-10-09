-- ============================================================
-- JanSetu Clean Schema Migration
-- Run this in psql: psql $DATABASE_URL -f apply_clean_schema.sql
-- ============================================================

BEGIN;

-- 0. Drop dependent materialized view first
DROP MATERIALIZED VIEW IF EXISTS mv_district_cluster_analytics CASCADE;

-- ============================================================
-- 1. CREATE NEW HIERARCHY TABLES (Block → GramPanchayat → Village)
-- ============================================================

CREATE TABLE IF NOT EXISTS "blocks" (
    "id"            SERIAL PRIMARY KEY,
    "name_hindi"    TEXT NOT NULL,
    "name_english"  TEXT NOT NULL,
    CONSTRAINT "uq_block_hindi" UNIQUE ("name_hindi")
);

CREATE TABLE IF NOT EXISTS "gram_panchayats" (
    "id"            SERIAL PRIMARY KEY,
    "name_hindi"    TEXT NOT NULL,
    "name_english"  TEXT NOT NULL,
    "block_id"      INTEGER NOT NULL REFERENCES "blocks"("id") ON DELETE RESTRICT,
    CONSTRAINT "uq_gp_per_block" UNIQUE ("block_id", "name_hindi")
);

CREATE TABLE IF NOT EXISTS "villages" (
    "id"                  SERIAL PRIMARY KEY,
    "name_hindi"          TEXT NOT NULL,
    "name_english"        TEXT NOT NULL,
    "affected_status"     TEXT NOT NULL DEFAULT 'Direct Affected',
    "population"          INTEGER NOT NULL DEFAULT 0,
    "gram_panchayat_id"   INTEGER NOT NULL REFERENCES "gram_panchayats"("id") ON DELETE RESTRICT,
    CONSTRAINT "uq_village_per_gp" UNIQUE ("gram_panchayat_id", "name_hindi")
);

-- ============================================================
-- 2. CREATE VILLAGE_SURVEYS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS "village_surveys" (
    "id"                            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "village_id"                    INTEGER NOT NULL UNIQUE REFERENCES "villages"("id") ON DELETE RESTRICT,

    -- General Information
    "total_households"              INTEGER,
    "total_population"              INTEGER,
    "sc_population"                 INTEGER,
    "st_population"                 INTEGER,
    "total_schools"                 INTEGER,
    "total_anganwadi"               INTEGER,
    "total_health_facilities"       INTEGER,
    "total_hostels"                 INTEGER,
    "fair_price_shop"               TEXT,
    "shop_distance"                 TEXT,
    "mobile_network"                TEXT,
    "network_distance"              TEXT,
    "electricity"                   TEXT,
    "solar_light"                   TEXT,
    "road"                          TEXT,
    "road_connectivity"             INTEGER,
    "road_reasons"                  JSONB NOT NULL DEFAULT '[]',
    "rain_cutoff"                   TEXT,
    "tap_water"                     TEXT,
    "tap_water_excluded_families"   INTEGER,
    "ponds"                         INTEGER,
    "pucca_houses"                  INTEGER,
    "raw_houses"                    INTEGER,
    "completed_houses"              INTEGER,
    "pending_houses"                INTEGER,
    "housing_not_sanctioned"        INTEGER,
    "total_agricultural_land"       TEXT,
    "irrigated_land"                TEXT,
    "odf"                           TEXT,
    "banking"                       TEXT,
    "vet"                           TEXT,

    -- Water Section
    "water_source_type"             TEXT,
    "water_availability_months"     INTEGER,
    "water_quality_issue"           TEXT,
    "fluoride_issue"                TEXT,
    "handpumps_total"               INTEGER,
    "handpumps_working"             INTEGER,
    "pipeline_water_scheme"         TEXT,

    -- Employment Section
    "mnrega_workdays"               INTEGER,
    "mnrega_demand_pending"         INTEGER,
    "mining_workers_count"          INTEGER,
    "migration_count"               INTEGER,
    "migration_destination"         TEXT,

    -- Health Section
    "sub_health_center_available"   TEXT,
    "health_worker_visit"           TEXT,
    "malaria_last_year"             INTEGER,
    "tb_cases_count"                INTEGER,
    "sickle_cell"                   TEXT,

    -- School Section
    "primary_school_available"      TEXT,
    "school_teachers_count"         INTEGER,
    "mid_day_meal"                  TEXT,
    "dropout_reason"                TEXT,

    -- Anganwadi Section
    "anganwadi_worker_present"      TEXT,
    "nutrition_program_coverage"    TEXT,
    "anganwadi_building"            TEXT,

    -- Hostel Section
    "ashram_school_available"       TEXT,
    "hostel_capacity"               INTEGER,
    "hostel_occupancy"              INTEGER,

    -- Women / SHG Section
    "shg_count"                     INTEGER,
    "shg_active_members_count"      INTEGER,
    "mahtari_vandana_count"         INTEGER,

    -- Pension Section
    "old_age_pension_count"         INTEGER,
    "widow_pension_count"           INTEGER,
    "disability_pension_count"      INTEGER,

    -- Cleanliness / ODF Section
    "open_defecation_free"          TEXT,
    "solid_waste_management"        TEXT,
    "drainage_system"               TEXT,

    -- Development Section
    "electric_line_km"              TEXT,
    "internet_available"            TEXT,
    "gram_sabha_last_held"          TEXT,

    -- Metadata
    "is_verified"                   BOOLEAN NOT NULL DEFAULT false,
    "verified_at"                   TIMESTAMP(3),
    "created_by"                    TEXT REFERENCES "users"("id") ON DELETE SET NULL,
    "version"                       INTEGER NOT NULL DEFAULT 1,
    "created_at"                    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"                    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. ADD NEW COLUMNS TO household_surveys
-- ============================================================

-- 3a. Add village_id (nullable first, then backfill, then make NOT NULL)
ALTER TABLE "household_surveys"
    ADD COLUMN IF NOT EXISTS "village_id"                    INTEGER,
    ADD COLUMN IF NOT EXISTS "survey_date"                   TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS "surveyor_name"                 TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS "women_count"                   INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "ration_card"                   TEXT,
    ADD COLUMN IF NOT EXISTS "no_aadhaar_members"            INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "aadhaar_ekyc"                  TEXT,
    ADD COLUMN IF NOT EXISTS "no_caste_cert_members"         INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "no_ayushman_members"           INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "no_voter_id_members"           INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "mnrega_job_card"               TEXT,
    ADD COLUMN IF NOT EXISTS "no_shramik_card_members"       INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "jan_dhan_account"              TEXT,
    ADD COLUMN IF NOT EXISTS "bank_name"                     TEXT,
    ADD COLUMN IF NOT EXISTS "kcc"                           TEXT,
    ADD COLUMN IF NOT EXISTS "forest_rights_patta"           TEXT,
    ADD COLUMN IF NOT EXISTS "marriage_certificate"          TEXT,
    ADD COLUMN IF NOT EXISTS "jsy"                           TEXT,
    ADD COLUMN IF NOT EXISTS "pmmvy"                         TEXT,
    ADD COLUMN IF NOT EXISTS "mahtari_vandana"               TEXT,
    ADD COLUMN IF NOT EXISTS "widow_pension"                 TEXT,
    ADD COLUMN IF NOT EXISTS "disability_pension"            TEXT,
    ADD COLUMN IF NOT EXISTS "needs_assistive_device"        TEXT,
    ADD COLUMN IF NOT EXISTS "assistance_types"              JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS "other_assistance"              TEXT,
    ADD COLUMN IF NOT EXISTS "death_in_last_year"            TEXT,
    ADD COLUMN IF NOT EXISTS "death_certificate_received"    TEXT,
    ADD COLUMN IF NOT EXISTS "pm_garib_kalyan_ration"        TEXT,
    ADD COLUMN IF NOT EXISTS "children_without_birth_cert"   INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "vaccination_status"            TEXT,
    ADD COLUMN IF NOT EXISTS "anganwadi_meal"                TEXT,
    ADD COLUMN IF NOT EXISTS "children_school_status"        TEXT,
    ADD COLUMN IF NOT EXISTS "school_not_going_reason"       JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS "other_school_reason"           TEXT,
    ADD COLUMN IF NOT EXISTS "unemployed_members"            INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "pm_kisan"                      TEXT,
    ADD COLUMN IF NOT EXISTS "mining_employment"             TEXT,
    ADD COLUMN IF NOT EXISTS "annual_income"                 INTEGER,
    ADD COLUMN IF NOT EXISTS "main_income_source"            TEXT,
    ADD COLUMN IF NOT EXISTS "livestock_source"              TEXT,
    ADD COLUMN IF NOT EXISTS "other_livestock_source"        TEXT,
    ADD COLUMN IF NOT EXISTS "animal_employment"             TEXT,
    ADD COLUMN IF NOT EXISTS "housing_scheme_benefit"        TEXT,
    ADD COLUMN IF NOT EXISTS "toilet_status"                 TEXT,
    ADD COLUMN IF NOT EXISTS "tap_water_connection"          TEXT,
    ADD COLUMN IF NOT EXISTS "drinking_water_source"         TEXT,
    ADD COLUMN IF NOT EXISTS "electricity_connection"        TEXT,
    ADD COLUMN IF NOT EXISTS "solar_energy"                  TEXT,
    ADD COLUMN IF NOT EXISTS "family_disease"                TEXT,
    ADD COLUMN IF NOT EXISTS "free_medicines"                TEXT,
    ADD COLUMN IF NOT EXISTS "shg_member"                    TEXT,
    ADD COLUMN IF NOT EXISTS "priority_need_1"               TEXT,
    ADD COLUMN IF NOT EXISTS "priority_need_2"               TEXT,
    ADD COLUMN IF NOT EXISTS "priority_need_3"               TEXT,
    ADD COLUMN IF NOT EXISTS "eligible_scheme_not_received"  TEXT,
    ADD COLUMN IF NOT EXISTS "scheme_benefit_name"           TEXT;

-- 3b. Change existing column defaults/types to match new schema
ALTER TABLE "household_surveys"
    ALTER COLUMN "head_name"    SET DEFAULT '',
    ALTER COLUMN "mobile"       SET DEFAULT '',
    ALTER COLUMN "caste"        SET DEFAULT '',
    ALTER COLUMN "is_bpl"       SET DEFAULT '';

-- 3c. Rename old columns to match new schema (keep backward compat via surveyAnswers JSON)
--     is_bpl stays as-is (already lowercase in Prisma)
--     is_mining_worker → we'll keep the old column as well for now

-- ============================================================
-- 4. BACKFILL village_id FROM villages TABLE
--    Match by village name (hindi) stored in household_surveys.village_name
-- ============================================================

-- First seed the hierarchy tables from narayanpur_hierarchy if it still exists
-- (it was dropped by the previous partial migration run)
-- If it doesn't exist, we skip the backfill and do it via seed script later.

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'narayanpur_hierarchy') THEN
    -- Seed blocks
    INSERT INTO "blocks" ("name_hindi", "name_english")
    SELECT DISTINCT "block_name", COALESCE("block_name_english", "block_name")
    FROM "narayanpur_hierarchy"
    ON CONFLICT DO NOTHING;

    -- Seed gram_panchayats
    INSERT INTO "gram_panchayats" ("name_hindi", "name_english", "block_id")
    SELECT DISTINCT
      nh."panchayat_name",
      COALESCE(nh."panchayat_name_english", nh."panchayat_name"),
      b."id"
    FROM "narayanpur_hierarchy" nh
    JOIN "blocks" b ON b."name_hindi" = nh."block_name"
    ON CONFLICT DO NOTHING;

    -- Seed villages
    INSERT INTO "villages" ("name_hindi", "name_english", "affected_status", "population", "gram_panchayat_id")
    SELECT DISTINCT
      nh."village_name",
      COALESCE(nh."village_name_english", nh."village_name"),
      COALESCE(nh."affected_status", 'Direct Affected'),
      nh."population",
      gp."id"
    FROM "narayanpur_hierarchy" nh
    JOIN "blocks" b ON b."name_hindi" = nh."block_name"
    JOIN "gram_panchayats" gp ON gp."name_hindi" = nh."panchayat_name" AND gp."block_id" = b."id"
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Hierarchy seeded from narayanpur_hierarchy table.';
  ELSE
    RAISE NOTICE 'narayanpur_hierarchy table not found — hierarchy must be seeded separately via seed script.';
  END IF;
END
$$;

-- Backfill village_id for existing household_surveys rows
UPDATE "household_surveys" hs
SET "village_id" = v."id"
FROM "villages" v
WHERE v."name_hindi" = hs."village_name"
  AND hs."village_id" IS NULL;

-- Report any unmatched rows
DO $$
DECLARE unmatched_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmatched_count
  FROM "household_surveys"
  WHERE "village_id" IS NULL;

  IF unmatched_count > 0 THEN
    RAISE WARNING '% household_surveys rows have no matching village — they will need manual village_id backfill.', unmatched_count;
  ELSE
    RAISE NOTICE 'All household_surveys rows have a village_id. OK.';
  END IF;
END
$$;

-- ============================================================
-- 5. ADD UNIQUE CONSTRAINT + FK ON village_id
--    (Only after backfill so no NULL violations)
-- ============================================================

-- Drop old village_name FK if it still exists (it was dropped in partial run)
ALTER TABLE "household_surveys"
    DROP CONSTRAINT IF EXISTS "household_surveys_village_name_fkey";

-- Drop old unique constraint on (village_name, house_number)
ALTER TABLE "household_surveys"
    DROP CONSTRAINT IF EXISTS "uniqueHousePerVillage";
DROP INDEX IF EXISTS "uniqueHousePerVillage";

-- Add FK on village_id (allow NULL for now if unmatched exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'household_surveys'
      AND constraint_name = 'household_surveys_village_id_fkey'
  ) THEN
    ALTER TABLE "household_surveys"
      ADD CONSTRAINT "household_surveys_village_id_fkey"
      FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE RESTRICT;
  END IF;
END
$$;

-- Add new unique constraint on (village_id, house_number) if village_id is populated
DO $$
DECLARE unmatched_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmatched_count FROM "household_surveys" WHERE "village_id" IS NULL;
  IF unmatched_count = 0 THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'household_surveys'
        AND constraint_name = 'uq_house_per_village'
    ) THEN
      ALTER TABLE "household_surveys"
        ADD CONSTRAINT "uq_house_per_village" UNIQUE ("village_id", "house_number");
    END IF;
    RAISE NOTICE 'uq_house_per_village constraint added.';
  ELSE
    RAISE WARNING 'Skipping uq_house_per_village — % rows still have NULL village_id.', unmatched_count;
  END IF;
END
$$;

-- ============================================================
-- 6. CREATE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_hh_village"          ON "household_surveys"("village_id");
CREATE INDEX IF NOT EXISTS "idx_hh_caste"            ON "household_surveys"("caste");
CREATE INDEX IF NOT EXISTS "idx_hh_bpl"              ON "household_surveys"("is_bpl");
CREATE INDEX IF NOT EXISTS "idx_hh_mining"           ON "household_surveys"("mining_employment");
CREATE INDEX IF NOT EXISTS "idx_hh_head_name"        ON "household_surveys"("head_name");
CREATE INDEX IF NOT EXISTS "idx_hh_mobile"           ON "household_surveys"("mobile");
CREATE INDEX IF NOT EXISTS "idx_audit_entity"        ON "survey_audit_logs"("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_audit_ts"            ON "survey_audit_logs"("timestamp" DESC);

-- Rename old indexes if they still exist
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_households_audit_status') THEN
    ALTER INDEX "idx_households_audit_status" RENAME TO "idx_hh_audit_status";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_households_registry_status') THEN
    ALTER INDEX "idx_households_registry_status" RENAME TO "idx_hh_registry_status";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_households_submitted_at') THEN
    ALTER INDEX "idx_households_submitted_at" RENAME TO "idx_hh_submitted_at";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_households_ticket_id') THEN
    ALTER INDEX "idx_households_ticket_id" RENAME TO "idx_hh_ticket";
  END IF;
END $$;

-- ============================================================
-- 7. UPDATE Prisma _prisma_migrations to track this migration
-- ============================================================

INSERT INTO "_prisma_migrations" (
    "id", "checksum", "finished_at", "migration_name",
    "logs", "rolled_back_at", "started_at", "applied_steps_count"
)
VALUES (
    gen_random_uuid()::text,
    'manual_clean_relational_schema',
    NOW(), 'clean_relational_schema',
    NULL, NULL, NOW(), 1
)
ON CONFLICT DO NOTHING;

COMMIT;
