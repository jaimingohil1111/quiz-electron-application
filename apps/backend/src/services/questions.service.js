const repo = require('../repo/questions.repo');

function listByQuiz(quizId) {
  return repo.listByQuiz(quizId);
}
function getOne(id) {
  const q = repo.getById(id);
  if (!q) { const e = new Error('Question not found'); e.status = 404; throw e; }
  return q;
}
function createQuestion(payload) { return repo.create(payload); }
function updateQuestion(id, payload) {
  const q = repo.update(id, payload);
  if (!q) { const e = new Error('Question not found'); e.status = 404; throw e; }
  return q;
}
function deleteQuestion(id) {
  const ok = repo.remove(id);
  if (!ok) { const e = new Error('Question not found'); e.status = 404; throw e; }
  return { ok: true };
}

module.exports = { listByQuiz, getOne, createQuestion, updateQuestion, deleteQuestion };
