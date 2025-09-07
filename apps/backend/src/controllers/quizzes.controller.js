const svc = require('../services/quizzes.service');
const questionsRepo = require('../repo/questions.repo');

function getList(req, res, next) {
    try {
        const { q, category, difficulty, limit, offset } = req.query;
        const items = svc.listPublished({
            q, category, difficulty,
            limit: limit ? Number(limit) : 20,
            offset: offset ? Number(offset) : 0
        });
        res.json({ items });
    } catch (e) { next(e); }
}

function getOne(req, res, next) {
    try {
        const { idOrSlug } = req.params;
        const quiz = svc.getPublic(idOrSlug);
        res.json(quiz);
    } catch (e) { next(e); }
}

function create(req, res, next) {
    try {
        const q = svc.createQuiz(req.body);
        res.status(201).json(q);
    } catch (e) { next(e); }
}

function update(req, res, next) {
    try {
        const q = svc.updateQuiz(req.params.id, req.body);
        res.json(q);
    } catch (e) { next(e); }
}

function destroy(req, res, next) {
    try {
        const out = svc.deleteQuiz(req.params.id);
        res.json(out);
    } catch (e) { next(e); }
}

function getPublicQuestions(req, res, next) {
    try {
        const quizId = Number(req.params.id);
        const quiz = svc.getPublic(quizId); // will 404 if not published
        const items = questionsRepo.listByQuiz(quiz.id).map(q => ({
            id: q.id,
            type: q.type,
            text: q.text,
            options: q.options ? JSON.parse(q.options) : null,
            tags: q.tags ? JSON.parse(q.tags) : [],
            difficulty: q.difficulty,
            position: q.position
            // NOTE: no 'correct' here
        }));
        res.json({ items });
    } catch (e) { next(e); }
}

module.exports = { getList, getOne, create, update, destroy, getPublicQuestions };
