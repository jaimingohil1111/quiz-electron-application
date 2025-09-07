const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { createQuizSchema, updateQuizSchema } = require('../validators/quizzes.schemas');
const c = require('../controllers/quizzes.controller');

// Public (auth required for your app? choose policy)
// If you want only logged-in users to see quizzes, add `auth` here.
router.get('/', c.getList);
router.get('/:idOrSlug', c.getOne);
router.get('/:id/questions', auth, c.getPublicQuestions);

// Admin-only CRUD
router.post('/', auth, requireRole('admin'), validate(createQuizSchema), c.create);
router.put('/:id', auth, requireRole('admin'), validate(updateQuizSchema), c.update);
router.delete('/:id', auth, requireRole('admin'), c.destroy);

module.exports = router;
