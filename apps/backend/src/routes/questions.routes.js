const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { createQuestionSchema, updateQuestionSchema } = require('../validators/questions.schemas');
const c = require('../controllers/questions.controller');

// List all questions for a quiz (admin-only)
router.get('/quiz/:quizId', auth, requireRole('admin'), c.getByQuiz);

// Get single question (admin-only)
router.get('/:id', auth, requireRole('admin'), c.getOne);

// Admin CRUD
router.post('/', auth, requireRole('admin'), validate(createQuestionSchema), c.create);
router.put('/:id', auth, requireRole('admin'), validate(updateQuestionSchema), c.update);
router.delete('/:id', auth, requireRole('admin'), c.destroy);

module.exports = router;
