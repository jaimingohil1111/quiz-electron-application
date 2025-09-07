const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { createUserSchema, updateUserSchema, changePasswordSchema, listUsersQuerySchema, updateSelfSchema } = require('../validators/users.schemas');
const c = require('../controllers/users.controller');

// ---------- Self profile (any authenticated user) ----------
router.get('/me', auth, c.me);                                       // get my profile
router.put('/me', auth, validate(updateSelfSchema), c.updateMe);     // update my name ONLY

// Admin-only user management
router.get('/', auth, requireRole('admin'), validate(listUsersQuerySchema, 'query'), c.list);
router.get('/:id', auth, requireRole('admin'), c.getOne);
router.post('/', auth, requireRole('admin'), validate(createUserSchema), c.create);
router.put('/:id', auth, requireRole('admin'), validate(updateUserSchema), c.update);
router.post('/set-password', auth, requireRole('admin'), validate(changePasswordSchema), c.setPassword);
router.delete('/:id', auth, requireRole('admin'), c.destroy);

module.exports = router;
