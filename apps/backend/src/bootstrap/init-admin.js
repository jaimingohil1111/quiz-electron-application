require('dotenv').config();
const bcrypt = require('bcrypt');
const { getDb } = require('../repo/db');

(async () => {
    const name = process.env.ADMIN_BOOTSTRAP_NAME || 'Admin';
    const email = process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'admin12345';
    const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
        console.log('[init-admin] Admin already exists:', email);
        process.exit(0);
    }

    const hash = await bcrypt.hash(password, rounds);
    const stmt = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, email, hash, 'admin');
    console.log('[init-admin] Created admin id:', info.lastInsertRowid, 'email:', email);
    process.exit(0);
})();
