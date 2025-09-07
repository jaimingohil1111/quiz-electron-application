const { verifyAccess } = require('../utils/tokens');

function auth(req, res, next) {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    try {
        const payload = verifyAccess(token);
        req.user = payload; // { id, role, email }
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid/expired token' });
    }
}

module.exports = { auth };
