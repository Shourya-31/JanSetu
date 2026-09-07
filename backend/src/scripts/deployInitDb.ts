import { Client } from 'pg';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgres://adityaboxi@localhost:5432/jansetu';

async function runProductionDbSetup() {
  console.log('==================================================================');
  console.log('⚡ STARTING PRODUCTION DATABASE INITIALIZATION & TUNING (TS)');
  console.log('==================================================================\n');

  try {
    console.log('📦 Syncing database tables with Prisma schema...');
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
    console.log('✅ Database tables synced successfully.\n');
  } catch (syncErr: any) {
    console.warn('⚠️ Prisma db push warning:', syncErr.message);
  }

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database.');

    console.log('🔧 Tuning PostgreSQL Async WAL & Parallel Worker Settings...');
    await client.query("ALTER SYSTEM SET synchronous_commit = 'on';");
    await client.query("ALTER SYSTEM SET max_worker_processes = 4;");
    await client.query("ALTER SYSTEM SET max_parallel_workers_per_gather = 2;");
    await client.query("ALTER SYSTEM SET max_parallel_workers = 4;");
    await client.query("SELECT pg_reload_conf();");
    console.log('✅ Hardware & WAL tuning applied successfully.');

    console.log('⚡ Ensuring pgcrypto & pg_trgm Extensions & High-Performance GIN Trigram/B-Tree Indexes...');
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
    await client.query("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
    await client.query("CREATE INDEX IF NOT EXISTS idx_households_survey_answers_gin ON household_surveys USING GIN (survey_answers jsonb_path_ops);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_households_multi_filter ON household_surveys (village_name, is_bpl, caste, is_mining_worker);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_households_missing_docs ON household_surveys (missing_aadhaar, missing_ayushman, missing_caste_cert, missing_voter_id);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_households_head_name_trgm ON household_surveys USING GIN (head_name gin_trgm_ops);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_households_mobile_trgm ON household_surveys USING GIN (mobile gin_trgm_ops);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_households_tracking_id_trgm ON household_surveys USING GIN (tracking_id gin_trgm_ops);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_households_village_name_trgm ON household_surveys USING GIN (village_name gin_trgm_ops);");
    console.log('✅ GIN Trigram & Composite B-Tree indexes created.');

    console.log('📊 Creating Materialized View (mv_district_cluster_analytics)...');
    await client.query(`
      DROP MATERIALIZED VIEW IF EXISTS mv_district_cluster_analytics CASCADE;
      CREATE MATERIALIZED VIEW mv_district_cluster_analytics AS
      SELECT 
        village_name AS "villageName",
        COUNT(*)::int AS "totalHouseholds",
        SUM(total_members)::int AS "totalPopulation",
        SUM(CASE WHEN is_bpl = 'Yes' OR is_bpl = 'हां' THEN 1 ELSE 0 END)::int AS "bplCount",
        SUM(CASE WHEN caste = 'Scheduled Tribe (ST)' THEN 1 ELSE 0 END)::int AS "stCount",
        SUM(CASE WHEN caste = 'Scheduled Caste (SC)' THEN 1 ELSE 0 END)::int AS "scCount",
        SUM(missing_aadhaar)::int AS "missingAadhaarTotal",
        SUM(missing_ayushman)::int AS "missingAyushmanTotal",
        SUM(unemployed_count)::int AS "unemployedYouthTotal",
        SUM(CASE WHEN missing_aadhaar > 0 OR missing_ayushman > 0 THEN 1 ELSE 0 END)::int AS "missingDocsCount",
        SUM(CASE WHEN is_mining_worker = 'Yes' OR is_mining_worker = 'हां' THEN 1 ELSE 0 END)::int AS "miningAffectedCount",
        SUM(CASE WHEN has_tap_water = 'No' OR has_tap_water = 'नहीं' THEN 1 ELSE 0 END)::int AS "noTapWaterCount"
      FROM household_surveys
      GROUP BY village_name;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_village_name ON mv_district_cluster_analytics ("villageName");
    `);
    console.log('✅ Materialized View & Unique Index configured.');

    console.log('🔄 Refreshing Materialized View with latest data...');
    await client.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_district_cluster_analytics;`);
    console.log('✅ Materialized View refreshed.');

    console.log('\n==================================================================');
    console.log('🏆 PRODUCTION DATABASE SETUP & TUNING COMPLETED CLEANLY!');
    console.log('==================================================================\n');
  } catch (err: any) {
    console.error('❌ Error during production DB setup:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runProductionDbSetup();
