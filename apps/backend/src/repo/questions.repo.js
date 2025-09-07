const { getDb } = require('./db');

function listByQuiz(quizId) {
  const db = getDb();
  return db.prepare(`
    SELECT id, quiz_id, type, text, options, correct, explanation, tags, difficulty, position, created_at
    FROM questions WHERE quiz_id = ? ORDER BY COALESCE(position, id) ASC
  `).all(Number(quizId));
}

function getById(id) {
  return getDb().prepare(`SELECT * FROM questions WHERE id = ?`).get(Number(id));
}

function create(q) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO questions (quiz_id, type, text, options, correct, explanation, tags, difficulty, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    q.quiz_id,
    q.type,                                  // 'mcq' | 'tf' | 'fib'
    q.text,
    q.options ? JSON.stringify(q.options) : null,
    q.correct ? JSON.stringify(q.correct) : null,
    q.explanation || null,
    q.tags ? JSON.stringify(q.tags) : null,
    q.difficulty || null,
    q.position || null
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
    options: data.options ? JSON.stringify(data.options) : existing.options,
    correct: data.correct ? JSON.stringify(data.correct) : existing.correct,
    tags: data.tags ? JSON.stringify(data.tags) : existing.tags
  };

  const stmt = db.prepare(`
    UPDATE questions SET
      quiz_id=?, type=?, text=?, options=?, correct=?, explanation=?, tags=?, difficulty=?, position=?
    WHERE id=?
  `);
  stmt.run(
    merged.quiz_id,
    merged.type,
    merged.text,
    merged.options,
    merged.correct,
    merged.explanation,
    merged.tags,
    merged.difficulty,
    merged.position,
    Number(id)
  );
  return getById(id);
}

function remove(id) {
  const info = getDb().prepare(`DELETE FROM questions WHERE id = ?`).run(Number(id));
  return info.changes > 0;
}

module.exports = { listByQuiz, getById, create, update, remove };
