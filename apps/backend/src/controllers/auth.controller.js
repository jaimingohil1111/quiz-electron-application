const { signup, login } = require('../services/auth.service');
const { verifyRefresh, signAccessToken } = require('../utils/tokens');

async function postSignup(req, res, next) {
    try {
        console.log(req.body);
        const { name, email, password, role } = req.body;
        const data = await signup({ name, email, password, role });
        res.status(201).json(data);
    } catch (e) { next(e); }
}

async function postLogin(req, res, next) {
    try {
        const { email, password } = req.body;
        const data = await login({ email, password });
        res.json(data);
    } catch (e) { next(e); }
}

function postRefresh(req, res, next) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: 'Missing refreshToken' });
        const payload = verifyRefresh(refreshToken);
        const accessToken = signAccessToken({ id: payload.id, email: payload.email, role: payload.role });
        res.json({ accessToken });
    } catch (e) { next(e); }
}

module.exports = { postSignup, postLogin, postRefresh };
