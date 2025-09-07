const bcrypt = require('bcrypt');
const { findByEmail, createUser } = require('../repo/users.repo');
const { signAccessToken, signRefreshToken } = require('../utils/tokens');

async function signup({ name, email, password, role = 'user' }) {
    const exists = findByEmail(email);
    if (exists) {
        const err = new Error('Email already in use'); err.status = 400; throw err;
    }
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const hash = await bcrypt.hash(password, saltRounds);
    const user = createUser({ name, email, password_hash: hash, role });
    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id, email: user.email, role: user.role });
    return { user, accessToken, refreshToken };
}

async function login({ email, password }) {
    const user = findByEmail(email);
    if (!user) { const e = new Error('Invalid credentials'); e.status = 401; throw e; }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) { const e = new Error('Invalid credentials'); e.status = 401; throw e; }
    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id, email: user.email, role: user.role });
    return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        accessToken, refreshToken
    };
}

module.exports = { signup, login };
