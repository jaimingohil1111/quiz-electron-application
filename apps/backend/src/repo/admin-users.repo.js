const { getDb } = require('./db');

function list({ q, role, limit = 20, offset = 0 }) {
    const db = getDb();
    let sql = `SELECT id, name, email, role, created_at FROM users WHERE 1=1`;
    const params = [];
    if (q) { sql += ` AND (name LIKE ? OR email LIKE ?)`; params.push(`%${q}%`, `%${q}%`); }
    if (role) { sql += ` AND role = ?`; params.push(role); }
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    return db.prepare(sql).all(...params);
}

function get(id) {
    return getDb().prepare(`SELECT id, name, email, role, created_at FROM users WHERE id = ?`).get(Number(id));
}

function getRawById(id) {
    return getDb().prepare(`SELECT * FROM users WHERE id = ?`).get(Number(id));
}

function create({ name, email, password_hash, role }) {
    const db = getDb();
    const info = db.prepare(`
    INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)
  `).run(name, email, password_hash, role);
    return get(info.lastInsertRowid);
}

function update(id, { name, role }) {
    const db = getDb();
    const existing = getRawById(id);
    if (!existing) return null;
    const merged = { ...existing, name: name ?? existing.name, role: role ?? existing.role };
    db.prepare(`UPDATE users SET name=?, role=? WHERE id=?`)
        .run(merged.name, merged.role, Number(id));
    return get(id);
}

function remove(id) {
    const info = getDb().prepare(`DELETE FROM users WHERE id=?`).run(Number(id));
    return info.changes > 0;
}

function updatePassword(id, hash) {
    const db = getDb();
    const info = db.prepare(`UPDATE users SET password_hash=? WHERE id=?`).run(hash, Number(id));
    return info.changes > 0;
}

function findByEmail(email) {
    return getDb().prepare(`SELECT * FROM users WHERE email=?`).get(email);
}

module.exports = { list, get, create, update, remove, updatePassword, findByEmail };
