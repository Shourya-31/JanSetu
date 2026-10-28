import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

async function sha256File(filePath: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of fs.createReadStream(filePath)) hash.update(chunk);
  return hash.digest('hex');
}

function findExecutable(configuredPath: string | undefined, defaultPath: string): string {
  if (configuredPath) {
    if (!fs.existsSync(configuredPath)) throw new Error(`Configured executable is missing: ${path.basename(configuredPath)}`);
    return configuredPath;
  }
  return defaultPath;
}

async function createVerifiedBackup(): Promise<void> {
  const backupDir = path.join(__dirname, '../../backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `jansetu_backup_${timestamp}.dump`);
  const databaseUrl = process.env.DATABASE_URL?.replace(/[?&]schema=[^&]*/i, '');
  const connectionArgs = databaseUrl
    ? ['--dbname', databaseUrl]
    : ['-U', process.env.PGUSER || 'adityaboxi', '-d', process.env.PGDATABASE || 'jansetu'];
  const pgDump = findExecutable(
    process.env.PG_DUMP_PATH,
    'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe'
  );
  const pgRestore = findExecutable(
    process.env.PG_RESTORE_PATH,
    'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_restore.exe'
  );

  console.log(`Creating PostgreSQL backup: ${path.basename(backupFile)}`);
  execFileSync(pgDump, [
    '--format=custom',
    '--no-owner',
    '--no-acl',
    '--file',
    backupFile,
    ...connectionArgs
  ], { env: process.env, stdio: 'ignore' });

  const stat = fs.statSync(backupFile);
  if (stat.size === 0) throw new Error('pg_dump produced an empty backup.');

  const nullDevice = process.platform === 'win32' ? 'NUL' : '/dev/null';
  execFileSync(pgRestore, ['--list', backupFile], { env: process.env, stdio: 'ignore' });
  execFileSync(pgRestore, ['--file', nullDevice, backupFile], { env: process.env, stdio: 'ignore' });

  const manifest = {
    fileName: path.basename(backupFile),
    sizeBytes: stat.size,
    sha256: await sha256File(backupFile),
    verifiedAt: new Date().toISOString(),
    verification: 'pg_restore-extract-verified'
  };
  fs.writeFileSync(`${backupFile}.verified.json`, `${JSON.stringify(manifest, null, 2)}\n`, {
    encoding: 'utf8',
    flag: 'wx'
  });
  console.log(`Verified backup created: ${path.basename(backupFile)} (${stat.size} bytes)`);
}

if (require.main === module) {
  createVerifiedBackup()
    .catch((error: unknown) => {
      const code = error && typeof error === 'object' && 'code' in error
        ? String(error.code)
        : 'unknown';
      console.error(`PostgreSQL backup or verification failed (error code: ${code}). No backup was marked verified.`);
      process.exitCode = 1;
    });
}
