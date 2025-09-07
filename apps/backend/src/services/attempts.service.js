const attemptsRepo = require('../repo/attempts.repo');
const questionsRepo = require('../repo/questions.repo');
const quizzesRepo = require('../repo/quizzes.repo');

// helpers (existing)
function normalizeStr(s) { return String(s || '').trim().toLowerCase(); }
function arrayEq(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const A = a.map(normalizeStr).sort();
  const B = b.map(normalizeStr).sort();
  return A.every((v, i) => v === B[i]);
}

// NEW: reusable summarizer (can be called at submit-time and later)
function summarizeAttemptCore(att, questions) {
  const responses = att.responses ? JSON.parse(att.responses) : [];
  let correctCount = 0;
  const byTag = {};        // tag -> { correct, total }
  const byDifficulty = {}; // diff -> { correct, total }

  const markBucket = (map, key, isCorrect) => {
    if (!key) return;
    if (!map[key]) map[key] = { correct: 0, total: 0 };
    map[key].total += 1;
    if (isCorrect) map[key].correct += 1;
  };

  for (const q of questions) {
    const resp = responses.find(r => r.qId === q.id);
    const correct = q.correct ? JSON.parse(q.correct) : null;

    let isCorrect = false;
    if (resp) {
      if (q.type === 'mcq') {
        isCorrect = arrayEq(resp.answer, correct);
      } else if (q.type === 'tf' || q.type === 'fib') {
        if (Array.isArray(correct) && correct.length === 1) {
          isCorrect = normalizeStr(resp.answer?.[0]) === normalizeStr(correct[0]);
        }
      }
    }

    if (isCorrect) correctCount++;

    // difficulty bucket
    markBucket(byDifficulty, q.difficulty || 'Unknown', isCorrect);

    // tags bucket
    const tags = q.tags ? JSON.parse(q.tags) : [];
    (tags || []).forEach(tag => markBucket(byTag, tag, isCorrect));
  }

  const total = questions.length || 0;
  const scorePct = total ? Math.round((correctCount / total) * 100) : 0;

  // convert objects -> sorted arrays with accuracy%
  const objToArray = (obj) =>
    Object.entries(obj)
      .map(([label, v]) => ({
        label,
        correct: v.correct,
        total: v.total,
        accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

  return {
    score: scorePct,
    correct: correctCount,
    total,
    byTag: objToArray(byTag),
    byDifficulty: objToArray(byDifficulty)
  };
}

function start({ userId, quizId }) {
  const quiz = quizzesRepo.getById(Number(quizId));
  if (!quiz || quiz.status !== 'published') {
    const e = new Error('Quiz not available'); e.status = 404; throw e;
  }
  return attemptsRepo.startAttempt({ user_id: userId, quiz_id: Number(quizId) });
}

function answer({ attemptId, qId, answer, timeMs = 0, flagged = false, userId }) {
  const att = attemptsRepo.getById(Number(attemptId));
  if (!att) { const e = new Error('Attempt not found'); e.status = 404; throw e; }
  if (att.user_id !== userId) { const e = new Error('Forbidden'); e.status = 403; throw e; }
  if (att.submitted_at) { const e = new Error('Already submitted'); e.status = 400; throw e; }

  const responses = att.responses ? JSON.parse(att.responses) : [];
  const idx = responses.findIndex(r => r.qId === Number(qId));
  const payload = { qId: Number(qId), answer, timeMs, flagged: !!flagged };

  if (idx >= 0) responses[idx] = payload;
  else responses.push(payload);

  const saved = attemptsRepo.updateResponses(Number(attemptId), JSON.stringify(responses));
  return { ok: true, attempt: saved };
}

// UPDATED: uses summarizer and returns breakdowns
function submit({ attemptId, userId }) {
  const att = attemptsRepo.getById(Number(attemptId));
  if (!att) { const e = new Error('Attempt not found'); e.status = 404; throw e; }
  if (att.user_id !== userId) { const e = new Error('Forbidden'); e.status = 403; throw e; }
  if (att.submitted_at) { const e = new Error('Already submitted'); e.status = 400; throw e; }

  const questions = questionsRepo.listByQuiz(att.quiz_id);
  if (!(questions && questions.length)) { const e = new Error('No questions'); e.status = 400; throw e; }

  const summary = summarizeAttemptCore(att, questions);
  const saved = attemptsRepo.submitAttempt(Number(attemptId), summary.score);

  return { attempt: saved, summary };
}

// NEW: API-facing summarizer (for reloading results page later)
function summarizeAttempt({ attemptId, userId }) {
  const att = attemptsRepo.getById(Number(attemptId));
  if (!att) { const e = new Error('Attempt not found'); e.status = 404; throw e; }
  if (att.user_id !== userId) { const e = new Error('Forbidden'); e.status = 403; throw e; }

  const questions = questionsRepo.listByQuiz(att.quiz_id);
  const summary = summarizeAttemptCore(att, questions);
  return { attempt: att, summary };
}

function listMine(userId, paging) { return attemptsRepo.listByUser(userId, paging); }

module.exports = { start, answer, submit, summarizeAttempt, listMine };
