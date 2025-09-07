const svc = require('../services/questions.service');

function getByQuiz(req, res, next) {
  try {
    const { quizId } = req.params;
    const items = svc.listByQuiz(quizId);
    res.json({ items });
  } catch (e) { next(e); }
}

function getOne(req, res, next) {
  try { res.json(svc.getOne(req.params.id)); }
  catch (e) { next(e); }
}

function create(req, res, next) {
  try { res.status(201).json(svc.createQuestion(req.body)); }
  catch (e) { next(e); }
}

function update(req, res, next) {
  try { res.json(svc.updateQuestion(req.params.id, req.body)); }
  catch (e) { next(e); }
}

function destroy(req, res, next) {
  try { res.json(svc.deleteQuestion(req.params.id)); }
  catch (e) { next(e); }
}

module.exports = { getByQuiz, getOne, create, update, destroy };
