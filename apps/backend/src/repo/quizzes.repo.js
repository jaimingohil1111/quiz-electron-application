const { getDb } = require('./db');

function listPublished({ q, category, difficulty, limit = 20, offset = 0 }) {
    const db = getDb();
    let sql = `SELECT id, title, slug, description, category, difficulty, tags, time_limit_sec, version, created_at, updated_at
             FROM quizzes WHERE status='published'`;
    const params = [];
    if (q) { sql += ` AND title LIKE ?`; params.push(`%${q}%`); }
    if (category) { sql += ` AND category = ?`; params.push(category); }
    if (difficulty) { sql += ` AND difficulty = ?`; params.push(difficulty); }
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    return getDb().prepare(sql).all(...params);
}

function getById(id) {
    const db = getDb();
    return db.prepare(`SELECT * FROM quizzes WHERE id = ?`).get(id);
}

function getBySlug(slug) {
    const db = getDb();
    return db.prepare(`SELECT * FROM quizzes WHERE slug = ?`).get(slug);
}

function create(q) {
    const db = getDb();
    const stmt = db.prepare(`
    INSERT INTO quizzes (title, slug, description, category, difficulty, tags, status, time_limit_sec, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    const info = stmt.run(
        q.title, q.slug, q.description || null, q.category || null, q.difficulty || null,
        q.tags ? JSON.stringify(q.tags) : null,
        q.status || 'draft',
        q.time_limit_sec || null,
        q.version || 1
    );
    return getById(info.lastInsertRowid);
}

function update(id, data) {
    const db = getDb();
    const existing = getById(id);
    if (!existing) return null;
    const merged = {
        ...existing,
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : existing.tags,
    };
    const stmt = db.prepare(`
    UPDATE quizzes SET
      title=?, slug=?, description=?, category=?, difficulty=?, tags=?, status=?, time_limit_sec=?, version=?, updated_at=datetime('now')
    WHERE id=?
  `);
    stmt.run(
        merged.title, merged.slug, merged.description, merged.category, merged.difficulty,
        merged.tags, merged.status, merged.time_limit_sec, merged.version, id
    );
    return getById(id);
}

function remove(id) {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM quizzes WHERE id=?');
    const info = stmt.run(id);
    return info.changes > 0;
}

module.exports = { listPublished, getById, getBySlug, create, update, remove };
