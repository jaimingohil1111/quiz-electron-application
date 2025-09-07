const bcrypt = require('bcrypt');
const repo = require('../repo/admin-users.repo');

async function createUser({ name, email, password, role }) {
  const exists = repo.findByEmail(email);
  if (exists) { const e = new Error('Email already in use'); e.status = 400; throw e; }
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  const hash = await bcrypt.hash(password, saltRounds);
  return repo.create({ name, email, password_hash: hash, role });
}

function listUsers(filters) { return repo.list(filters); }
function getUser(id) {
  const u = repo.get(id);
  if (!u) { const e = new Error('User not found'); e.status = 404; throw e; }
  return u;
}

function updateUser(id, data) {
  const u = repo.update(id, data);
  if (!u) { const e = new Error('User not found'); e.status = 404; throw e; }
  return u;
}

async function changePassword({ userId, newPassword }) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  const hash = await bcrypt.hash(newPassword, saltRounds);
  const ok = repo.updatePassword(userId, hash);
  if (!ok) { const e = new Error('User not found'); e.status = 404; throw e; }
  return { ok: true };
}

function deleteUser(id) {
  const ok = repo.remove(id);
  if (!ok) { const e = new Error('User not found'); e.status = 404; throw e; }
  return { ok: true };
}

module.exports = { createUser, listUsers, getUser, updateUser, changePassword, deleteUser };
