const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { startSchema, answerSchema, submitSchema } = require('../validators/attempts.schemas');
const c = require('../controllers/attempts.controller');

// All attempts endpoints require a logged-in user (user or admin)
router.get('/', auth, c.listMine);          // list my attempts
router.get('/:id/summary', auth, c.getSummary);         // show summary
router.post('/start', auth, validate(startSchema), c.start);       // start attempt
router.post('/answer', auth, validate(answerSchema), c.answer);     // save/update an answer
router.post('/submit', auth, validate(submitSchema), c.submit);     // finalize & score

module.exports = router;
