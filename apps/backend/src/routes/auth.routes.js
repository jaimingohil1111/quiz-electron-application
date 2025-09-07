const router = require('express').Router();
const { postSignup, postLogin, postRefresh } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { signupSchema, loginSchema, refreshSchema } = require('../validators/auth.schemas');

router.post('/signup', validate(signupSchema), postSignup);
router.post('/login', validate(loginSchema), postLogin);
router.post('/refresh', validate(refreshSchema), postRefresh);

module.exports = router;
