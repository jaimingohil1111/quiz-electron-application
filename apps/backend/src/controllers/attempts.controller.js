const svc = require('../services/attempts.service');

function start(req, res, next) { try {
  const { quizId } = req.body; const att = svc.start({ userId: req.user.id, quizId });
  res.status(201).json(att);
} catch (e) { next(e); } }

function answer(req, res, next) { try {
  const { attemptId, qId, answer, timeMs, flagged } = req.body;
  const out = svc.answer({ attemptId, qId, answer, timeMs, flagged, userId: req.user.id });
  res.json(out);
} catch (e) { next(e); } }

function submit(req, res, next) { try {
  const { attemptId } = req.body;
  const out = svc.submit({ attemptId, userId: req.user.id });
  res.json(out);
} catch (e) { next(e); } }

function listMine(req, res, next) { try {
  const { limit, offset } = req.query;
  const items = svc.listMine(req.user.id, {
    limit: limit ? Number(limit) : 20,
    offset: offset ? Number(offset) : 0
  });
  res.json({ items });
} catch (e) { next(e); } }

// NEW
function getSummary(req, res, next) { try {
  const { id } = req.params;
  const out = svc.summarizeAttempt({ attemptId: Number(id), userId: req.user.id });
  res.json(out);
} catch (e) { next(e); } }

module.exports = { start, answer, submit, listMine, getSummary };
