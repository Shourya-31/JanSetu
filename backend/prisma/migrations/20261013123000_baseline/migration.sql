-- CreateEnum
CREATE TYPE "Role" AS ENUM ('surveyor', 'admin');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "user_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'surveyor',
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" SERIAL NOT NULL,
    "name_hindi" TEXT NOT NULL,
    "name_english" TEXT NOT NULL,
    "total_villages" INTEGER NOT NULL DEFAULT 0,
    "direct_affected_villages" INTEGER NOT NULL DEFAULT 0,
    "indirect_affected_villages" INTEGER NOT NULL DEFAULT 0,
    "village_surveys_filled" INTEGER NOT NULL DEFAULT 0,
    "total_households" INTEGER NOT NULL DEFAULT 0,
    "households_filled" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gram_panchayats" (
    "id" SERIAL NOT NULL,
    "name_hindi" TEXT NOT NULL,
    "name_english" TEXT NOT NULL,
    "total_villages" INTEGER NOT NULL DEFAULT 0,
    "direct_affected_villages" INTEGER NOT NULL DEFAULT 0,
    "indirect_affected_villages" INTEGER NOT NULL DEFAULT 0,
    "village_surveys_filled" INTEGER NOT NULL DEFAULT 0,
    "total_households" INTEGER NOT NULL DEFAULT 0,
    "households_filled" INTEGER NOT NULL DEFAULT 0,
    "block_id" INTEGER NOT NULL,

    CONSTRAINT "gram_panchayats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villages" (
    "id" SERIAL NOT NULL,
    "name_hindi" TEXT NOT NULL,
    "name_english" TEXT NOT NULL,
    "affected_status" TEXT NOT NULL DEFAULT 'Direct Affected',
    "is_survey_filled" BOOLEAN NOT NULL DEFAULT false,
    "total_households" INTEGER NOT NULL DEFAULT 0,
    "households_filled" INTEGER NOT NULL DEFAULT 0,
    "population" INTEGER NOT NULL DEFAULT 0,
    "gram_panchayat_id" INTEGER NOT NULL,

    CONSTRAINT "villages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "village_surveys" (
    "id" TEXT NOT NULL,
    "village_id" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed_sections" JSONB NOT NULL DEFAULT '[]',
    "survey_data" JSONB NOT NULL DEFAULT '{}',
    "total_households" INTEGER,
    "total_population" INTEGER,
    "sc_population" INTEGER,
    "st_population" INTEGER,
    "total_schools" INTEGER,
    "total_anganwadi" INTEGER,
    "total_health_facilities" INTEGER,
    "total_hostels" INTEGER,
    "fair_price_shop" TEXT,
    "shop_distance" TEXT,
    "mobile_network" TEXT,
    "network_distance" TEXT,
    "electricity" TEXT,
    "solar_light" TEXT,
    "road" TEXT,
    "road_connectivity" INTEGER,
    "road_reasons" JSONB NOT NULL DEFAULT '[]',
    "rain_cutoff" TEXT,
    "tap_water" TEXT,
    "tap_water_excluded_families" INTEGER,
    "ponds" INTEGER,
    "pucca_houses" INTEGER,
    "raw_houses" INTEGER,
    "completed_houses" INTEGER,
    "pending_houses" INTEGER,
    "housing_not_sanctioned" INTEGER,
    "total_agricultural_land" TEXT,
    "irrigated_land" TEXT,
    "odf" TEXT,
    "banking" TEXT,
    "vet" TEXT,
    "water_source_type" TEXT,
    "water_availability_months" INTEGER,
    "water_quality_issue" TEXT,
    "fluoride_issue" TEXT,
    "handpumps_total" INTEGER,
    "handpumps_working" INTEGER,
    "pipeline_water_scheme" TEXT,
    "mnrega_workdays" INTEGER,
    "mnrega_demand_pending" INTEGER,
    "mining_workers_count" INTEGER,
    "migration_count" INTEGER,
    "migration_destination" TEXT,
    "sub_health_center_available" TEXT,
    "health_worker_visit" TEXT,
    "malaria_last_year" INTEGER,
    "tb_cases_count" INTEGER,
    "sickle_cell" TEXT,
    "primary_school_available" TEXT,
    "school_teachers_count" INTEGER,
    "mid_day_meal" TEXT,
    "dropout_reason" TEXT,
    "anganwadi_worker_present" TEXT,
    "nutrition_program_coverage" TEXT,
    "anganwadi_building" TEXT,
    "ashram_school_available" TEXT,
    "hostel_capacity" INTEGER,
    "hostel_occupancy" INTEGER,
    "shg_count" INTEGER,
    "shg_active_members_count" INTEGER,
    "mahtari_vandana_count" INTEGER,
    "old_age_pension_count" INTEGER,
    "widow_pension_count" INTEGER,
    "disability_pension_count" INTEGER,
    "open_defecation_free" TEXT,
    "solid_waste_management" TEXT,
    "drainage_system" TEXT,
    "electric_line_km" TEXT,
    "internet_available" TEXT,
    "gram_sabha_last_held" TEXT,
    "village_photos" JSONB NOT NULL DEFAULT '[]',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_by" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "village_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_surveys" (
    "id" TEXT NOT NULL,
    "tracking_id" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_sections" INTEGER NOT NULL DEFAULT 0,
    "house_number" INTEGER NOT NULL,
    "village_id" INTEGER NOT NULL,
    "head_name" TEXT NOT NULL DEFAULT '',
    "mobile" TEXT NOT NULL DEFAULT '',
    "survey_date" TEXT NOT NULL DEFAULT '',
    "surveyor_name" TEXT NOT NULL DEFAULT '',
    "caste" TEXT NOT NULL DEFAULT '',
    "is_bpl" TEXT NOT NULL DEFAULT '',
    "elders_count" INTEGER NOT NULL DEFAULT 0,
    "children_count" INTEGER NOT NULL DEFAULT 0,
    "women_count" INTEGER NOT NULL DEFAULT 0,
    "ration_card" TEXT,
    "no_aadhaar_members" INTEGER NOT NULL DEFAULT 0,
    "aadhaar_ekyc" TEXT,
    "no_caste_cert_members" INTEGER NOT NULL DEFAULT 0,
    "no_ayushman_members" INTEGER NOT NULL DEFAULT 0,
    "no_voter_id_members" INTEGER NOT NULL DEFAULT 0,
    "mnrega_job_card" TEXT,
    "no_shramik_card_members" INTEGER NOT NULL DEFAULT 0,
    "jan_dhan_account" TEXT,
    "bank_name" TEXT,
    "kcc" TEXT,
    "forest_rights_patta" TEXT,
    "marriage_certificate" TEXT,
    "jsy" TEXT,
    "pmmvy" TEXT,
    "mahtari_vandana" TEXT,
    "widow_pension" TEXT,
    "disability_pension" TEXT,
    "needs_assistive_device" TEXT,
    "assistance_types" JSONB NOT NULL DEFAULT '[]',
    "other_assistance" TEXT,
    "death_in_last_year" TEXT,
    "death_certificate_received" TEXT,
    "pm_garib_kalyan_ration" TEXT,
    "children_without_birth_cert" INTEGER DEFAULT 0,
    "vaccination_status" TEXT,
    "anganwadi_meal" TEXT,
    "children_school_status" TEXT,
    "school_not_going_reason" JSONB NOT NULL DEFAULT '[]',
    "other_school_reason" TEXT,
    "unemployed_members" INTEGER DEFAULT 0,
    "pm_kisan" TEXT,
    "mining_employment" TEXT,
    "annual_income" INTEGER,
    "main_income_source" TEXT,
    "livestock_source" TEXT,
    "other_livestock_source" TEXT,
    "animal_employment" TEXT,
    "house_type" TEXT,
    "housing_scheme_benefit" TEXT,
    "toilet_status" TEXT,
    "tap_water_connection" TEXT,
    "drinking_water_source" TEXT,
    "electricity_connection" TEXT,
    "solar_energy" TEXT,
    "family_disease" TEXT,
    "free_medicines" TEXT,
    "shg_member" TEXT,
    "priority_need_1" TEXT,
    "priority_need_2" TEXT,
    "priority_need_3" TEXT,
    "eligible_scheme_not_received" TEXT,
    "scheme_benefit_name" TEXT,
    "audit_status" TEXT NOT NULL DEFAULT 'लंबित',
    "registry_status" TEXT NOT NULL DEFAULT 'लंबित',
    "verification_result" TEXT,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "correction_ticket_id" TEXT,
    "correction_reason" TEXT,
    "correction_note" TEXT,
    "correction_created_at" TIMESTAMP(3),
    "audit_note" TEXT,
    "created_by" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "household_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_audit_logs" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changed_by" TEXT,
    "changes" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_code_key" ON "users"("user_code");

-- CreateIndex
CREATE UNIQUE INDEX "blocks_name_hindi_key" ON "blocks"("name_hindi");

-- CreateIndex
CREATE UNIQUE INDEX "gram_panchayats_block_id_name_hindi_key" ON "gram_panchayats"("block_id", "name_hindi");

-- CreateIndex
CREATE UNIQUE INDEX "villages_gram_panchayat_id_name_hindi_key" ON "villages"("gram_panchayat_id", "name_hindi");

-- CreateIndex
CREATE UNIQUE INDEX "village_surveys_village_id_key" ON "village_surveys"("village_id");

-- CreateIndex
CREATE UNIQUE INDEX "household_surveys_tracking_id_key" ON "household_surveys"("tracking_id");

-- CreateIndex
CREATE INDEX "idx_hh_village" ON "household_surveys"("village_id");

-- CreateIndex
CREATE INDEX "idx_hh_caste" ON "household_surveys"("caste");

-- CreateIndex
CREATE INDEX "idx_hh_bpl" ON "household_surveys"("is_bpl");

-- CreateIndex
CREATE INDEX "idx_hh_mining" ON "household_surveys"("mining_employment");

-- CreateIndex
CREATE INDEX "idx_hh_audit_status" ON "household_surveys"("audit_status");

-- CreateIndex
CREATE INDEX "idx_hh_registry_status" ON "household_surveys"("registry_status");

-- CreateIndex
CREATE INDEX "idx_hh_ticket" ON "household_surveys"("correction_ticket_id");

-- CreateIndex
CREATE INDEX "idx_hh_submitted_at" ON "household_surveys"("submitted_at" DESC);

-- CreateIndex
CREATE INDEX "idx_hh_head_name" ON "household_surveys"("head_name");

-- CreateIndex
CREATE INDEX "idx_hh_mobile" ON "household_surveys"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "household_surveys_village_id_house_number_key" ON "household_surveys"("village_id", "house_number");

-- CreateIndex
CREATE INDEX "idx_audit_entity" ON "survey_audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_audit_ts" ON "survey_audit_logs"("timestamp" DESC);

-- AddForeignKey
ALTER TABLE "gram_panchayats" ADD CONSTRAINT "gram_panchayats_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villages" ADD CONSTRAINT "villages_gram_panchayat_id_fkey" FOREIGN KEY ("gram_panchayat_id") REFERENCES "gram_panchayats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "village_surveys" ADD CONSTRAINT "village_surveys_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "village_surveys" ADD CONSTRAINT "village_surveys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_surveys" ADD CONSTRAINT "household_surveys_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_surveys" ADD CONSTRAINT "household_surveys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_audit_logs" ADD CONSTRAINT "survey_audit_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

