import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyDatabaseState,
  connectWithRetry,
  initializeDatabase
} from '../src/scripts/deployInitDb';
import { seedHierarchy } from '../src/scripts/seedHierarchy';

function clientFor(state: { has_application_tables: boolean; has_migration_table: boolean }) {
  return {
    connect: async () => {},
    query: async (sql: string) => ({
      rows: sql.includes('to_regclass') ? [state] : [{ exists: false }]
    }),
    end: async () => {}
  };
}

test('fresh initialization applies the version-controlled migration', async () => {
  const commands: string[][] = [];
  await initializeDatabase(clientFor({ has_application_tables: false, has_migration_table: false }), (args) => commands.push(args));
  assert.deepEqual(commands, [['migrate', 'deploy']]);
});

test('repeat initialization uses the managed migration path', async () => {
  const commands: string[][] = [];
  await initializeDatabase(clientFor({ has_application_tables: true, has_migration_table: true }), (args) => commands.push(args));
  assert.deepEqual(commands, [['migrate', 'deploy']]);
});

test('an unavailable database fails after the requested retry bound', async () => {
  const client = {
    connect: async () => { throw new Error('connection refused'); },
    query: async () => ({ rows: [] }),
    end: async () => {}
  };
  await assert.rejects(() => connectWithRetry(client, 1), /Could not connect to PostgreSQL after 1 attempts/);
});

test('an existing schema without migration history requires approval', async () => {
  const previous = process.env.DB_INIT_APPROVE_BASELINE;
  delete process.env.DB_INIT_APPROVE_BASELINE;
  try {
    await assert.rejects(
      () => initializeDatabase(clientFor({ has_application_tables: true, has_migration_table: false }), () => {}),
      /no Prisma migration history/
    );
  } finally {
    if (previous === undefined) delete process.env.DB_INIT_APPROVE_BASELINE;
    else process.env.DB_INIT_APPROVE_BASELINE = previous;
  }
});

test('database state classification distinguishes fresh, managed, and unmanaged schemas', () => {
  assert.equal(classifyDatabaseState({ hasApplicationTables: false, hasMigrationTable: false }), 'fresh');
  assert.equal(classifyDatabaseState({ hasApplicationTables: true, hasMigrationTable: true }), 'managed');
  assert.equal(classifyDatabaseState({ hasApplicationTables: true, hasMigrationTable: false }), 'existing-unmanaged');
});

test('required schema failure remains fatal', async () => {
  const client = clientFor({ has_application_tables: false, has_migration_table: false });
  await assert.rejects(
    () => initializeDatabase(client, () => { throw new Error('permission denied'); }),
    /permission denied/
  );
});

test('optional tuning failure does not turn required initialization into failure', async () => {
  const client = {
    ...clientFor({ has_application_tables: false, has_migration_table: false }),
    query: async (sql: string) => {
      if (sql.includes('CREATE EXTENSION')) throw new Error('extension permission denied');
      return { rows: sql.includes('to_regclass') ? [{ has_application_tables: false, has_migration_table: false }] : [{ exists: false }] };
    }
  };
  await assert.doesNotReject(() => initializeDatabase(client, () => {}));
});

test('hierarchy seed failure remains fatal', async () => {
  const failingDatabase = {
    block: {
      findFirst: async () => null,
      create: async () => { throw new Error('seed permission denied'); }
    },
    gramPanchayat: {},
    village: {},
    $disconnect: async () => {}
  };
  await assert.rejects(() => seedHierarchy(failingDatabase as never), /seed permission denied/);
});
