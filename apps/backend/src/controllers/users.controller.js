const svc = require('../services/admin-users.service');
const usersService = require('../services/users.service');

async function create(req, res, next) {
  try { res.status(201).json(await svc.createUser(req.body)); }
  catch (e) { next(e); }
}

function list(req, res, next) {
  try { res.json({ items: svc.listUsers(req.query) }); }
  catch (e) { next(e); }
}

function getOne(req, res, next) {
  try { res.json(svc.getUser(req.params.id)); }
  catch (e) { next(e); }
}

function update(req, res, next) {
  try { res.json(svc.updateUser(req.params.id, req.body)); }
  catch (e) { next(e); }
}

async function setPassword(req, res, next) {
  try { res.json(await svc.changePassword(req.body)); }
  catch (e) { next(e); }
}

function destroy(req, res, next) {
  try { res.json(svc.deleteUser(req.params.id)); }
  catch (e) { next(e); }
}

// ---------- Self profile (any authenticated user) ----------
async function me (req, res, next) {
  try {
    const user = await usersService.getById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) { next(err); }
};

async function updateMe (req, res, next) {
  try {
    const { name } = req.body; // validated by updateSelfSchema
    await usersService.updateName(req.user.id, name);
    const updated = await usersService.getById(req.user.id);
    return res.json(updated);
  } catch (err) { next(err); }
};

module.exports = { create, list, getOne, update, setPassword, destroy, me, updateMe };
