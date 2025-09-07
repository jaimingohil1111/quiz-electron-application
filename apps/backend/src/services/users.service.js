// server/services/users.service.js
const usersRepo = require('../repo/users.repo');

exports.getById = async (id) => {
  return usersRepo.getById(id);
};

// Only allow updating the "name" field for self-profile
exports.updateName = async (id, name) => {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    const err = new Error('Name must be at least 2 characters');
    err.status = 400;
    throw err;
  }
  return usersRepo.updateName(id, name.trim());
};
