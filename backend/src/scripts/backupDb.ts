import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const dateStr = new Date().toISOString().split('T')[0];
const backupFile = path.join(backupDir, `jansetu_backup_${dateStr}.sql`);

console.log(`📦 Creating Timestamped PostgreSQL Backup: ${backupFile}...`);

const pgDumpCandidates = [
  process.env.PG_DUMP_PATH,
  'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
  'pg_dump'
].filter((value): value is string => Boolean(value));
const pgDump = pgDumpCandidates.find((candidate) => candidate === 'pg_dump' || fs.existsSync(candidate)) || 'pg_dump';
const dumpDatabaseUrl = process.env.DATABASE_URL?.replace(/[?&]schema=[^&]*/i, '');
const dumpArgs = dumpDatabaseUrl
  ? ['--dbname', dumpDatabaseUrl]
  : ['-U', process.env.PGUSER || 'adityaboxi', '-d', process.env.PGDATABASE || 'jansetu'];

execFile(pgDump, dumpArgs, {
  env: process.env,
  maxBuffer: 1024 * 1024
}, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Backup failed: ${error.message}${stderr ? `\n${stderr}` : ''}`);
    process.exit(1);
  }
  fs.writeFileSync(backupFile, stdout);
  console.log(`✅ Backup Completed Successfully! File size: ${(fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)} MB`);
});
