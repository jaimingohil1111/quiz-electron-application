const { getDb } = require('./db');

function getById(id) {
  return getDb().prepare(`SELECT * FROM attempts WHERE id=?`).get(Number(id));
}

function startAttempt({ user_id, quiz_id }) {
  const db = getDb();
  const info = db.prepare(`
    INSERT INTO attempts (user_id, quiz_id, responses, score)
    VALUES (?, ?, '[]', NULL)
  `).run(user_id, quiz_id);
  return getById(info.lastInsertRowid);
}

function updateResponses(id, responsesJson) {
  const db = getDb();
  db.prepare(`UPDATE attempts SET responses=? WHERE id=?`).run(responsesJson, Number(id));
  return getById(id);
}

function submitAttempt(id, score) {
  const db = getDb();
  db.prepare(`
    UPDATE attempts
    SET score = ?, submitted_at = datetime('now')
    WHERE id = ?
  `).run(score, Number(id));
  return getById(id);
}

function listByUser(userId, { limit = 20, offset = 0 } = {}) {
  return getDb().prepare(`
    SELECT * FROM attempts WHERE user_id=? ORDER BY started_at DESC LIMIT ? OFFSET ?
  `).all(Number(userId), limit, offset);
}

module.exports = { getById, startAttempt, updateResponses, submitAttempt, listByUser };
