import { execFileSync } from 'node:child_process';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL must be configured');

const MAX_CONNECT_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2_000;

type DatabaseClient = {
  connect: () => Promise<unknown>;
  query: (queryText: string) => Promise<{ rows: Array<Record<string, unknown>> }>;
  end: () => Promise<void>;
};
type CommandRunner = (args: string[]) => void;

export type DatabaseState = {
  hasApplicationTables: boolean;
  hasMigrationTable: boolean;
};

export function classifyDatabaseState(result: DatabaseState): 'fresh' | 'managed' | 'existing-unmanaged' {
  if (!result.hasApplicationTables) return 'fresh';
  if (result.hasMigrationTable) return 'managed';
  return 'existing-unmanaged';
}

export async function connectWithRetry(client: DatabaseClient, attempts = MAX_CONNECT_ATTEMPTS): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await client.connect();
      return;
    } catch (error) {
      lastError = error;
      console.error(`[db-init][connection] attempt ${attempt}/${attempts} failed: ${error instanceof Error ? error.message : String(error)}`);
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
  throw new Error(`Could not connect to PostgreSQL after ${attempts} attempts. Check DATABASE_URL, network access, credentials, and server readiness.`, { cause: lastError });
}

function runPrisma(args: string[], runner: CommandRunner = (command) => {
  const npmExecutable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  execFileSync(npmExecutable, ['prisma', ...command], {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32'
  });
}): void {
  runner(args);
}

function runPrismaCapture(args: string[]): string {
  const npmExecutable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  return execFileSync(npmExecutable, ['prisma', ...args], {
    env: process.env,
    encoding: 'utf8',
    shell: process.platform === 'win32'
  });
}

function verifyExistingSchemaCompatibility(): void {
  let diff: string;
  try {
    diff = runPrismaCapture([
      'migrate', 'diff',
      '--from-url', dbUrl!,
      '--to-schema-datamodel', 'prisma/schema.prisma',
      '--script'
    ]);
  } catch (error) {
    throw new Error(
      'Could not compare the existing database with the Prisma schema. ' +
      'Review the database connection and schema permissions before approving a baseline.',
      { cause: error }
    );
  }

  const requiredDiff = diff
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('--') && !line.startsWith('/*'))
    .filter((line) => !/^DROP INDEX\b/i.test(line));

  if (requiredDiff.length > 0) {
    throw new Error(
      'Existing database schema is incompatible with the Prisma schema. ' +
      'No baseline was recorded and no schema changes were applied. ' +
      `Review the migration diff before proceeding: ${requiredDiff.slice(0, 3).join(' ')}`
    );
  }
}

async function inspectDatabase(client: DatabaseClient): Promise<DatabaseState> {
  const result = await client.query(`
    SELECT
      to_regclass('public._prisma_migrations') IS NOT NULL AS has_migration_table,
      EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind IN ('r', 'p')
          AND c.relname NOT IN ('_prisma_migrations')
      ) AS has_application_tables
  `);
  return {
    hasApplicationTables: Boolean(result.rows[0].has_application_tables),
    hasMigrationTable: Boolean(result.rows[0].has_migration_table)
  };
}

function applyRequiredSchema(state: DatabaseState, runner?: CommandRunner): void {
  const classification = classifyDatabaseState(state);
  if (classification === 'fresh' || classification === 'managed') {
    console.log(`[db-init][schema] applying version-controlled migrations (${classification} database)`);
    runPrisma(['migrate', 'deploy'], runner);
    return;
  }

  if (process.env.DB_INIT_APPROVE_BASELINE !== 'true') {
    throw new Error(
      'Existing database has no Prisma migration history. No automatic baseline was applied. ' +
      'Review a backup and schema compatibility, then rerun with DB_INIT_APPROVE_BASELINE=true to record the approved baseline.'
    );
  }

  console.log('[db-init][schema] checking existing schema compatibility before approved baseline');
  if (runner) {
    runPrisma(['migrate', 'diff', '--from-url', dbUrl!, '--to-schema-datamodel', 'prisma/schema.prisma', '--script'], runner);
  } else {
    verifyExistingSchemaCompatibility();
  }
  console.log('[db-init][schema] recording explicitly approved baseline');
  runPrisma(['migrate', 'resolve', '--applied', '20261013123000_baseline'], runner);
}

export async function applyOptionalTuning(client: DatabaseClient): Promise<void> {
  console.log('[db-init][optional] applying PostgreSQL extensions, indexes, and analytics view');
  await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
  await client.query("CREATE EXTENSION IF NOT EXISTS pg_trgm");
  await client.query("CREATE INDEX IF NOT EXISTS idx_households_multi_filter ON household_surveys (village_id, is_bpl, caste, mining_employment)");
  await client.query("CREATE INDEX IF NOT EXISTS idx_households_missing_docs ON household_surveys (no_aadhaar_members, no_ayushman_members, no_caste_cert_members, no_voter_id_members)");
  await client.query("CREATE INDEX IF NOT EXISTS idx_households_head_name_trgm ON household_surveys USING GIN (head_name gin_trgm_ops)");
  await client.query("CREATE INDEX IF NOT EXISTS idx_households_mobile_trgm ON household_surveys USING GIN (mobile gin_trgm_ops)");
  await client.query("CREATE INDEX IF NOT EXISTS idx_households_tracking_id_trgm ON household_surveys USING GIN (tracking_id gin_trgm_ops)");
  await client.query("ALTER SYSTEM SET synchronous_commit = 'on'");
  await client.query("ALTER SYSTEM SET max_worker_processes = 4");
  await client.query("ALTER SYSTEM SET max_parallel_workers_per_gather = 2");
  await client.query("ALTER SYSTEM SET max_parallel_workers = 4");
  await client.query("SELECT pg_reload_conf()");

  const view = await client.query(`
    SELECT to_regclass('public.mv_district_cluster_analytics') IS NOT NULL AS exists
  `);
  if (!view.rows[0].exists) {
    await client.query(`
      CREATE MATERIALIZED VIEW mv_district_cluster_analytics AS
      SELECT village_id AS "villageId",
        COUNT(*)::int AS "totalHouseholds",
        SUM(elders_count + children_count + women_count)::int AS "totalPopulation",
        SUM(CASE WHEN is_bpl IN ('Yes', 'हां') THEN 1 ELSE 0 END)::int AS "bplCount",
        SUM(CASE WHEN caste = 'Scheduled Tribe (ST)' THEN 1 ELSE 0 END)::int AS "stCount",
        SUM(CASE WHEN caste = 'Scheduled Caste (SC)' THEN 1 ELSE 0 END)::int AS "scCount",
        SUM(no_aadhaar_members)::int AS "missingAadhaarTotal",
        SUM(no_ayushman_members)::int AS "missingAyushmanTotal",
        SUM(unemployed_members)::int AS "unemployedYouthTotal",
        SUM(CASE WHEN no_aadhaar_members > 0 OR no_ayushman_members > 0 OR no_caste_cert_members > 0 OR no_voter_id_members > 0 THEN 1 ELSE 0 END)::int AS "missingDocsCount",
        SUM(CASE WHEN mining_employment IN ('Yes', 'हां') THEN 1 ELSE 0 END)::int AS "miningAffectedCount",
        SUM(CASE WHEN tap_water_connection IN ('No', 'नहीं') THEN 1 ELSE 0 END)::int AS "noTapWaterCount"
      FROM household_surveys
      GROUP BY village_id
    `);
  }
  await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_village_id ON mv_district_cluster_analytics ("villageId")');
  await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_district_cluster_analytics');
}

export async function initializeDatabase(
  client: DatabaseClient,
  runner?: CommandRunner
): Promise<void> {
  console.log('[db-init][required] connecting to PostgreSQL');
  await connectWithRetry(client);
  try {
    console.log('[db-init][required] inspecting database state');
    const state = await inspectDatabase(client);
    applyRequiredSchema(state, runner);
    console.log('[db-init][required] schema is ready');
    try {
      await applyOptionalTuning(client);
      console.log('[db-init][optional] tuning completed');
    } catch (error) {
      console.warn(`[db-init][optional] tuning skipped; application can continue: ${error instanceof Error ? error.message : String(error)}`);
    }
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  initializeDatabase(new Client({ connectionString: dbUrl }))
    .then(() => console.log('[db-init] required database preparation completed'))
    .catch((error) => {
      console.error(`[db-init][fatal] required database preparation failed: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    });
}
