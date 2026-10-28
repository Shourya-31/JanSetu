CREATE TABLE "statistical_analysis_summaries" (
    "block_id" INTEGER NOT NULL,
    "total_villages" INTEGER NOT NULL DEFAULT 0,
    "unclassified_villages" INTEGER NOT NULL DEFAULT 0,
    "direct_village_count" INTEGER NOT NULL DEFAULT 0,
    "direct_village_surveys_completed" INTEGER NOT NULL DEFAULT 0,
    "indirect_village_count" INTEGER NOT NULL DEFAULT 0,
    "indirect_village_surveys_completed" INTEGER NOT NULL DEFAULT 0,
    "direct_household_input" INTEGER NOT NULL DEFAULT 0,
    "direct_household_completed" INTEGER NOT NULL DEFAULT 0,
    "direct_village_household_completion_percent_sum" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "direct_village_household_completion_percent_count" INTEGER NOT NULL DEFAULT 0,
    "indirect_household_input" INTEGER NOT NULL DEFAULT 0,
    "indirect_household_completed" INTEGER NOT NULL DEFAULT 0,
    "indirect_village_household_completion_percent_sum" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "indirect_village_household_completion_percent_count" INTEGER NOT NULL DEFAULT 0,
    "is_stale" BOOLEAN NOT NULL DEFAULT TRUE,
    "refreshed_at" TIMESTAMP(3),
    "source_updated_at" TIMESTAMP(3),

    CONSTRAINT "statistical_analysis_summaries_pkey" PRIMARY KEY ("block_id")
);

CREATE TABLE "statistical_analysis_refresh_queue" (
    "block_id" INTEGER NOT NULL,
    "queued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,

    CONSTRAINT "statistical_analysis_refresh_queue_pkey" PRIMARY KEY ("block_id")
);

ALTER TABLE "statistical_analysis_summaries"
ADD CONSTRAINT "statistical_analysis_summaries_block_id_fkey"
FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "statistical_analysis_refresh_queue"
ADD CONSTRAINT "statistical_analysis_refresh_queue_block_id_fkey"
FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION "enqueue_statistical_analysis_refresh"(target_block_id INTEGER)
RETURNS VOID AS $$
BEGIN
    IF target_block_id IS NULL THEN
        RETURN;
    END IF;

    INSERT INTO "statistical_analysis_refresh_queue" ("block_id", "queued_at", "attempts", "last_error")
    VALUES (target_block_id, clock_timestamp(), 0, NULL)
    ON CONFLICT ("block_id") DO UPDATE
    SET "queued_at" = EXCLUDED."queued_at",
        "attempts" = 0,
        "last_error" = NULL;

    UPDATE "statistical_analysis_summaries"
    SET "is_stale" = TRUE
    WHERE "block_id" = target_block_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "queue_village_statistics_refresh"()
RETURNS TRIGGER AS $$
DECLARE
    old_block_id INTEGER;
    new_block_id INTEGER;
BEGIN
    IF TG_OP <> 'INSERT' THEN
        SELECT "block_id" INTO old_block_id
        FROM "gram_panchayats" WHERE "id" = OLD."gram_panchayat_id";
        PERFORM "enqueue_statistical_analysis_refresh"(old_block_id);
    END IF;

    IF TG_OP <> 'DELETE' THEN
        SELECT "block_id" INTO new_block_id
        FROM "gram_panchayats" WHERE "id" = NEW."gram_panchayat_id";
        PERFORM "enqueue_statistical_analysis_refresh"(new_block_id);
    END IF;

    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "villages_statistics_refresh"
AFTER INSERT OR DELETE OR UPDATE OF "affected_status", "gram_panchayat_id"
ON "villages"
FOR EACH ROW EXECUTE FUNCTION "queue_village_statistics_refresh"();

CREATE OR REPLACE FUNCTION "queue_village_survey_statistics_refresh"()
RETURNS TRIGGER AS $$
DECLARE
    old_block_id INTEGER;
    new_block_id INTEGER;
BEGIN
    IF TG_OP <> 'INSERT' THEN
        SELECT gp."block_id" INTO old_block_id
        FROM "villages" v JOIN "gram_panchayats" gp ON gp."id" = v."gram_panchayat_id"
        WHERE v."id" = OLD."village_id";
        PERFORM "enqueue_statistical_analysis_refresh"(old_block_id);
    END IF;

    IF TG_OP <> 'DELETE' THEN
        SELECT gp."block_id" INTO new_block_id
        FROM "villages" v JOIN "gram_panchayats" gp ON gp."id" = v."gram_panchayat_id"
        WHERE v."id" = NEW."village_id";
        PERFORM "enqueue_statistical_analysis_refresh"(new_block_id);
    END IF;

    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "village_surveys_statistics_refresh"
AFTER INSERT OR DELETE OR UPDATE OF "is_completed", "village_id"
ON "village_surveys"
FOR EACH ROW EXECUTE FUNCTION "queue_village_survey_statistics_refresh"();

CREATE OR REPLACE FUNCTION "queue_household_statistics_refresh"()
RETURNS TRIGGER AS $$
DECLARE
    old_block_id INTEGER;
    new_block_id INTEGER;
BEGIN
    IF TG_OP <> 'INSERT' THEN
        SELECT gp."block_id" INTO old_block_id
        FROM "villages" v JOIN "gram_panchayats" gp ON gp."id" = v."gram_panchayat_id"
        WHERE v."id" = OLD."village_id";
        PERFORM "enqueue_statistical_analysis_refresh"(old_block_id);
    END IF;

    IF TG_OP <> 'DELETE' THEN
        SELECT gp."block_id" INTO new_block_id
        FROM "villages" v JOIN "gram_panchayats" gp ON gp."id" = v."gram_panchayat_id"
        WHERE v."id" = NEW."village_id";
        PERFORM "enqueue_statistical_analysis_refresh"(new_block_id);
    END IF;

    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "household_surveys_statistics_refresh"
AFTER INSERT OR DELETE OR UPDATE OF "is_completed", "village_id"
ON "household_surveys"
FOR EACH ROW EXECUTE FUNCTION "queue_household_statistics_refresh"();

CREATE OR REPLACE FUNCTION "queue_gram_panchayat_statistics_refresh"()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP <> 'INSERT' THEN
        PERFORM "enqueue_statistical_analysis_refresh"(OLD."block_id");
    END IF;
    IF TG_OP <> 'DELETE' THEN
        PERFORM "enqueue_statistical_analysis_refresh"(NEW."block_id");
    END IF;
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "gram_panchayats_statistics_refresh"
AFTER INSERT OR DELETE OR UPDATE OF "block_id"
ON "gram_panchayats"
FOR EACH ROW EXECUTE FUNCTION "queue_gram_panchayat_statistics_refresh"();

INSERT INTO "statistical_analysis_refresh_queue" ("block_id")
SELECT "id" FROM "blocks"
ON CONFLICT ("block_id") DO NOTHING;
