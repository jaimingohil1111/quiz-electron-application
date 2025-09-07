const { getDb } = require('./db');

function findByEmail(email) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function createUser({ name, email, password_hash, role }) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(name, email, password_hash, role);
  return { id: info.lastInsertRowid, name, email, role };
}

// These promise-based wrappers are incorrect for better-sqlite3, which is synchronous.
// The functions below will be updated to use the synchronous API correctly.
const get = (sql, params = []) => new Promise((resolve, reject) => {
  try { resolve(getDb().prepare(sql).get(params)); } catch (e) { reject(e); }
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  try {
    const info = getDb().prepare(sql).run(params);
    resolve({ changes: info.changes, lastID: info.lastInsertRowid });
  } catch (e) { reject(e); }
});

// Shape response consistently (no password hash)
const pickPublic = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const getById = (id) => {
  const row = getDb().prepare(
    `SELECT id, name, email, role, created_at
       FROM users
      WHERE id = ?`
  ).get(id);
  return pickPublic(row);
};

const updateName = (id, name) => {
  const info = getDb().prepare(
    `UPDATE users
        SET name = ?
      WHERE id = ?`
  ).run(name, id);
  return info.changes > 0;
};


module.exports = { findByEmail, createUser, getById, updateName };
