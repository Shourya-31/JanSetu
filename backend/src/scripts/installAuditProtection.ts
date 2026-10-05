import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL must be configured');

async function installAuditProtection() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE OR REPLACE FUNCTION reject_survey_audit_log_mutation() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'survey_audit_logs is append-only';
      END;
      $$ LANGUAGE plpgsql;
      DROP TRIGGER IF EXISTS survey_audit_logs_append_only ON survey_audit_logs;
      CREATE TRIGGER survey_audit_logs_append_only
      BEFORE UPDATE OR DELETE ON survey_audit_logs
      FOR EACH ROW EXECUTE FUNCTION reject_survey_audit_log_mutation();
      DROP TRIGGER IF EXISTS survey_audit_logs_no_truncate ON survey_audit_logs;
      CREATE TRIGGER survey_audit_logs_no_truncate
      BEFORE TRUNCATE ON survey_audit_logs
      FOR EACH STATEMENT EXECUTE FUNCTION reject_survey_audit_log_mutation();
    `);

    const result = await client.query<{ trigger_count: number }>(`
      SELECT COUNT(*)::int AS trigger_count
      FROM pg_trigger
      WHERE tgrelid = 'survey_audit_logs'::regclass
        AND NOT tgisinternal
        AND tgname = ANY($1::text[]);
    `, [['survey_audit_logs_append_only', 'survey_audit_logs_no_truncate']]);
    if (result.rows[0]?.trigger_count !== 2) {
      throw new Error('Audit protection trigger verification failed');
    }

    await client.query('COMMIT');
    console.log('Verified append-only protections for survey_audit_logs.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

installAuditProtection().catch((error) => {
  console.error('Could not install audit protection:', error.message);
  process.exitCode = 1;
});