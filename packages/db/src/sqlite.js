// packages/db/src/sqlite.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Load env
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'quiz.sqlite');
const MIGRATIONS_DIR = process.env.MIGRATIONS_DIR || path.join(__dirname, 'migrations');
const SEED_DIR = process.env.SEED_DIR || path.join(__dirname, 'seed');

const JOURNAL = process.env.DB_PRAGMA_JOURNAL_MODE || 'WAL';
const FK = (process.env.DB_PRAGMA_FOREIGN_KEYS || 'ON').toUpperCase() === 'ON';

function openDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma(`journal_mode = ${JOURNAL}`);
  db.pragma(`foreign_keys = ${FK ? 'ON' : 'OFF'}`);
  return db;
}

function ensureMeta(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _schema_meta (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      schema_version INTEGER NOT NULL DEFAULT 0
    );
    INSERT INTO _schema_meta (id, schema_version)
    SELECT 1, 0 WHERE NOT EXISTS (SELECT 1 FROM _schema_meta WHERE id = 1);
  `);
}

function getCurrentVersion(db) {
  const row = db.prepare('SELECT schema_version FROM _schema_meta WHERE id = 1').get();
  return row ? row.schema_version : 0;
}

function setVersion(db, v) {
  db.prepare('UPDATE _schema_meta SET schema_version = ? WHERE id = 1').run(v);
}

function listMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => /^\d{4}_.*\.sql$/.test(f))
    .sort();
  return files.map((f, idx) => ({ file: f, version: idx + 1, full: path.join(MIGRATIONS_DIR, f) }));
}

function applyMigrations() {
  const db = openDb();
  ensureMeta(db);
  const current = getCurrentVersion(db);
  const all = listMigrationFiles();
  const pending = all.filter(m => m.version > current);

  if (pending.length === 0) {
    console.log(`No migrations to run. Current version: ${current}`);
    db.close();
    return;
  }

  const trx = db.transaction(() => {
    for (const m of pending) {
      const sql = fs.readFileSync(m.full, 'utf8');
      console.log(`Applying migration v${m.version}: ${m.file}`);
      db.exec(sql);
      setVersion(db, m.version);
    }
  });

  trx();
  console.log(`Migrations complete. Now at version: ${getCurrentVersion(db)}`);
  db.close();
}

function seedDev() {
  const db = openDb();
  const seedFile = path.join(SEED_DIR, 'seed-dev.sql');
  if (!fs.existsSync(seedFile)) {
    console.log('No seed-dev.sql found. Skipping.');
    db.close();
    return;
  }
  const sql = fs.readFileSync(seedFile, 'utf8');
  db.exec(sql);
  console.log('Seed data inserted.');
  db.close();
}

// CLI
const cmd = process.argv[2];
if (cmd === 'migrate') applyMigrations();
else if (cmd === 'seed') seedDev();
else {
  console.log('Usage: node src/sqlite.js [migrate|seed]');
}

// Export for programmatic usage (optional in backend)
module.exports = {
  applyMigrations,
  seedDev,
  openDb
};
