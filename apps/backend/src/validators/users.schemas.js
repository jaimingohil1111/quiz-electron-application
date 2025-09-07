const { z } = require('zod');

const email = z.string().trim().email();
const role = z.enum(['admin', 'user']);

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password: z.string().min(8).max(64),
  role
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  role: role.optional()
}).refine((obj) => Object.keys(obj).length > 0, { message: 'No fields to update' });

const changePasswordSchema = z.object({
  userId: z.number().int().positive(),
  newPassword: z.string().min(8).max(64)
});

const listUsersQuerySchema = z.object({
  q: z.string().optional(),
  role: role.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional()
});

const updateSelfSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name too long'),
});

module.exports = { createUserSchema, updateUserSchema, changePasswordSchema, listUsersQuerySchema, updateSelfSchema };
