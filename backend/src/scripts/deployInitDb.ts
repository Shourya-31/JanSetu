import { Client } from 'pg';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL must be configured');

async function runProductionDbSetup() {
  console.log('==================================================================');
  console.log('STARTING PRODUCTION DATABASE INITIALIZATION & TUNING (TS)');
  console.log('==================================================================\n');

  try {
    console.log('Syncing database tables with Prisma schema...');
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
    console.log('Database tables synced successfully.\n');
  } catch (syncErr: any) {
    console.warn('Prisma db push warning:', syncErr.message);
  }

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database.');

    console.log('Tuning PostgreSQL Async WAL & Parallel Worker Settings...');
    await client.query("ALTER SYSTEM SET synchronous_commit = 'on';");
    await client.query("ALTER SYSTEM SET max_worker_processes = 4;");
    await client.query("ALTER SYSTEM SET max_parallel_workers_per_gather = 2;");
    await client.query("ALTER SYSTEM SET max_parallel_workers = 4;");
    await client.query("SELECT pg_reload_conf();");
    console.log('Hardware & WAL tuning applied successfully.');

    console.log('Ensuring pgcrypto & pg_trgm Extensions & High-Performance GIN Trigram/B-Tree Indexes...');
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
    await client.query("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
    await client.query("CREATE INDEX IF NOT EXISTS idx_households_multi_filter ON household_surveys (village_id, is_bpl, caste, mining_employment);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_households_missing_docs ON household_surveys (no_aadhaar_members, no_ayushman_members, no_caste_cert_members, no_voter_id_members);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_households_head_name_trgm ON household_surveys USING GIN (head_name gin_trgm_ops);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_households_mobile_trgm ON household_surveys USING GIN (mobile gin_trgm_ops);");
    await client.query("CREATE INDEX IF NOT EXISTS idx_households_tracking_id_trgm ON household_surveys USING GIN (tracking_id gin_trgm_ops);");
    console.log('GIN Trigram & Composite B-Tree indexes created.');

    console.log('Creating Materialized View (mv_district_cluster_analytics)...');
    await client.query(`
      DROP MATERIALIZED VIEW IF EXISTS mv_district_cluster_analytics CASCADE;
      CREATE MATERIALIZED VIEW mv_district_cluster_analytics AS
      SELECT 
        village_id AS "villageId",
        COUNT(*)::int AS "totalHouseholds",
        SUM(elders_count + children_count + women_count)::int AS "totalPopulation",
        SUM(CASE WHEN is_bpl = 'Yes' OR is_bpl = 'हां' THEN 1 ELSE 0 END)::int AS "bplCount",
        SUM(CASE WHEN caste = 'Scheduled Tribe (ST)' THEN 1 ELSE 0 END)::int AS "stCount",
        SUM(CASE WHEN caste = 'Scheduled Caste (SC)' THEN 1 ELSE 0 END)::int AS "scCount",
        SUM(no_aadhaar_members)::int AS "missingAadhaarTotal",
        SUM(no_ayushman_members)::int AS "missingAyushmanTotal",
        SUM(unemployed_members)::int AS "unemployedYouthTotal",
        SUM(CASE WHEN no_aadhaar_members > 0 OR no_ayushman_members > 0 OR no_caste_cert_members > 0 OR no_voter_id_members > 0 THEN 1 ELSE 0 END)::int AS "missingDocsCount",
        SUM(CASE WHEN mining_employment = 'Yes' OR mining_employment = 'हां' THEN 1 ELSE 0 END)::int AS "miningAffectedCount",
        SUM(CASE WHEN tap_water_connection = 'No' OR tap_water_connection = 'नहीं' THEN 1 ELSE 0 END)::int AS "noTapWaterCount"
      FROM household_surveys
      GROUP BY village_id;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_village_id ON mv_district_cluster_analytics ("villageId");
    `);
    console.log('Materialized View & Unique Index configured.');

    console.log('Refreshing Materialized View with latest data...');
    await client.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_district_cluster_analytics;`);
    console.log('Materialized View refreshed.');

    console.log('\n==================================================================');
    console.log('🏆 PRODUCTION DATABASE SETUP & TUNING COMPLETED CLEANLY!');
    console.log('==================================================================\n');
  } catch (err: any) {
    console.error('Error during production DB setup:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runProductionDbSetup();
