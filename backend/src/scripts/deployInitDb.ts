import { Client } from '../../node_modules/@types/pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgres://adityaboxi@localhost:5432/jansetu';

async function runProductionDbSetup() {
  console.log('==================================================================');
  console.log('⚡ STARTING PRODUCTION DATABASE INITIALIZATION & TUNING (TS)');
  console.log('==================================================================\n');

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

    console.log('📊 Creating Materialized View (mv_district_cluster_analytics)...');
    await client.query(`
      DROP MATERIALIZED VIEW IF EXISTS mv_district_cluster_analytics CASCADE;
      CREATE MATERIALIZED VIEW mv_district_cluster_analytics AS
      SELECT 
        village_name AS "villageName",
        COUNT(*) AS "totalHouseholds",
        SUM(CASE WHEN is_bpl = 'Yes' THEN 1 ELSE 0 END) AS "bplCount",
        SUM(CASE WHEN caste = 'Scheduled Tribe (ST)' THEN 1 ELSE 0 END) AS "stCount",
        SUM(CASE WHEN caste = 'Scheduled Caste (SC)' THEN 1 ELSE 0 END) AS "scCount",
        SUM(CASE WHEN missing_aadhaar > 0 OR missing_ayushman > 0 THEN 1 ELSE 0 END) AS "missingDocsCount",
        SUM(CASE WHEN is_mining_worker = 'Yes' THEN 1 ELSE 0 END) AS "miningAffectedCount",
        SUM(CASE WHEN has_tap_water = 'No' THEN 1 ELSE 0 END) AS "noTapWaterCount"
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
