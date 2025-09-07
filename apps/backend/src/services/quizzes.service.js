const repo = require('../repo/quizzes.repo');

function listPublished(filters) {
    return repo.listPublished(filters);
}
function getPublic(idOrSlug) {
    const byId = Number(idOrSlug) == idOrSlug ? repo.getById(Number(idOrSlug)) : null;
    const quiz = byId || repo.getBySlug(idOrSlug);
    if (!quiz || quiz.status !== 'published') {
        const e = new Error('Quiz not found'); e.status = 404; throw e;
    }
    return quiz;
}
function createQuiz(data) { return repo.create(data); }
function updateQuiz(id, data) {
    const q = repo.update(Number(id), data);
    if (!q) { const e = new Error('Quiz not found'); e.status = 404; throw e; }
    return q;
}
function deleteQuiz(id) {
    const ok = repo.remove(Number(id));
    if (!ok) { const e = new Error('Quiz not found'); e.status = 404; throw e; }
    return { ok: true };
}

module.exports = { listPublished, getPublic, createQuiz, updateQuiz, deleteQuiz };
