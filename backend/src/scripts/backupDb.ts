import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const dateStr = new Date().toISOString().split('T')[0];
const backupFile = path.join(backupDir, `jansetu_backup_${dateStr}.sql`);

console.log(`📦 Creating Timestamped PostgreSQL Backup: ${backupFile}...`);

exec(`pg_dump -U adityaboxi -d jansetu > "${backupFile}"`, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Backup failed: ${error.message}`);
    process.exit(1);
  }
  console.log(`✅ Backup Completed Successfully! File size: ${(fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)} MB`);
});
